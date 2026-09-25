import styles from "./ToggleSlider.module.scss";

import InputWrapper from "../InputWrapper/InputWrapper";

export default function ToggleSlider ({
  label,
  setValue,
  value,
}) {
  return (
    <InputWrapper label={label}>
      <div 
        className={`
          ${styles["slider-wrapper"]}
          ${value && styles["toggled"]}  
        `}
        onClick={() => setValue(!value)}
      >
        <div 
          className={styles["pip"]}
        />
      </div>
    </InputWrapper>
  );
}
