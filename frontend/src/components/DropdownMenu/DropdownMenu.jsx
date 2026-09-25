import { useState } from "react";

import styles from "./DropdownMenu.module.scss";

import {
  FaChevronDown
} from "react-icons/fa6";

import InputWrapper from "../InputWrapper/InputWrapper";

/*
  Assumes options matches this pattern:

  [
    {
      label: "One",
      value: "one",
    },
    {
      label: "Two",
      value: "two",
    },
    ...
  ]
*/
export default function DropdownMenu ({
  label,
  options,
  value,
  setValue,
}) {
  const dropdownPrompt = "Select an option..."
  // should I assume the first choice as selected, or give a prompt?
  const defaultLabel = options[0]?.label ? options[0].label : dropdownPrompt;

  const [ open, setOpen ] = useState(false);
  const [ selectedLabel, setSelectedLabel ] = useState(defaultLabel);

  const toggleDropdown = () => setOpen(!open);

  const handleOptionClick = (e, newOption) => {
    setValue(newOption.value);
    setSelectedLabel(newOption.label);
    e.stopPropogation();
    toggleDropdown();
  }

  return (
    <InputWrapper label={label}>
      <div className={styles["dropdown"]}>
        <button 
          className={`
            ${styles["dropdown-trigger"]}
            ${open ? styles["open"] : ""}
          `}
          onClick={toggleDropdown}
        >
          {selectedLabel}
          <FaChevronDown />
        </button>

        {
          open && (
            <ul className={styles["dropdown-list"]}>
              {
                options.map((option, index) => (
                  <li 
                    className={styles["dropdown-option"]}
                    key={`dropdown-item-${index}`}
                    onClick={(e) => handleOptionClick(e, option)}
                  >
                    {option.label}
                  </li>
                ))
              }
            </ul>
          )
        }
      </div>



    </InputWrapper>
  );
}
