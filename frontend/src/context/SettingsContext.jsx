import { createContext, use, useReducer } from "react";

const DEFAULTS = {
  fahrenheitTemps: true,
};

// TODO: Load settings from persistent storage later, for now use defaults
function loadSettings() {
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
      throw new Error(`[SettingsContext::reducer] Unknown action: ${action.type}`);
  }
}

const SettingsContext = createContext(null);
const SettingsDispatchContext = createContext(null);

export function SettingsProvider({ children }) {
  const [ settings, dispatch ] = useReducer(reducer, undefined, loadSettings);

  // make state changes with dispatch():
  // - dispatch({ type: "set", key: "fahrenheitTemps", value: true });

  return (
    <SettingsContext value={settings}>
      <SettingsDispatchContext value={dispatch}>{children}</SettingsDispatchContext>
    </SettingsContext>
  );
}

export const useSettings = () => use(SettingsContext);
export const useSettingsDispatch = () => use(SettingsDispatchContext);
