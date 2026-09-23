import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import {
  BACKEND_BASE_URL,
  PING_ROUTE,
  REBOOT_ROUTE,
  REQUEST_TIMEOUT,        // new: per-request ceiling, e.g. 5000
  PING_INTERVAL_ONLINE,   // new: e.g. 30000 — healthy screens don't need 2s polling
  PING_INTERVAL_OFFLINE,  // new: e.g. 10000
  PING_INTERVAL_REBOOT,   // new: e.g. 2000 — tight only while we're waiting on a boot
  PING_INTERVAL_REBOOT_INITIAL, // initial reboot delay to ensure host's network drops
  REBOOT_TIMEOUT,
} from '../constants';

const PING_URL = `${BACKEND_BASE_URL}${PING_ROUTE}`;
const REBOOT_URL = `${BACKEND_BASE_URL}${REBOOT_ROUTE}`;

export const STATUS = {
  // still waiting to hear back
  UNKNOWN: 'unknown',
  ONLINE: 'online',
  OFFLINE: 'offline',
  REBOOTING: 'rebooting',
  // bad screenId, prevents polling from happening
  INVALID: 'invalid',
};

// map delay times for different statuses
const POLL_DELAY = {
  [STATUS.UNKNOWN]: PING_INTERVAL_OFFLINE,
  [STATUS.ONLINE]: PING_INTERVAL_ONLINE,
  [STATUS.OFFLINE]: PING_INTERVAL_OFFLINE,
  [STATUS.REBOOTING]: PING_INTERVAL_REBOOT,
};

const initialState = {
  status: STATUS.UNKNOWN,
  rebootStartedAt: null,
  hasDroppedOffline: false,
  lastRebootDuration: null,
  error: null,
};

/*
  Called by React's useReducer hook. dipatch(action) calls reducer(currentState, action)
*/
function reducer(state, action) {
  switch(action.type) {
    case 'INVALID_ID': {
      const next = {...initialState, status: STATUS.INVALID };
      console.log(`[useScreenHealth] ${new Date().toISOString()} INVALID_ID: ${state.status} -> ${next.status}`);
      return next;
    }

    // pinging a host that is online
    case 'PING_UP': {
      if (state.status === STATUS.REBOOTING) {
        // The host hasn't actually gone down yet, so a successful ping here
        // doesn't confirm the reboot happened - some hosts (e.g. a Pi Zero W)
        // can take much longer than PING_INTERVAL_REBOOT_INITIAL to drop off
        // the network after the reboot command is issued.
        if (!state.hasDroppedOffline) {
          console.log(`[useScreenHealth] ${new Date().toISOString()} PING_UP: still REBOOTING, host has not dropped offline yet - no change`);
          return state;
        }

        const next = {
          ...state,
          status: STATUS.ONLINE,
          rebootStartedAt: null,
          hasDroppedOffline: false,
          lastRebootDuration: state.rebootStartedAt ? action.at - state.rebootStartedAt :
            state.lastRebootDuration,
          error: null,
        };
        console.log(`[useScreenHealth] ${new Date().toISOString()} PING_UP: ${state.status} -> ${next.status} (reboot completed, duration ${next.lastRebootDuration}ms)`);
        return next;
      }

      // nothing changed, skip the render
      if (state.status === STATUS.ONLINE) {
        return state;
      }

      const next = { ...state, status: STATUS.ONLINE, error: null };
      console.log(`[useScreenHealth] ${new Date().toISOString()} PING_UP: ${state.status} -> ${next.status}`);
      return next;
    }

    // pinging a host that's either rebooting or down
    case 'PING_DOWN': {
      if (state.status === STATUS.REBOOTING) {
        const elapsed = action.at - (state.rebootStartedAt ?? action.at);

        // we're still within the reboot window
        if (elapsed < REBOOT_TIMEOUT) {
          if (state.hasDroppedOffline) {
            console.log(`[useScreenHealth] ${new Date().toISOString()} PING_DOWN: still REBOOTING (elapsed ${elapsed}ms), already marked dropped offline - no change`);
            return state;
          }
          console.log(`[useScreenHealth] ${new Date().toISOString()} PING_DOWN: REBOOTING, host confirmed dropped offline (elapsed ${elapsed}ms)`);
          return { ...state, hasDroppedOffline: true };
        }

        const next = {
          ...state,
          status: STATUS.OFFLINE,
          rebootStartedAt: null,
          hasDroppedOffline: false,
          error: new Error("Screen did not come back online within the reboot window"),
        };
        console.log(`[useScreenHealth] ${new Date().toISOString()} PING_DOWN: ${state.status} -> ${next.status} (reboot window ${REBOOT_TIMEOUT}ms exceeded, elapsed ${elapsed}ms)`);
        return next;
      }

      if (state.status === STATUS.OFFLINE) {
        return state;
      }

      const next = { ...state, status: STATUS.OFFLINE };
      console.log(`[useScreenHealth] ${new Date().toISOString()} PING_DOWN: ${state.status} -> ${next.status}`);
      return next;
    }

    case 'REBOOT_REQUESTED': {
      const next = {
        ...state,
        status: STATUS.REBOOTING,
        rebootStartedAt: action.at,
        hasDroppedOffline: false,
        error: action.error,
      };
      console.log(`[useScreenHealth] ${new Date().toISOString()} REBOOT_REQUESTED: ${state.status} -> ${next.status}`);
      return next;
    }

    case 'REBOOT_FAILED': {
      const next = {
        ...state,
        status: STATUS.OFFLINE,
        rebootStartedAt: null,
        error: action.error,
      };
      console.log(`[useScreenHealth] ${new Date().toISOString()} REBOOT_FAILED: ${state.status} -> ${next.status}`, action.error);
      return next;
    }

    default: {
      return state;
    }
  }
}

async function fetchJson(url, { signal, timeoutMs }) {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;

    try {
      const body = await response.json();

      if (body?.message) {
        message += `: ${body.message}`;
      }
    }
    catch {
      // error body wasn't JSON, we only get the status line
    }

    throw new Error(message);
  }

  // 200 with an empty body shouldn't look like a network failure
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export default function useScreenHealth(screenId) {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  // lets the loop read the current state without it becoming a dependency of itself
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!Number.isInteger(screenId)) {
      console.error(`useScreenHealth: screenId '${screenId}' is not an integer.`);
      dispatch({ type: 'INVALID_ID' });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const tick = async () => {
      let hostIsUp = false;

      try {
        const data = await fetchJson(`${PING_URL}/${screenId}`, {
          signal: controller.signal,
          timeoutMs: REQUEST_TIMEOUT,
        });

        hostIsUp = Boolean(data?.hostIsUp);
      }
      catch (error) {
        if (controller.signal.aborted) {
          // component was unmounted or screenId changed
          return;
        }

        console.warn(`Ping failed for screen ${screenId}:`, error);
      }

      if (cancelled) {
        return;
      }

      const action = {
        type: hostIsUp ? 'PING_UP' : 'PING_DOWN',
        at: Date.now(),
      };

      const next = reducer(stateRef.current, action);
      stateRef.current = next;

      dispatch(action);

      // set recursive timeout call to continually poll
      timerRef.current = setTimeout(tick, POLL_DELAY[next.status]);
    };

    tickRef.current = tick;

    tick();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timerRef.current);
      abortRef.current = null;
      tickRef.current = null;
    };
  }, [screenId]);

  const reboot = useCallback(async () => {
    if (!Number.isInteger(screenId)) {
      return;
    }

    const at = Date.now();
    dispatch({ type: 'REBOOT_REQUESTED', at });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => tickRef.current?.(), PING_INTERVAL_REBOOT_INITIAL);

    try {
      await fetchJson(`${REBOOT_URL}/${screenId}`, {
        signal: abortRef.current?.signal ?? new AbortController().signal,
        // timeoutMs: REQUEST_TIMEOUT,
        timeoutMs: REBOOT_TIMEOUT,
      });
    }
    catch (error) {
      if (abortRef.current?.signal.aborted) {
        // screenId changed or component was unmounted, not a REBOOT_FAILED event
        return;
      }

      console.error(`Reboot request failed for screen ${screenId}:`, error);
      dispatch({ type: 'REBOOT_FAILED', error });
    }
  }, [screenId]);

  return {
    status: state.status,
    error: state.error,
    lastRebootDuration: state.lastRebootDuration,
    isOnline: state.status === STATUS.ONLINE,
    isRebooting: state.status === STATUS.REBOOTING,
    canReboot: state.status === STATUS.ONLINE,
    reboot,
  };
}
