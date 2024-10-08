import React, { useEffect } from 'react';

import styles from "./ScreenGroup.module.scss";

import Screen from '../Screen/Screen';

function ScreenGroup ({
  // metadata object for each screen group
  metaData,
  // array of screen objects
  screens,
}) {

  useEffect(() => {

    // TODO: Remove debug logging
    console.log("ScreenGroup::UEF::metaData:", metaData);

    console.log("ScreenGroup::UEF::screens:", screens);
  }, []);


  const screenJSX = screens ? (
    <div className={styles.screens}> 
      {
        Object.keys(screens).map((screenIndex) => (
          <Screen
            key={screenIndex}
            screen={screens[screenIndex]}
          />
        ))
      }
    </div>) : (
      <div className={styles["empty-group"]}>
        No screens configured for this group.
      </div>
    );

  const groupName = metaData ? metaData.name : null;

  const groupNameJSX = groupName ? (
    <h1 className={styles.header}>{groupName} Screens</h1>
  ) : null;

  return (
    <div className={styles.group}>
      {groupNameJSX}
      {screenJSX}
    </div>
  ); 
}

export default ScreenGroup;
