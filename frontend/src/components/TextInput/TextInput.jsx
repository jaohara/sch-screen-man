import styles from "./TextInput.module.scss";

import InputWrapper from "../InputWrapper/InputWrapper";

const ALLOWED_INPUT_TYPES  = ["text", "number", "password", ]
const DEFAULT_TYPE = "text";

export default function TextInput ({
  blurOnEnterPress = true,
  canSubmitEmpty = false,
  disabled,
  error = false,
  label,
  onBlur = () => {},
  setValue,
  small = false,
  type = DEFAULT_TYPE,
  value,
}) {
  const inputType = ALLOWED_INPUT_TYPES.includes(type) ? type : DEFAULT_TYPE;

  const hasError = () => {
    if (error) {
      return true;
    }

    if (type === "number") {
      if (value === "") {
        return !canSubmitEmpty;
      }

      return isNaN(Number(value));
    }

    return false;
  }

  const handleKeyDown = (e) => {
    if (blurOnEnterPress && e.key === "Enter") {
      e.target.blur();
    }
  }

  const handleChange = (e) => {
    let newValue = e.target.value;

    if (inputType === "number" && newValue !== "" && isFinite(newValue)) {
      newValue = Number(newValue);
    }

    setValue(newValue);
  }

  return (
    <InputWrapper label={label}>
      <input
        className={`
          ${styles["input"]}
          ${small ? styles["small"] : ""}
          ${hasError() ? styles["error"] : ""}
          ${inputType === "number" ? styles["numeric"] : ""}
          ${disabled && styles["disabled"]}
        `}
        disabled={disabled}
        type={inputType}
        // onChange={(e) => setValue(e.target.value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={ () => { if (!hasError()) onBlur(); } }
        value={value}
      />
    </InputWrapper>
  );
}
