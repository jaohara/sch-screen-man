import React from 'react';

import styles from "./Button.module.scss";

import { MdOutlineRefresh } from 'react-icons/md';

import { 
  FaArrowRotateLeft,
  FaPlus,
} from 'react-icons/fa6';

const buttonIcons = {
  // "reboot": (<MdOutlineRefresh />),
  "add": (<FaPlus />),
  "reboot": (<FaArrowRotateLeft />),
}

const buttonIconKeys = Object.keys(buttonIcons);

const iconExists = (icon) => buttonIconKeys.includes(icon);

// TODO: Update to 
const REBOOT_URL = "";

function Button ({
  disabled = false,
  icon,
  label = "Button",
  onClick = () => {},
  smallText = false,
}) {

  const iconJSX = (() => {
    if (iconExists(icon)) {
      return buttonIcons[icon];
    }

    return "";
  })();

  return (
    <button
      disabled={disabled}
      className={`
        ${styles.button}
        ${smallText ? styles["small-text"] : ""}
      `}
      onClick={onClick}
    >
      {iconJSX}
      {label}
    </button>
  )  
}

export default Button;
