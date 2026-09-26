import styles from "./InputWrapper.module.scss";

export default function InputWrapper ({ 
  label, 
  children,
}) {
  return (
    <div className={`${styles["input-wrapper"]}`}>
      {
        label ? (
          <label className={styles["label"]}>
            {label}
            {children}
          </label>
        ) : children
      }

      {/* {label && <label className={styles["label"]}>{label}</label>}
      {children} */}
    </div>
  );
}
