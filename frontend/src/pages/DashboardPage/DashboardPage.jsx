import { useState } from 'react';

import styles from './DashboardPage.module.scss';

import MenuBar from '@/components/MenuBar/MenuBar';
import ScreenGroup from '@/components/ScreenGroup/ScreenGroup';

import { useScreens } from '@/context/ScreensContext';

export default function DashboardPage() {
  const [ activeScreenGroup, setActiveScreenGroup ] = useState(null);

  const { 
    groups, 
    loading: screenDataLoading,
    screensByGroup: screens, 
  } = useScreens();

  // Used to avoid calling setActiveScreenGroup in a useEffect
  const firstGroupKey = Object.keys(groups)[0] ?? null;
  const effectiveScreenGroup = activeScreenGroup ?? (screenDataLoading ? null : firstGroupKey);

  return (
    <>
      <MenuBar 
        activeScreenGroup={effectiveScreenGroup}
        screenGroupMetaData={groups}
        setActiveScreenGroup={setActiveScreenGroup}
      />

      {effectiveScreenGroup ? (
        <ScreenGroup
          metaData={screens[effectiveScreenGroup]?.metaData}
          screens={screens[effectiveScreenGroup]?.screens}
        />
      ) : (
        <p className={styles["main-container-message"]}>
          Select a group of screens from the menu.
        </p>
      )}
    </>
  )
}
