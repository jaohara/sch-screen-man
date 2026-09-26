import { useState } from "react";

import Panel from "@/components/Panel/Panel";
import Card from "@/components/Card/Card";
import InputContainer from "@/components/InputContainer/InputContainer";
import TextInput from "@/components/TextInput/TextInput";
import Button from "@/components/Button/Button";
import DropdownMenu from "@/components/DropdownMenu/DropdownMenu";
import CheckBox from "@/components/CheckBox/CheckBox";
import ToggleSlider from "@/components/ToggleSlider/ToggleSlider";

const DROPDOWN_OPTIONS = [
  {
    label: "One",
    value: "one",
  },
  {
    label: "Two",
    value: "two",
  },
  {
    label: "Three",
    value: "three",
  },
  {
    label: "Four",
    value: "four",
  },
  {
    label: "Five",
    value: "five",
  },
  {
    label: "Six",
    value: "six",
  },
  {
    label: "Seven",
    value: "seven",
  },
  {
    label: "Eight",
    value: "eight",
  },
  {
    label: "Nine",
    value: "nine",
  },
  {
    label: "Ten",
    value: "ten",
  },
];

export default function ComponentPage () {
  const [ text, setText ] = useState("");
  const [ num, setNum ] = useState("");
  const [ toggle, setToggle ] = useState(false);
  const [ check1, setCheck1 ] = useState(false);
  const [ check2, setCheck2 ] = useState(true);
  const [ dropdownValue, setDropdownValue ] = useState(DROPDOWN_OPTIONS[0]);


  return (
    <Panel>
      <h1>Component Test</h1>
      
      <Card>
        <h1>Inputs</h1>
        <p>
          These are the inputs that the app needs.
        </p>

        <InputContainer>
          <TextInput 
            label="Text Input"
            value={text}
            setValue={setText}
          />
        </InputContainer>

        <InputContainer>
          <TextInput 
            label="Number Input"
            value={num}
            setValue={setNum}
            type="number"
            small
          />
        </InputContainer>

        <InputContainer>
          <ToggleSlider 
            label="Toggle Slider"
            value={toggle}
            setValue={setToggle}
          />
        </InputContainer>

        <InputContainer>
          <CheckBox 
            label="Checkbox 1"
            checked={check1}
            setChecked={setCheck1}
          />
        </InputContainer>

        <InputContainer>
          <CheckBox 
            label="Checkbox 2"
            checked={check2}
            setChecked={setCheck2}
          />
        </InputContainer>

        <InputContainer noBorder={true}>
          <DropdownMenu 
            label="Dropdown"
            options={DROPDOWN_OPTIONS}
            value={dropdownValue}
            setValue={setDropdownValue}
          />
        </InputContainer>

        <InputContainer>
          <Button />
        </InputContainer>
      </Card>
    </Panel>
  );
}
