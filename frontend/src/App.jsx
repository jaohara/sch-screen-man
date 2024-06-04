import { 
  useEffect,
  useState,
} from 'react'
import styles from './App.module.scss';

import ScreenGroup from './components/ScreenGroup/ScreenGroup';

import { groupMetaData, piConfig } from '../pi-conf.js';

import { UNGROUPED_SCREEN_STRING } from './constants.js';

function debugLog(location, message, loggedData) {
  console.log(`App::${location}::${message}`);

  if (loggedData) {
    console.log(loggedData);
  }
}

function App() {
  const [ screens, setScreens ] = useState(null);
  /*
    - load pi-conf.js
    - parse screen config object into groups of screens
    - pass each group of screens into a ScreenGroup component
  */

  useEffect(() => {
    // parse piConfig into groups of screens and save as screens
    const newScreens = {};

    debugLog("UEF", "piConfig:", piConfig);
    debugLog("UEF", "groupMetaData:", groupMetaData);
    
    piConfig.forEach((screen) => {
      const screenGroup = screen.group ? screen.group : UNGROUPED_SCREEN_STRING;
      
      if (Object.hasOwn(newScreens, screenGroup)) {
        // Do any further processing of the screen config objects here
        newScreens[screenGroup].screens.push(screen);
        return;
      }
      else {
        // create the group
        newScreens[screenGroup] = {};

        // append the screens
        newScreens[screenGroup].screens = [screen];

        const metaDataKey = screen.group;

        // append metadata 
        if (Object.keys(groupMetaData).includes(metaDataKey)){
          newScreens[screenGroup].metaData = groupMetaData[metaDataKey];
        }
      }
    });
    
    debugLog("UEF", "Finished making newScreens, setting screen in state to:", newScreens);

    setScreens(newScreens);
  }, []);

  const screenGroupsJSX = !screens ? null : 
    Object.keys(screens).map((screenGroupName, index) => {
      const currentGroup = screens[screenGroupName];
      console.log("App::screenGroupsJSXMap::currentGroup:", currentGroup);

      return (
        <ScreenGroup
          key={index}
          metaData={currentGroup.metaData}
          // screens={screenGroup}
          screens={currentGroup.screens}
        />
    )});

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <h1>Stoup Screen Manager</h1>
      </div>

      {screenGroupsJSX}
    </div>
  );
}

export default App;
