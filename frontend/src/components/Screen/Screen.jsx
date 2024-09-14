import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from "./Screen.module.scss";

import Button from '../Button/Button';

import {
  BACKEND_BASE_URL,
  PING_INTERVAL_TIME,
  PING_ROUTE,
  PING_TIMEOUT,
  REBOOT_PING_DELAY,
  REBOOT_ROUTE,
  REBOOT_TIMEOUT,
} from "../../constants";

const PING_URL = `${BACKEND_BASE_URL}${PING_ROUTE}`;
const REBOOT_URL = `${BACKEND_BASE_URL}${REBOOT_ROUTE}`;

function Screen ({
  screen,
}) {
  const [ screenIsOnline, setScreenIsOnline ] = useState(false);
  const [ screenStatusIsLoaded, setScreenStatusIsLoaded ] = useState(false);
  const [ rebootInProgress, setRebootInProgress ] = useState(false);
  const [ lastRebootTime, setLastRebootTime ] = useState(null);

  // ping-related refs
  const pingIntervalRef = useRef(null);
  const pingStartTimeRef = useRef(null);

  // reboot-related refs
  const rebootStartTimeRef = useRef(null);

  const clearPingIntervalRef = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
      pingStartTimeRef.current = null;
    }
  }

  //TODO: Remove debug function
  const logScreenInfo = () => console.log("Screen info: ", screen);

  const handleFetchResponse = async (response) => {
    if (!response.ok) {
      let errorMessage = `Error: ${response.status} - ${response.statusText}`;

      // parse error json
      try {
        const errorData = await response.json();

        if (errorData && errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      }
      catch (jsonError) {
        console.error("Could not parse error response JSON:", jsonError);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  };

  const pingScreen = async () => {
    const { screenId } = screen;

    if (!isNaN(screen.screenId)) {
      const url = `${PING_URL}/${screenId}`;

      try {
        console.log(`Making ping request to ${url}`);

        const response = await fetch(url);
        
        const data = await handleFetchResponse(response);
        console.log("Data from fetch received:", data);

        return data.hostIsUp;
      }
      catch (error) {
        console.error("There was an error making the request:", error);
        return false;
      }
    }
  };

  const cleanupAfterReboot = () => {
    if (rebootStartTimeRef.current) {
      const duration = Date.now() - rebootStartTimeRef.current;
      setLastRebootTime(duration);
      rebootStartTimeRef.current = null;
    }
    setRebootInProgress(false);
  }

  const pingHostUntilOnlineOrTimeout = async (limitToTimeout = true) => {
    setScreenStatusIsLoaded(false);
    pingStartTimeRef.current = Date.now();

    const pingHost = async () => {
      if (screenIsOnline && !rebootStartTimeRef.current) {
        clearPingIntervalRef();
        setScreenStatusIsLoaded(true);
        cleanupAfterReboot();
        return;
      }

      const hostIsUp = await pingScreen();

      if (hostIsUp) {
        console.log(`Screen "${screen.name}" is online!`);
        setScreenIsOnline(true);
        setScreenStatusIsLoaded(true);
        clearPingIntervalRef();
        rebootInProgress && cleanupAfterReboot();
        return;
      }

      if (!limitToTimeout) return;

      const timeElapsed = Date.now() - pingStartTimeRef.current;
      const timeoutLimit = rebootInProgress ? REBOOT_TIMEOUT : PING_TIMEOUT;
      // const timeoutReached = timeElapsed >= PING_TIMEOUT;
      const timeoutReached = timeElapsed >= timeoutLimit;

      if (timeoutReached) {
        console.error(`Timeout reached, Screen "${screen.name}" is unreachable.`);
        clearPingIntervalRef();
        setScreenStatusIsLoaded(true);
        return;
      }
    };

    const hostIsUp = await pingHost(true);

    if (!hostIsUp && !pingIntervalRef.current) {
      pingIntervalRef.current = setInterval(pingHost, PING_INTERVAL_TIME);
    }
  };

  // on initial load
  useEffect(() => {
    console.log("Screen Object received: ", screen);

    const startPing = async () => pingHostUntilOnlineOrTimeout();
    startPing();

    return () => clearPingIntervalRef();
  }, []);

  // when screen reboots
  useEffect(() => {
    if (rebootInProgress) {
      setScreenIsOnline(false);
      // setScreenStatusIsLoaded(false);
      // TODO: Testing to see if this ever flips back
      const rebootPingTimeout = setTimeout(() => pingHostUntilOnlineOrTimeout(), REBOOT_PING_DELAY);
      return () => clearTimeout(rebootPingTimeout);
    }
  // }, [screenIsOnline, rebootInProgress]);
  }, [rebootInProgress]);

  const rebootOnClickHandler = (() => {
    const { name, screenId } = screen;

    if (!isNaN(screen.screenId)) {
      return async () => {
        // TODO: Remove debug code
        logScreenInfo();

        try {
          const url = `${REBOOT_URL}/${screenId}`;

          console.log(`Making request to ${url}...`);
          
          rebootStartTimeRef.current = Date.now();
          // setScreenIsOnline(false);
          setRebootInProgress(true);
          const response = await fetch(url);
          const data = await handleFetchResponse(response);
          
          // TODO: Remove log
          // TODO: Use banner/badge notification instead
          // handle the response, for now just log:
          console.log("Response received for this screen:", data);
          
        }
        catch (error) {
          // TODO: Use banner/badge notification to display this 
          console.error("There was an error making the request:", error);
          setRebootInProgress(false);
        }
      };
    }

    return () => {
      logScreenInfo();
      console.error(`Screen "${name}" does not have an associated screenId.`);
    };
  })();

  const rebootButtonIsDisabled = !screenIsOnline || rebootInProgress;

  const hostIndicatorPipClassNames = (() => {
    let className = `${styles.status}`;

    if (rebootInProgress) {
      className += ` ${styles.reboot}`;
    }
    else if (!screenStatusIsLoaded) {
      className += ` ${styles.loading}`;
    }
    else if (!screenIsOnline) {
      className += ` ${styles.offline}`;
    }
    else {
      className += ` ${styles.loaded}`;
    }
    
    return className;
  })();

  return (
    <div className={styles.screen}>
      <div className={styles["screen-info"]}>
        <h1>{screen.name}</h1>
        {/* TODO: Add more complex logic for appending classNames to handle more states */}
        {/* <div className={`${styles.status} ${styles.loaded}`}>&nbsp;</div> */}
        <div className={hostIndicatorPipClassNames}>&nbsp;</div>
      </div>

      <div className={styles["screen-description"]}>
        <p>{screen.positionDescription}</p>
        <p><strong>Screen Online?</strong> {screenIsOnline.toString()}</p>
        <p><strong>Reboot in Progress?</strong> {rebootInProgress.toString()}</p>
        <p><strong>Status Loaded?</strong> {screenStatusIsLoaded.toString()}</p>
        <p><strong>Reboot time?</strong> {lastRebootTime ? lastRebootTime.toString() : "0"}</p>
        
      </div>

      <div className={styles["screen-controls"]}>
        <Button
          disabled={rebootButtonIsDisabled}
          label='Reboot'
          icon="reboot"
          onClick={rebootOnClickHandler}
        />
      </div>
    </div>
  )
}

export default Screen;
