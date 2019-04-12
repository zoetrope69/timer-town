import { classNames } from "../../helpers";

import styles from  "./style";

const Button = ({
  children,
  isBigger,
  isPrimary,
  isSecondary,
  isTertiary,
  onClick
}) => (
  <button
    class={classNames({
      [styles.button]: true,
      [styles["button--primary"]]: isPrimary,
      [styles["button--secondary"]]: isSecondary,
      [styles["button--tertiary"]]: isTertiary,
      [styles["button--bigger"]]: isBigger
    })}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
