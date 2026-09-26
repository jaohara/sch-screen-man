import styles from "./TextInput.module.scss";

import InputWrapper from "../InputWrapper/InputWrapper";

const ALLOWED_INPUT_TYPES  = ["text", "number", "password", ]
const DEFAULT_TYPE = "text";

export default function TextInput ({
  disabled,
  error = false,
  label,
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
        return false;
      }

      return isNaN(Number(value));
    }

    return false;
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
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />
    </InputWrapper>
  );
}
