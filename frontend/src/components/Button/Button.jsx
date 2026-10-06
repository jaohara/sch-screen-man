import React from 'react';

import styles from "./Button.module.scss";

import { 
  FaArrowRotateLeft,
  FaPencil,
  FaPlus,
  FaRegTrashCan,
} from 'react-icons/fa6';

const buttonIcons = {
  "add": (<FaPlus />),
  "edit": (<FaPencil />),
  "reboot": (<FaArrowRotateLeft />),
  "remove": (<FaRegTrashCan />),
}

const buttonIconKeys = Object.keys(buttonIcons);

const iconExists = (icon) => buttonIconKeys.includes(icon);

function Button ({
  disabled = false,
  icon,
  label = "Button",
  noLabel = false,
  onClick = () => {},
  smallText = false,
}) {

  const iconJSX = (() => {
    if (iconExists(icon)) {
      return buttonIcons[icon];
    }

    return "";
  })();

  const effectiveLabel = noLabel ? "" : label;

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
      {effectiveLabel}
    </button>
  )  
}

export default Button;
