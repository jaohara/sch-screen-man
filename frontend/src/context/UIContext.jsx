import { createContext, use, useReducer } from "react";

const DEFAULTS = {
  sidebarOpen: false,
  settingsLocked: false,
};

// TODO: Load ui state from persistent storage later, for now use defaults
function loadUIState() {
  return DEFAULTS;
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

  return (
    <UIStateContext value={uiState}>
      <UIDispatchContext value={dispatch}>{children}</UIDispatchContext>
    </UIStateContext>
  );
}

export const useUIState = () => use(UIStateContext);
export const useUIDispatch = () => use(UIDispatchContext);
