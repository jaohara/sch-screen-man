import { useState } from "react";

import styles from "./Card.module.scss";

export default function Card ({ 
  children,
  grow,
  scrollOverflow = false,
}) {
  return (
    <div 
      className={`
          ${styles["card"]}
          ${scrollOverflow && styles["scroll-overflow"]}
          ${grow && styles["grow"]}
      `}
    >
      {children}
    </div>
  );
}
