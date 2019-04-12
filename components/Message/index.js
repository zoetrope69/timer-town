import styles from  "./style";
import { classNames } from "../../helpers";

const Message = ({ children, isErrored }) => (
  <div class={classNames({
    [styles.message]: true,
    [styles["message--errored"]]: isErrored
  })}>
    {children}
  </div>
);

export default Message;
