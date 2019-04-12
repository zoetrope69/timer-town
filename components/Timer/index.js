import styles from  "./style";

const Timer = ({ children }) => (
  <div class={styles.timer}>
    {children}
  </div>
);

export default Timer;
