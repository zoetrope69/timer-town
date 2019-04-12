import styles from  "./style";

const Heading = ({ children }) => (
  <h2 class={styles.heading}>
    {children}
  </h2>
);

export default Heading;
