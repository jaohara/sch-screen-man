import styles from "./InputContainer.module.scss";

export default function InputContainer ({ 
  children,
  noBorder = false, 
}) {
  return (
    <div 
      className={`
        ${styles["input-container"]}
        ${noBorder ? styles["no-border"] : ""}
      `}
    >
      {children}
    </div>
  );
}
