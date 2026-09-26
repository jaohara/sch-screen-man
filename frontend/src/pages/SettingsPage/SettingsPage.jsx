import { useState } from "react";

import { useSettings, useSettingsDispatch } from "@/context/SettingsContext";

import Panel from "@/components/Panel/Panel";
import Card from "@/components/Card/Card";
import ToggleSlider from "@/components/ToggleSlider/ToggleSlider";
import TextInput from "@/components/TextInput/TextInput";
import InputContainer from "@/components/InputContainer/InputContainer";

export default function SettingsPage () {
  const { 
    fahrenheitTemps,
    memoryUrgentPercent,
    memoryWarnPercent,
  } = useSettings();
  const dispatch = useSettingsDispatch();

  const handleFahrenheitToggle = () => 
    dispatch({ type: "toggle", key: "fahrenheitTemps" });

  // const handle

  return (
    <Panel>
      <h1>Settings</h1>
      <Card>
        <InputContainer>
          <ToggleSlider 
            label={"Display screen Temperatures in Fahrenheit?"}
            value={fahrenheitTemps}
            onClick={handleFahrenheitToggle}
          />
        </InputContainer>

        <InputContainer>
          <TextInput 
            label={"Memory usage warning threshold? (%)"}
            type={"number"}
            value={memoryWarnPercent}
            small
          />
        </InputContainer>

        <InputContainer>
          <TextInput 
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
