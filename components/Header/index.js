import { classNames } from "../../helpers";

import styles from  "./style";

const Header = ({ faded }) => (
  <div
    class={classNames({
      [styles.faded]: true,
      [styles["faded--active"]]: faded
    })}
  >
    <h1 class={styles.title}>Pizza Timer</h1>
    <p class={styles["sub-title"]}>A timer for pair programming</p>
  </div>
);

export default Header;
