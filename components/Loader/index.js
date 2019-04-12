import { Component } from "preact";
import { classNames } from "../../helpers";

import styles from  "./style";

class Loader extends Component {
  loaderBarStyles() {
    return { height: `${this.calcuateHeightOfLoaderBar()}%` };
  }

  calcuateHeightOfLoaderBar() {
    const { isTimerRunning, timerProgressPercentage } = this.props;

    if (!isTimerRunning) {
      return 0;
    }

    return 100 - timerProgressPercentage;
  }

  render() {
    const { pizzaImage, isTimerRunning } = this.props;

    return (
      <div
        class={classNames({
          [styles.loader]: true,
          [styles["loader--active"]]: isTimerRunning
        })}
      >
        <img class={styles["loader__image"]} src={pizzaImage} role="presentation" />
        <div class={styles["loader__bar"]} style={this.loaderBarStyles()} />
      </div>
    );
  }
}

export default Loader;
