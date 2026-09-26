import { useState } from "react";

import styles from "./Panel.module.scss";

export default function Panel ({ 
  children,
  maxHeight,
}) {
  return (
    <div 
      className={`
        ${styles["panel"]}
        ${maxHeight && styles["max-height"]}
      `}
    >
      {children}
    </div>
  );
}
