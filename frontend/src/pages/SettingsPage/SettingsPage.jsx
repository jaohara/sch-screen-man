import { useState } from "react";

import { useUIState, useUIDispatch } from "@/context/UIContext";
import { useSettings, useSettingsDispatch } from "@/context/SettingsContext";

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
  } = useSettings();

  const { settingsLocked } = useUIState();

  const [ locked, setLocked ] = useState(false);
  
  const settingsDispatch = useSettingsDispatch();
  const uiDispatch = useUIDispatch();

  const handleFahrenheitToggle = () => 
    settingsDispatch({ type: "toggle", key: "fahrenheitTemps" });

  const handleSettingsLockClick = () =>
    uiDispatch({ type: "toggle", key: "settingsLocked" });

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
            value={memoryWarnPercent}
            small
          />
        </InputContainer>

        <InputContainer>
          <TextInput 
            disabled={settingsLocked}
            label={"Memory usage urgent threshold? (%)"}
            type={"number"}
            value={memoryUrgentPercent}
            small
          />
        </InputContainer>
      </Card>
    </Panel>
  );
}
