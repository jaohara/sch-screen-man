import { useState } from 'react'
import styles from './App.module.scss';

import ScreenGroup from './components/ScreenGroup/ScreenGroup';

function App() {
  // const [count, setCount] = useState(0);

  /*
    - load pi-conf.js
    - parse screen config object into groups of screens
    - pass each group of screens into a ScreenGroup component
  */


  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <h1>Stoup Screen Manager</h1>
      </div>

      {/* 
        Make a screen group container div where we map each screen group data object
        to a ScreenGroup.

        The app screen should be static, and just this screen group container 
      */}

    </div>
  );
}

export default App
