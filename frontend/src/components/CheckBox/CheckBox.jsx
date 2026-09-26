import styles from "./CheckBox.module.scss";

import { FaCheck } from "react-icons/fa6";

import InputWrapper from "../InputWrapper/InputWrapper";

export default function CheckBox ({
  label,
  setChecked,
  checked,
}) {
  const handleCheckboxClick = (e) => {
    setChecked(!checked);
    e.stopPropogation;
  }

  return (
    <InputWrapper label={label}>
      <div 
        className={`
          ${styles["checkbox"]}
          ${checked ? styles["checked"] : ""}
        `}
        onClick={(e) => handleCheckboxClick(e)}
      >
        <FaCheck />
      </div>
    </InputWrapper>
  );
}
