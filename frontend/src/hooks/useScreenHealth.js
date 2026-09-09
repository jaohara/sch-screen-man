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
  lastRebootDuration: null,
  error: null,
};

/*
  Called by React's useReducer hook. dipatch(action) calls reducer(currentState, action)
*/
function reducer(state, action) {
  switch(action.type) {
    case 'INVALID_ID': {
      return {...initialState, status: STATUS.INVALID };
    }

    // pinging a known host 
    case 'PING_UP': {
      if (state.status === STATUS.REBOOTING) {
        return {
          ...state,
          status: STATUS.ONLINE,
          rebootStartedAt: null,
          lastRebootDuration: state.rebootStartedAt ? action.at - state.rebootStartedAt : 
            state.lastRebootDuration,
          error: null,
        };
      }

      // nothing changed, skip the render
      if (state.status === STATUS.ONLINE) { 
        return state;
      }

      return { ...state, status: STATUS.ONLINE, error: null };
    }

    case 'PING_DOWN': {
      if (state.status === STATUS.REBOOTING) {
        const elapsed = action.at - (state.rebootStartedAt ?? action.at);

        // we're still within the reboot window
        if (elapsed < REBOOT_TIMEOUT) {
          return state;
        }

        return {
          ...state,
          status: STATUS.OFFLINE,
          rebootStartedAt: null,
          error: new Error("Screen did not come back online within the reboot window"),
        };
      }
      
      if (state.status === STATUS.OFFLINE) {
        return state;
      }

      return { ...state, status: STATUS.OFFLINE };
    }

    case 'REBOOT_REQUESTED': {
      return {
        ...state,
        status: STATUS.REBOOTING, 
        rebootStartedAt: null,
        error: action.error,
      };
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

  useEffect(() => {
    if (!Number.isInteger(screenId)) {
      console.error(`useScreenHealth: screenId '${screenId}' is not an integer.`);
      dispatch({ type: 'INVALID_ID' });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;
    let timerId = null;

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
      timerId = setTimeout(tick, POLL_DELAY[next.status]);
    };

    tick();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timerId);
      abortRef.current = null;
    };
  }, [screenId]);

  const reboot = useCallback(async () => {
    if (!Number.isInteger(screenId)) {
      return;
    }

    const at = Date.now();
    dispatch({ type: 'REBOOT_REQUESTED', at });

    try {
      await fetchJson(`${REBOOT_URL}/${screenId}`, {
        signal: abortRef.current?.signal ?? new AbortController().signal,
        timeoutMs: REQUEST_TIMEOUT,
      });
    }
    catch (error) {
      console.error(`Reboot request failed for screen ${screenId}:`, error);
      dispatch({ type: 'REBOOT_FAILED', error });
    }
  }, [screenId]);

  return {
    status: state.status,
    error: state.error,
    lastRebootDuration: state.lastRebootDuration,
    isOnline: state.status === STATUS.ONLINE,
    canReboot: state.status === STATUS.ONLINE,
    reboot,
  };
}
