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
  This hook is the new way of handling screen state - the entire state machine lives here.

  Every transition is one place you can read, log, or write a test against.
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