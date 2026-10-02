import { useEffect, useState } from "react";

import { useUIState, useUIDispatch } from "@/context/UIContext";
import { useSettings, useSettingsActions } from "@/context/SettingsContext";

import Panel from "@/components/Panel/Panel";
import Card from "@/components/Card/Card";
import ToggleSlider from "@/components/ToggleSlider/ToggleSlider";
import TextInput from "@/components/TextInput/TextInput";
import InputContainer from "@/components/InputContainer/InputContainer";
import LockHeader from "@/components/LockHeader/LockHeader";

export default function SettingsPage () {
  const { 
    fahrenheitTemps,
    memoryUrgentPercent,
    memoryWarnPercent,
    loading: settingsLoading,
  } = useSettings();

  // managed form values
  const [ currentMemoryUrgentPercent, setCurrentMemoryUrgentPercent ] = 
    useState(memoryUrgentPercent);
  const [ currentMemoryWarnPercent, setCurrentMemoryWarnPercent ] = 
    useState(memoryWarnPercent);
  
  const { settingsLocked } = useUIState();

  const { setSetting, toggleSetting } = useSettingsActions();
  const uiDispatch = useUIDispatch();

  const handleFahrenheitToggle = () => toggleSetting("fahrenheitTemps");

  const handleSettingsLockClick = () =>
    uiDispatch({ type: "toggle", key: "settingsLocked" });

  useEffect(() => {
    if (!settingsLoading) {
      setCurrentMemoryWarnPercent(memoryWarnPercent);
      setCurrentMemoryUrgentPercent(memoryUrgentPercent);
    }
  }, [settingsLoading]);

  return (
    <Panel>
      {/* <h1>Settings</h1> */}
      <LockHeader
        isLocked={settingsLocked}
        handleToggleClick={handleSettingsLockClick}
      >
        Settings
      </LockHeader>

      <Card>
        { 
          // TODO: Replace with better loading component
          settingsLoading ? ("Loading...") : (
            <>
              <InputContainer>
                <ToggleSlider 
                  disabled={settingsLocked}
                  label={"Display screen Temperatures in Fahrenheit?"}
                  value={fahrenheitTemps}
                  onClick={handleFahrenheitToggle}
                />
              </InputContainer>

              <InputContainer>
                <TextInput 
                  disabled={settingsLocked}
                  label={"Memory usage warning threshold? (%)"}
                  type={"number"}
                  value={currentMemoryWarnPercent}
                  setValue={setCurrentMemoryWarnPercent}
                  onBlur={() => setSetting("memoryWarnPercent", currentMemoryWarnPercent)}
                  small
                  />
              </InputContainer>

              <InputContainer>
                <TextInput 
                  disabled={settingsLocked}
                  label={"Memory usage urgent threshold? (%)"}
                  type={"number"}
                  value={currentMemoryUrgentPercent}
                  setValue={setCurrentMemoryUrgentPercent}
                  onBlur={() => setSetting("memoryUrgentPercent", currentMemoryUrgentPercent)}
                  small
                />
              </InputContainer>
            </>
          )
        }
      </Card>
    </Panel>
  );
}
