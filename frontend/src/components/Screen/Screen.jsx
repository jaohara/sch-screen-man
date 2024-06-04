import React, {
  useEffect,
  useState,
} from 'react';

import styles from "./Screen.module.scss";

function Screen ({
  screen,
}) {

  // on initial load
  useEffect(() => {
    // ping screen to get status
    // 
  }, []);

  return (
    <div className={styles.screen}>

    </div>
  )
}

export default Screen;
