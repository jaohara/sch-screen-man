import { Outlet, NavLink } from "react-router";
import SideBar from "../components/SideBar/SideBar";

import styles from "./Layout.module.scss";

export default function Layout () {
  return (
    <div className={styles.app}>
      <SideBar />
      <div className={styles["main-container"]}>
        <Outlet />
      </div>
    </div>
  );
}