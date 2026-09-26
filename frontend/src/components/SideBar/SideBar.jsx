import { NavLink } from "react-router";

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
  FaObjectGroup,
  FaSliders,
  FaRectangleList,
} from "react-icons/fa6";

const ICONS = {
  // "dashboard": (<FaChartColumn />),
  "dashboard": (<FaGauge />),
  // "content": (<FaRectangleList />),
  // TODO: Maybe not the best - return to this later
  "content": (<FaDisplay />),
  "components": (<FaObjectGroup />),
  "schedule": (<FaClock />),
  // "settings": (<FaGear />),
  "settings": (<FaSliders />),
  "toggle": (<FaAnglesRight />),
}

const sidebarItems = [
  {
    name: "dashboard",
    label: "Dashboard",
    icon: ICONS["dashboard"],
    path: "/",
    end: true,
  },
  {
    name: "content",
    label: "Content",
    icon: ICONS["content"],
    path: "/content",
  },
  {
    name: "schedule",
    label: "Schedule",
    icon: ICONS["schedule"],
    path: "/schedule",
  },
  {
    name: "settings",
    label: "Settings",
    icon: ICONS["settings"],
    path: "/settings",
  },
  // ================================
  // Test Page for Demoing Components
  {
    name: "components",
    label: "Components",
    icon: ICONS["components"],
    path: "/components",
  },
  // ================================
];

export default function SideBar ({}) {
  const { sidebarOpen } = useUIState();
  const dispatch = useUIDispatch();

  const handleSidebarToggleClick = () => dispatch({ type: "toggle", key: "sidebarOpen",});

  return (
    <div className={`${styles["sidebar"]} ${sidebarOpen ? styles["open"] : ""}`}>
      {/* TODO: Potentially show app title/icon somewhere here */}
      <div 
        className={styles["sidebar-toggle"]}
        onClick={handleSidebarToggleClick}
      >
        <div className={styles["sidebar-toggle-icon"]}>
          {ICONS["toggle"]}
        </div>
      </div>
      {
        sidebarItems.map((entry, index) => (
          <NavLink
            to={entry.path}
            end={entry.end}
            className={({ isActive }) =>
              `${styles["sidebar-entry"]} ${isActive ? styles["active"] : ""}`
            }
            key={`sidebar-entry-${index}`}
          >
            <div className={styles["sidebar-entry-icon"]}>
              {ICONS[entry.name]}
            </div>
            <div className={styles["sidebar-entry-label"]}>
              {entry.label}
            </div>
          </NavLink>
        ))
      }
    </div>
  );
}
