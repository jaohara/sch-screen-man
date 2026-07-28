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
  UPTIME_ROUTE,
  // Does uptime need a timeout as well?
} from "../../constants";

const PING_URL = `${BACKEND_BASE_URL}${PING_ROUTE}`;
const REBOOT_URL = `${BACKEND_BASE_URL}${REBOOT_ROUTE}`;
const UPTIME_URL = `${BACKEND_BASE_URL}${UPTIME_ROUTE}`;

const EMPTY_UPTIME_OBJECT = { empty: true, };

function Screen ({
  screen,
}) {
  const [ screenIsOnline, setScreenIsOnline ] = useState(false);
  const [ screenStatusIsLoaded, setScreenStatusIsLoaded ] = useState(false);
  const [ rebootInProgress, setRebootInProgress ] = useState(false);
  const [ lastRebootTime, setLastRebootTime ] = useState(null);
  const [ uptime, setUptime ] = useState(EMPTY_UPTIME_OBJECT);

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

  const resetUptime = () => setUptime(EMPTY_UPTIME_OBJECT);

  const checkIfScreenIdIsANumberAndLogError = (screenId, requestType) => {
    if (isNaN(screenId)) {
      console.error(`screen.screenId '${screenId}' is not a number, aborting ${requestType} request.`);
      return false;
    }

    return true;
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

    // if (!isNaN(screen.screenId)) {
    if (!isNaN(screenId)) {
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

  const formatTimePart = (timePart, isFixed = false) => {
    // assumes timePart can be parsed as number
    let formattedTimePart = Number(timePart);
    formattedTimePart = isFixed ? formattedTimePart.toFixed(2) : formattedTimePart;
    // return String(Number(timePart).toFixed(2)).padStart(2, "0");
    return String(formattedTimePart).padStart(2, "0");
  }

  const getScreenUptime = async () => {
    const { screenId } = screen;

    if (!checkIfScreenIdIsANumberAndLogError(screenId, "uptime")) return;

    const url = `${UPTIME_URL}/${screenId}`;

    try {
      console.log(`Making uptime request to ${url}`);

      const response = await fetch(url);

      const data = await handleFetchResponse(response);
      console.log("Data from uptime fetch received:", data);

      // assumes data can be parsed as number
      const uptime = Number(data);

      const uptimeObject = {
        rawUptime: uptime,
      };

      // uptime is in seconds

      uptimeObject.seconds = formatTimePart(uptime % 60, true); 
      uptimeObject.minutes = formatTimePart(Math.floor(uptime / 60) % 60);
      uptimeObject.hours = formatTimePart(Math.floor(uptime / 3600 % 24));
      uptimeObject.days = String(Math.floor(uptime / 3600 / 24));

      console.log("Created uptime Object for screen:", uptimeObject);

      setUptime(uptimeObject);
      return true;
    }
    catch (error) {
      console.error("There was an error making the request:", error);
      return false;
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

  // when screen is online 
  useEffect(() => {
    if (screenIsOnline) {
      // this is an sync function
      getScreenUptime();
    }
  }, [screenIsOnline]);

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

    if (!checkIfScreenIdIsANumberAndLogError(screenId, "reboot")) {
      return () => {
        logScreenInfo();
        console.error(`Screen "${name}" does not have an associated screenId.`);
      };
    }

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
  })();

  // const rebootButtonIsDisabled = !screenIsOnline || rebootInProgress;
  const rebootButtonIsDisabled = false;

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

  const uptimeJSX = (() => {
    let uptimeString = "0 days 00:00:00";

    if (uptime && !uptime.empty) {
      const { days, hours, minutes, seconds } = uptime;
      uptimeString = `${days} day${days === 1 ? "" : "s"} ${hours}:${minutes}:${seconds}`
    }

    return (<span style={styles["uptime"]}>{uptimeString}</span>);
  })();

  const screenDebugTextJSX = (
    <>
      <p><strong>Screen Online?</strong> {screenIsOnline.toString()}</p>
      <p><strong>Uptime?</strong> {uptimeJSX}</p>
      <p><strong>Reboot in Progress?</strong> {rebootInProgress.toString()}</p>
      <p><strong>Status Loaded?</strong> {screenStatusIsLoaded.toString()}</p>
      <p><strong>Reboot time?</strong> {lastRebootTime ? lastRebootTime.toString() : "0"}</p>
    </>
  );

  // const SCREEN_DEBUG_TEXT_ENABLED = true;
  const SCREEN_DEBUG_TEXT_ENABLED = false;

  return (
    <div className={styles.screen}>
      <div className={styles["screen-info"]}>
          <div className={styles["screen-info-header"]}>
            <h1>{screen.name}</h1>
            {/* TODO: Add more complex logic for appending classNames to handle more states */}
            {/* <div className={`${styles.status} ${styles.loaded}`}>&nbsp;</div> */}
            <div className={hostIndicatorPipClassNames}>&nbsp;</div>
          </div>
          <span className={styles["screen-info-hostname"]}>Hostname: {screen.mdnsHostname}</span>
      </div>

      <div className={styles["screen-description-container"]}>
        <p className={styles["screen-description"]}>{screen.positionDescription}</p>
        {
          SCREEN_DEBUG_TEXT_ENABLED && screenDebugTextJSX
        }

        
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
