import React from 'react';

import styles from "./Button.module.scss";

import { 
  FaArrowRotateLeft,
  FaPencil,
  FaPlus,
  FaRegTrashCan,
  FaSpinner,
} from 'react-icons/fa6';

const buttonIcons = {
  "add": (<FaPlus />),
  "edit": (<FaPencil />),
  "loading": (<FaSpinner />),
  "reboot": (<FaArrowRotateLeft />),
  "remove": (<FaRegTrashCan />),
}

const buttonIconKeys = Object.keys(buttonIcons);

const iconExists = (icon) => buttonIconKeys.includes(icon);

function Button ({
  disabled = false,
  icon,
  label = "Button",
  locked = false,
  loading = false,
  noLabel = false,
  onClick = () => {},
  smallText = false,
}) {

  const iconJSX = (() => {
    if (loading) {
      return buttonIcons["loading"];
    }

    if (iconExists(icon)) {
      return buttonIcons[icon];
    }

    return "";
  })();

  const effectiveLabel = noLabel ? "" : label;

  return (
    <button
      disabled={disabled || locked}
      className={`
        ${styles.button}
        ${smallText ? styles["small-text"] : ""}
        ${locked ? styles["locked"] : ""}
        ${loading ? styles["loading"] : ""}
      `}
      onClick={onClick}
    >
      {iconJSX}
      {effectiveLabel}
    </button>
  )  
}

export default Button;
