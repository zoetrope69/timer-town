import { classNames } from "../../helpers";

import styles from  "./style";

const ToggleButton = ({ id, isActive, label, onClick }) => (
  <div class={styles.toggle}>
    <button
      role="switch"
      aria-labelledby={id}
      onClick={onClick}
      aria-checked={isActive.toString()}
      class={classNames({
        [styles["toggle__button"]]: true,
        [styles["toggle__button--active"]]: isActive
      })}
    >
      {isActive ? "On" : "Off"}
    </button>

    <span class={styles["toggle__label"]} id={id}>
      {label}
    </span>
  </div>
);

export default ToggleButton;
