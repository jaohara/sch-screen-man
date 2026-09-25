import { 
  useEffect,
  useState,
} from 'react'
import styles from './App.module.scss';

import { Routes, Route } from "react-router";

import Layout from './layouts/Layout.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import ContentPage from './pages/ContentPage/ContentPage.jsx';
import SchedulePage from './pages/SchedulePage/SchedulePage.jsx';
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx';

import SideBar from './components/SideBar/SideBar.jsx';
import MenuBar from './components/MenuBar/MenuBar.jsx';
import ScreenGroup from './components/ScreenGroup/ScreenGroup';

import { groupMetaData as screenGroupMetaData, piConfig } from '../pi-conf.js';

import { UNGROUPED_SCREEN_STRING } from './constants.js';

function debugLog(location, message, loggedData) {
  console.log(`App::${location}::${message}`);

  if (loggedData) {
    console.log(loggedData);
  }
}

function App() {
  const [ activeScreenGroup, setActiveScreenGroup ] = useState(null);
  const [ screens, setScreens ] = useState(null);

  useEffect(() => {
    // parse piConfig into groups of screens and save as screens
    const newScreens = {};

    debugLog("UEF", "piConfig:", piConfig);
    debugLog("UEF", "groupMetaData:", screenGroupMetaData);
    
    piConfig.forEach((screen, index) => {
      const screenGroup = screen.group ? screen.group : UNGROUPED_SCREEN_STRING;
      
      // append index to screen object to build reboot route
      screen.screenId = index;
      
      if (Object.hasOwn(newScreens, screenGroup)) {
        // Do any further processing of the screen config objects here
        newScreens[screenGroup].screens.push(screen);
        return;
      }
      else {
        // create the group object
        newScreens[screenGroup] = {};

        // create the array for the screens in the group with the current screen added
        newScreens[screenGroup].screens = [screen];

        const metaDataKey = screen.group;

        // append metadata to the screen group
        if (Object.keys(screenGroupMetaData).includes(metaDataKey)){
          newScreens[screenGroup].metaData = screenGroupMetaData[metaDataKey];
        }
      }
    });
    
    debugLog("UEF", "Finished making newScreens, setting screen in state to:", newScreens);

    setScreens(newScreens);
    setActiveScreenGroup(Object.keys(screenGroupMetaData)[0]);
  }, []);

  const currentScreenGroupJSX = activeScreenGroup ? (
    <ScreenGroup
      metaData={screens[activeScreenGroup]?.metaData}
      screens={screens[activeScreenGroup]?.screens}
    />
  ) : (
    <p className={styles["main-container-message"]}>
      Select a group of screens from the menu.
    </p>
  );

  return (
    // <div className={styles.app}>
    //   <SideBar />

    //   {/* <MenuBar 
    //     activeScreenGroup={activeScreenGroup}
    //     screenGroupMetaData={screenGroupMetaData}
    //     setActiveScreenGroup={setActiveScreenGroup}
    //   /> */}

    //   <div className={styles["main-container"]}>
    //     {/* <MenuBar 
    //       activeScreenGroup={activeScreenGroup}
    //       screenGroupMetaData={screenGroupMetaData}
    //       setActiveScreenGroup={setActiveScreenGroup}
    //     />
    //     {currentScreenGroupJSX} */}

    //   </div>
    // </div>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
