import styles from "./ToggleSlider.module.scss";

import InputWrapper from "../InputWrapper/InputWrapper";

export default function ToggleSlider ({
  disabled = false,
  label,
  onClick,
  // setValue,
  value,
}) {
  const handleToggleClick = () => {
    if (disabled) {
      return;
    }

    onClick();
  }

  return (
    <InputWrapper 
      label={label}
      disabled={disabled}
    >
      <div 
        className={`
          ${styles["slider-wrapper"]}
          ${value && styles["toggled"]}
          ${disabled && styles["disabled"]}  
        `}
        // onClick={() => setValue(!value)}
        onClick={handleToggleClick}
      >
        <div 
          className={styles["pip"]}
        />
      </div>
    </InputWrapper>
  );
}
