import { useState } from 'react';

import styles from "./SideBar.module.scss";

import { APP_TITLE } from "../../constants";

import { useUIState, useUIDispatch } from "../../context/UIContext";

import {
  FaAnglesRight,
  FaChartColumn,
  FaClock,
  FaDisplay,
  FaGauge,
  FaGear,
  FaSliders,
  FaRectangleList,
} from "react-icons/fa6";

const ICONS = {
  // "dashboard": (<FaChartColumn />),
  "dashboard": (<FaGauge />),
  // "content": (<FaRectangleList />),
  // TODO: Maybe not the best - return to this later
  "content": (<FaDisplay />),
  "schedule": (<FaClock />),
  // "settings": (<FaGear />),
  "settings": (<FaSliders />),
  "toggle": (<FaAnglesRight />),
}

// TODO: this will also probably be handled by the router
const sidebarItems = [
  {
    name: "dashboard",
    label: "Dashboard",
    icon: ICONS["dashboard"],
  },
  {
    name: "content",
    label: "Content",
    icon: ICONS["content"],
  },
  {
    name: "schedule",
    label: "Schedule",
    icon: ICONS["schedule"],
  },
  {
    name: "settings",
    label: "Settings",
    icon: ICONS["settings"],
  },
];

export default function SideBar ({}) {
  // TODO: This will probably be handled by the router 
  const [ currentTab, setCurrentTab ] = useState(sidebarItems[0].name); 

  const { sidebarOpen } = useUIState();
  const dispatch = useUIDispatch();

  const handleSidebarToggleClick = () => dispatch({ type: "toggle", key: "sidebarOpen",});
  const handleEntryClick = (entry) => setCurrentTab(entry.name);

  return (
    <div className={`${styles["sidebar"]} ${sidebarOpen ? styles["open"] : ""}`}>
      {/* TODO: Potentially show app title/icon somewhere here */}
      <div 
        className={styles["sidebar-toggle"]}
        onClick={handleSidebarToggleClick}
      >
        {/* Handle open state styling with css rule matching parent (.sidebar.open) */}
        <div className={styles["sidebar-toggle-icon"]}>
          {ICONS["toggle"]}
        </div>
      </div>
      {
        sidebarItems.map((entry, index) => (
          <div 
            className={
              `${styles["sidebar-entry"]} ${currentTab === entry.name ? styles["active"] : ""}`
            }
            key={`sidebar-entry-${index}`}
            onClick={() => handleEntryClick(entry)}
          >
            <div className={styles["sidebar-entry-icon"]}>
              {ICONS[entry.name]}
            </div>
            <div className={styles["sidebar-entry-label"]}>
              {entry.label}
            </div>
          </div>
        ))
      }
    </div>
  );
}
