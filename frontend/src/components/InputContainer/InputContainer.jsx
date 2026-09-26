import styles from "./InputContainer.module.scss";

export default function InputContainer ({ 
  children,
  noBorder = false,
  noTopPadding = false,
  noBottomPadding = false,
}) {
  return (
    <div 
      className={`
        ${styles["input-container"]}
        ${noBorder ? styles["no-border"] : ""}
        ${noTopPadding ? styles["no-top-padding"] : ""}
        ${noBottomPadding ? styles["no-bottom-padding"] : ""}
      `}
    >
      {children}
    </div>
  );
}
