import styles from "./MenuBar.module.scss";

import { 
  FaRegImages,
  FaTags,
 } from 'react-icons/fa6';

export default function MenuBar ({
  activeScreenGroup,
  screenGroupMetaData,
  setActiveScreenGroup,
}) {

  // TODO: Remove this
  const testMenuBarButtonJSX = (
    <>
      <li><button className={styles["menu-bar-button"]}>One</button></li>
      <li><button className={styles["menu-bar-button"]}>Two</button></li>
      <li><button className={styles["menu-bar-button"]}>Three</button></li>
      <li><button className={styles["menu-bar-button"]}>Four</button></li>
    </>
  );

  // const menuBarButtonJSX = screenGroupMetaData ? (<li>screenGroupMetaData exists</li>) 
  const menuBarButtonJSX = screenGroupMetaData ? 
    Object.keys(screenGroupMetaData).map((screenGroupKey, index) => {
      const currentScreenGroupMetaData = screenGroupMetaData[screenGroupKey];

      if (!currentScreenGroupMetaData.hidden) {
        return (
          <li
            className={styles["menu-bar-list-item"]} 
            key={`screen-group-{index}`}
          >
            <button 
              className={`
                ${styles["menu-bar-button"]} ${
                  screenGroupKey === activeScreenGroup ? styles["active"] : ""
                }  
              `}
              onClick={() => setActiveScreenGroup(screenGroupKey)}
            >
              {currentScreenGroupMetaData["name"]}
            </button>
          </li>
        )
      }
    })
    : testMenuBarButtonJSX;

  return (
    <div className={styles["menu-bar"]}>
      {/* <div className={styles["menu-bar-group-icon"]}>
      </div> */}
      <ul>
        <li 
          className={styles["menu-bar-group-icon"]}
        >
          <FaTags />
          <span className={styles["menu-bar-group-label"]}>
            Groups:
          </span>
        </li>
        {menuBarButtonJSX}
      </ul>
    </div>
  );
}
