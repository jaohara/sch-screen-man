import {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from "./Screen.module.scss";

import Button from '../Button/Button';

import {
  FaChartColumn,
  FaClockRotateLeft,
  FaDatabase,
  FaMemory,
  FaRaspberryPi,
  FaRegClock,
  FaSpinner,
  FaTemperatureHalf,
  FaTerminal,
} from "react-icons/fa6";

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

  return (
    <div className={styles.screen}>
      <div className={styles["screen-info"]}>
          <div className={styles["screen-info-header"]}>
            <h1>{screen.name}</h1>
            <div className={hostIndicatorPipClassNames}>&nbsp;</div>
          </div>
          <span className={styles["screen-info-hostname"]}>
            <span className={styles["screen-info-hostname-icon"]}>
              {icons["host"]}
            </span>
            <span className={styles["screen-info-hostname-name"]}>
              {screen.mdnsHostname}
            </span>
          </span>
      </div>

      <div className={styles["screen-description-container"]}>
        <p className={styles["screen-description"]}>{screen.positionDescription}</p>
        <ScreenStatsPanel 
          stats={stats}
          lastRebootDuration={lastRebootDuration}
        />
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

const icons = {
  "disk": (<FaDatabase />),
  // "host": (<FaRaspberryPi />),
  "host": (<FaTerminal />),
  "uptime": (<FaRegClock />),
  "memory": (<FaMemory />),
  "lastReboot": (<FaClockRotateLeft />),
  "loadAvg": (<FaChartColumn />),
  "temp": (<FaTemperatureHalf />),
};


function ScreenStatsPanel({ stats, lastRebootDuration }) {
  // TODO: Move this out to app-wide state with settings
  const fahrenheitTemp = true;

  const formatRebootTime = (rebootTime) => {
    if (rebootTime === null) return "---"; 
    // TODO: Fix formatting to only show 2 decimals
    return `${(rebootTime / 1000).toFixed(2)}s`;
  }

  const formatTemperature = (temperature) => {
    const formattedTemp = fahrenheitTemp ? celsiusToFahrenheit(temperature) : temperature;
    return `${formattedTemp.toFixed(2)} °${fahrenheitTemp ? "F" : "C"}`;
  }

  const statsEntries = stats === null ? null : [
    {
      label: "Uptime",
      icon: icons["uptime"],
      value: formatUptime(stats.uptimeSeconds),
    },
    {
      label: "Load Average",
      icon: icons["loadAvg"],
      value: stats.loadAvg.join(" "),
    },
    {
      label: "Memory",
      icon: icons["memory"],
      value: formatMemory(stats.memory),
    },
    {
      label: "Disk Space",
      icon: icons["disk"],
      value: formatMemory(stats.disk),
    },
    {
      label: "Temperature",
      icon: icons["temp"],
      value: formatTemperature(stats.tempC),
    },
    {
      label: "Last Reboot Duration",
      icon: icons["lastReboot"],
      value: formatRebootTime(lastRebootDuration),
    },
  ];
  
  return (
    <div className={styles["screen-stats-panel"]}>
      {
        stats === null ? (<div className={styles["stats-loading"]}><FaSpinner /></div>) :
        
        statsEntries.map((entry, index) => (
          <div 
            className={styles["entry"]}
            key={`stat-entry-${index}`}
          >
            <div className={styles["entry-header"]} title={entry.label}>
              {entry.icon}
            </div>
            <div className={styles["entry-value"]}>
              {entry.value}
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default Screen;
