import { 
  createContext, 
  use,
  useCallback, 
  useEffect, 
  useReducer,
  useRef, 
} from "react";

import { BACKEND_BASE_URL } from "@/constants";

const SETTINGS_ROUTE = `${BACKEND_BASE_URL}/api/settings`;

const DEFAULTS = {
  fahrenheitTemps: true,
  memoryWarnPercent: 85,
  memoryUrgentPercent: 95,
  loading: false,
};

// TODO: Load settings from persistent storage later, for now use defaults
function loadSettings() {
  // return DEFAULTS;
  return { ...DEFAULTS, loading: true };
}

function reducer(state, action) {
  switch (action.type) {
    case "set":
      return {...state, [action.key]: action.value };
    case "toggle":
      return {...state, [action.key]: !state[action.key]};
    // TODO: Activate (and potentially rename data) when switching to SQLite
    case "hydrate":
      return {...state, ...action.data, loading: false};
    case "reset":
      return { ...DEFAULTS, loading: false};
    default:
      throw new Error(`[SettingsContext::reducer] Unknown action: ${action.type}`);
  }
}

const SettingsContext = createContext(null);
const SettingsDispatchContext = createContext(null);
const SettingsActionContext = createContext(null);

export function SettingsProvider({ children }) {
  const [ settings, dispatch ] = useReducer(reducer, undefined, loadSettings);

  const settingsRef = useRef(settings);
  
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    fetch(SETTINGS_ROUTE)
      .then(res => res.json())
      .then(data => dispatch({ type: "hydrate", data }))
      .catch(err => console.error("[SettingsContext::useEffect] Failed to load settings:", err));
  }, [])

  const setSetting = (key, value) => {
    const previousValue = settingsRef.current[key];
    
    if (previousValue === value) {
      return;
    }

    dispatch({ type: "set", key, value });

    // update in the DB, reverting to previousValue on failure
    fetch(SETTINGS_ROUTE, { 
      method: "PATCH", 
      body: JSON.stringify({ [key]: value }),
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => dispatch({ type: "hydrate", data }))
      .catch(err => {
        console.error(`[SettingsContext::setSetting] Failed to set ${key} to ${value}:`, err);
        dispatch({type: "set", key, value: previousValue});
      });
  };

  const toggleSetting = (key) => setSetting(key, !settingsRef.current[key]);

  // make state changes with dispatch(), or with action methods from SettingsActionsContext:
  // - dispatch({ type: "set", key: "fahrenheitTemps", value: true });
  // - setSetting("memoryWarnPercent", 80);

  return (
    <SettingsContext value={settings}>
      <SettingsDispatchContext value={dispatch}>
        <SettingsActionContext value={{setSetting, toggleSetting}}>
          {children}
        </SettingsActionContext>
      </SettingsDispatchContext>
    </SettingsContext>
  );
}

export const useSettings = () => use(SettingsContext);
export const useSettingsDispatch = () => use(SettingsDispatchContext);
export const useSettingsActions = () => use(SettingsActionContext);
