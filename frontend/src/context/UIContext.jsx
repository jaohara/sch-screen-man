import { createContext, use, useEffect, useReducer } from "react";

const DEFAULTS = {
  sidebarOpen: false,
  settingsLocked: false,
};

const STORAGE_KEY = "sch-screen-man:ui-state";

function loadUIState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
  } catch (err) {
    console.warn("[UIContext::loadUIState] Failed to load UI state from localStorage, using defaults.", err);
    return DEFAULTS;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "set":
      return {...state, [action.key]: action.value };
    case "toggle":
      return {...state, [action.key]: !state[action.key]};
    case "reset":
      return DEFAULTS;
    default:
      throw new Error(`[UIContext::reducer] Unknown action: ${action.type}`);
  }
}

const UIStateContext = createContext(null);
const UIDispatchContext = createContext(null);

export function UIStateProvider({ children }) {
  const [ uiState, dispatch ] = useReducer(reducer, undefined, loadUIState);

  // make state changes with dispatch():
  // - dispatch({ type: "set", key: "sidebarOpen", value: true });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uiState));
    } catch (err) {
      console.error("[UIContext::useEffect] Failed to save UI state to localStorage.", err);
    }
  }, [uiState]);

  return (
    <UIStateContext value={uiState}>
      <UIDispatchContext value={dispatch}>{children}</UIDispatchContext>
    </UIStateContext>
  );
}

export const useUIState = () => use(UIStateContext);
export const useUIDispatch = () => use(UIDispatchContext);
