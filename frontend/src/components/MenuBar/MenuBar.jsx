import React from 'react';

import styles from "./MenuBar.module.scss";


function MenuBar ({
  activeScreenGroup,
  screenGroupMetaData,
  setActiveScreenGroup,
}) {

  const testMenuBarButtonJSX = (
    <>
      <li><button className={styles["menu-bar-button"]}>One</button></li>
      <li><button className={styles["menu-bar-button"]}>Two</button></li>
      <li><button className={styles["menu-bar-button"]}>Three</button></li>
      <li><button className={styles["menu-bar-button"]}>Four</button></li>
    </>
  );

  // const menuBarButtonJSX = screenGroupMetaData ? (<li>screenGroupMetaData exists</li>) 
  const menuBarButtonJSX = screenGroupMetaData ? 
    Object.keys(screenGroupMetaData).map((screenGroupKey, index) => {
      const currentScreenGroupMetaData = screenGroupMetaData[screenGroupKey];

      if (!currentScreenGroupMetaData.hidden) {
        return (
          <li>
            <button 
              className={`
                ${styles["menu-bar-button"]} ${
                  screenGroupKey === activeScreenGroup ? styles["active"] : ""
                }  
              `}
              onClick={() => setActiveScreenGroup(screenGroupKey)}
            >
              {currentScreenGroupMetaData["name"]}
            </button>
          </li>
        )
      }
    })
    : testMenuBarButtonJSX;

  return (
    <div className={styles["menu-bar"]}>
      <ul>
        {menuBarButtonJSX}
      </ul>
    </div>
  );
}

export default MenuBar;
