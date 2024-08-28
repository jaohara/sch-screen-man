import React, {
  useEffect,
  useState,
} from 'react';

import styles from "./Screen.module.scss";

import Button from '../Button/Button';

import {
  BACKEND_BASE_URL,
  PING_ROUTE,
  REBOOT_ROUTE,
} from "../../constants";

const PING_URL = `${BACKEND_BASE_URL}${PING_ROUTE}`;
const REBOOT_URL = `${BACKEND_BASE_URL}${REBOOT_ROUTE}`;

function Screen ({
  screen,
}) {
  const [ screenImageIsLoaded, setScreenImageIsLoaded ] = useState(false);
  const [ screenIsOnline, setScreenIsOnline ] = useState(false);
  const [ screenStatusIsLoaded, setScreenStatusIsLoaded ] = useState(false);

  //TODO: Remove debug function
  const logScreenInfo = () => console.log("Screen info: ", screen);

  /*
    TODO: 
     - Display the name of each screen
     - use screenIsOnline/screenStatusIsLoaded to display a circle to indicate if a screen is online
     - Ping screen to get status
  */

  // on initial load
  useEffect(() => {
    console.log("Screen Object received: ", screen);

    // In future - ping screen to get status
  }, []);

  const rebootOnClickHandler = (() => {
    const { name, rebootId } = screen;

    if (!isNaN(screen.rebootId)) {
      return async () => {
        logScreenInfo();

        try {
          // const url = `${REBOOT_URL}/${rebootId}`;
          const url = `${PING_URL}/${rebootId}`;

          console.log(`Making request to ${url}...`)

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error("Network response was not ok.");
          }

          const data = await response.json();

          // handle the response, for now just log:
          console.log("Response received for this screen:", data);

          // TODO: Use banner/badge notification instead
        }
        catch (error) {
          console.error("There was an error making the request:", error);
          // TODO: Use banner/badge notification to display this 
        }
      };
    }

    return () => {
      logScreenInfo();
      console.error(`Screen "${name}" does not have an associated rebootId.`);
    };
  })();

  return (
    <div className={styles.screen}>
      <div className={styles["screen-info"]}>
        <h1>{screen.name}</h1>
        {/* TODO: Add more complex logic for appending classNames to handle more states */}
        <div className={`${styles.status} ${styles.loaded}`}>&nbsp;</div>
      </div>

      <div className={styles["screen-description"]}>
        <p>{screen.positionDescription}</p>
      </div>

      <div className={styles["screen-controls"]}>
        <Button
          label='Reboot'
          icon="reboot"
          onClick={rebootOnClickHandler}
        />
      </div>
    </div>
  )
}

export default Screen;
