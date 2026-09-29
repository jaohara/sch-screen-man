import { createContext, use, useReducer } from "react";

import { UNGROUPED_SCREEN_STRING } from "@/constants";

// TODO: move to pulling from DB rather than config file
import { groupMetaData, piConfig } from "../../pi-conf";

function loadScreens() {
  // TODO: move from pulling from DB here rather than config file exports
  const screenData = {};
  screenData.screensByGroup = {};
  screenData.groups = groupMetaData;

  piConfig.forEach((screen, index) => {
    const screenGroup = screen.group ? screen.group : UNGROUPED_SCREEN_STRING;

    // appends index to screen object for reboot route
    // TODO: use actual ID when moving to DB approach
    screen.screenId = index;

    if (Object.hasOwn(screenData.screensByGroup, screenGroup)) {
      screenData.screensByGroup[screenGroup].screens.push(screen);
      return;
    }
    else {
      screenData.screensByGroup[screenGroup] = {};
      screenData.screensByGroup[screenGroup].screens = [screen];

      const metaDataKey = screen.group;

      if (Object.keys(groupMetaData).includes(metaDataKey)) {
        screenData.screensByGroup[screenGroup].metaData = groupMetaData[metaDataKey];
      }
    }
  });

  return screenData;
}

function reducer(state, action) {
  switch (action.type) {
    case "set":
      return {...state, [action.key]: action.value};
    default:
      throw new Error(`[ScreensContext::reducer] Unknown action: ${action.type}`);
  }
}

const ScreensContext = createContext(null);
const ScreensDispatchContext = createContext(null);

export function ScreensProvider({ children }) {
  const [ screenData, dispatch ] = useReducer(reducer, undefined, loadScreens);

  return (
    <ScreensContext value={screenData}>
      <ScreensDispatchContext value={dispatch}>{children}</ScreensDispatchContext>
    </ScreensContext>
  );
}

export const useScreens = () => use(ScreensContext);
export const useScreensDispatch = () => use(ScreensDispatchContext);
