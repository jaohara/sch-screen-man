import React from 'react';

import styles from "./Button.module.scss";

import { MdOutlineRefresh } from 'react-icons/md';

const buttonIcons = {
  "reboot": (<MdOutlineRefresh />),
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
      className={styles.button}
      onClick={onClick}
    >
      {iconJSX}
      {label}
    </button>
  )  
}

export default Button;
