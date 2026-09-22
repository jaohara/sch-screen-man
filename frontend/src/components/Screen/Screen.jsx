import {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from "./Screen.module.scss";

import Button from '../Button/Button';

import useScreenHealth, { STATUS } from '../../hooks/useScreenHealth';
import useScreenStats, { 
  celsiusToFahrenheit, 
  formatMemory,
  formatUptime, 
} from '../../hooks/useScreenStats';

function Screen ({
  screen,
}) {
  const {
    canReboot,
    error: screenHealthError,
    isOnline,
    isRebooting,
    lastRebootDuration,
    reboot,
    status,
  } = useScreenHealth(screen.screenId);

  const {
    error: screenStatsError,
    isStale,
    stats,
  } = useScreenStats(screen.screenId, { enabled: isOnline });

  const handleRebootClick = () => reboot();

  const hostIndicatorPipClassNames = (() => {
    let className = `${styles.status}`;

    // UNKNOWN, ONLINE, OFFLINE, REBOOTING, INVALID

    switch(status) {
      case STATUS.REBOOTING: 
        className += ` ${styles.reboot}`;
        break;
      case STATUS.UNKNOWN: 
        className += ` ${styles.loading}`;
        break;
      case STATUS.ONLINE: 
        className += ` ${styles.loaded}`;
        break;
      case STATUS.OFFLINE: 
        className += ` ${styles.offline}`;
        break;
      default: {
        // invalid screen id
        className += ` ${styles.invalid}`;
      }
    }

    return className;
  })();

  const screenDebugTextJSX = (
    stats === null ? (
      <p>Stats loading...</p>
    ) : (
      <table className={styles["screen-debug-table"]}>
        <tbody>
          <tr>
            <td>Online?</td>
            <td>{isOnline.toString()}</td>
          </tr>
          <tr>
            <td>Uptime?</td> 
            {/* <td>{uptimeJSX}</td> */}
            <td>{formatUptime(stats.uptimeSeconds)}</td>
          </tr>
          <tr>
            <td>Load Average?</td> 
            <td>{stats.loadAvg.join(" ")}</td>
          </tr>
          <tr>
            <td>Memory?</td>
            <td>{formatMemory(stats.memory)}</td>
          </tr>
          <tr>
            <td>Disk Space?</td>
            <td>{formatMemory(stats.disk)}</td>
          </tr>
          <tr>
            <td>Temp?</td>
            <td>{`${celsiusToFahrenheit(stats.tempC)} F`}</td>
          </tr>
          <tr>
            <td>Rebooting?</td> 
            <td>{isRebooting.toString()}</td>
          </tr>
          {/* <tr>
            <td>Status Loaded?</td> 
            <td>{screenStatusIsLoaded.toString()}</td>
          </tr> */}
          <tr>
            <td>Reboot time?</td> 
            {/* <td>{lastRebootTime ? formatRebootTime(lastRebootTime) : "0"}</td> */}
            <td>{lastRebootDuration}</td>
          </tr>
        </tbody>
      </table>
    )
  );

  const SCREEN_DEBUG_TEXT_ENABLED = true;
  // const SCREEN_DEBUG_TEXT_ENABLED = false;

  return (
    <div className={styles.screen}>
      <div className={styles["screen-info"]}>
          <div className={styles["screen-info-header"]}>
            <h1>{screen.name}</h1>
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
          disabled={!canReboot}
          label='Reboot'
          icon="reboot"
          onClick={handleRebootClick}
        />
      </div>
    </div>
  )
}

function ScreenStatsPanel({

}) { 
  return (<></>);
}

export default Screen;
