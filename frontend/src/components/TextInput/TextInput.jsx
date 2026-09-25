import styles from "./TextInput.module.scss";

import InputWrapper from "../InputWrapper/InputWrapper";

export default function TextInput ({
  label,
  setValue,
  value,
}) {
  return (
    <InputWrapper label={label}>
      <input
        className={`${styles["input"]}`}
        type="text"
        onChange={(e) => setValue(e.value)}
        value={value}
      />
    </InputWrapper>
  );
}
