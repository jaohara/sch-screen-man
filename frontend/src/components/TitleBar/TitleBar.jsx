import React from 'react';

import styles from "./TitleBar.module.scss";

import { APP_TITLE } from '../../constants';

function TitleBar ({}) {
  return (
    <div className={styles["title-bar"]}>
      <h1>{APP_TITLE}</h1>
    </div>
  );
}

export default TitleBar;