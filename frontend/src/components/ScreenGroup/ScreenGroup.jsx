import { useEffect } from 'react';

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

  return (
    <div className={styles.group}>
      <div className={styles.screens}>
        {
          screens ? Object.keys(screens).map((screenIndex) => (
            <Screen
              key={screens[screenIndex].screenId}
              screen={screens[screenIndex]}
            />
          )) : 
          (
            <div className={styles["empty-group"]}>
              No screens configured for this group.
            </div>
          )
        }
      </div>
    </div>
  ); 
}

export default ScreenGroup;
