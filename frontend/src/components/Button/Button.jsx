import React from 'react';

import styles from "./Button.module.scss";

function Button ({
  disabled = false,
  label = "Button",
  onClick = () => {},
}) {
  return (
    <button
      disabled={disabled}
      className={styles.button}
      onClick={onClick}
    >
      {label}
    </button>
  )  
}

export default Button;
