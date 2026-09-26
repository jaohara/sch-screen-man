import styles from "./LockHeader.module.scss";

import {
  FaLock,
  FaUnlock,
} from "react-icons/fa6";

import ToggleSlider from "../ToggleSlider/ToggleSlider";

export default function LockHeader ({
  children,
  isLocked,
  handleToggleClick,
  setIsLocked,
}) {
//   const handleLockSliderClick = (e) => setIsLocked(!isLocked);

  return (
    <div className={styles["lock-header"]}>
      <h1>{children}</h1>
      <div className={styles["toggle-container"]}>
        <FaUnlock />
        <ToggleSlider 
          value={isLocked}
          onClick={handleToggleClick}
        />
        <FaLock />
      </div>
    </div>
  );
}
