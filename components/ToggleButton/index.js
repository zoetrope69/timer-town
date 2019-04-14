import { classNames } from "../../helpers";

import styles from  "./style";

const ToggleButton = ({ id, isActive, label, onClick, disabled }) => (
  <div
    class={classNames({
      [styles.toggle]: true,
      [styles['toggle--disabled']]: disabled
    })}
  >
    <button
      class={classNames({
        [styles["toggle__button"]]: true,
        [styles["toggle__button--active"]]: isActive
      })}
      role="switch"
      aria-labelledby={id}
      aria-checked={isActive.toString()}
      disabled={disabled}
      onClick={onClick}
    >
      {isActive ? "On" : "Off"}
    </button>

    <span
      class={styles["toggle__label"]}
      id={id}
      onClick={onClick}
    >
      {label}
    </span>
  </div>
);

export default ToggleButton;
