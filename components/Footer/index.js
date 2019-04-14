import { Component } from "preact";
import {
  IS_SERVER_SIDE_BUILD,
  META_URL
} from '../../helpers';
import Button from '../Button';
import Heading from '../Heading';

import styles from  "./style";

const FOOTER_CREDIT_LINKS = [
  {
    url:
      "https://web.archive.org/web/20091022051105/http://geocities.com/jhosel/index.html",
    text: "Pizza image"
  },
  {
    url: "http://soundbible.com/1815-A-Tone.html",
    text: "Gong sound"
  },
  {
    url: "http://soundbible.com/2218-Service-Bell-Help.html",
    text: "Bell sound"
  },
  {
    url: "http://soundbible.com/2142-FogHorn-Barge.html",
    text: "Foghorn sound"
  },
  {
    url: "http://soundbible.com/1619-Music-Box.html",
    text: "Music box sound"
  }
];

const FooterLinks = () => (
  <div>
    <ul class={styles["footer__credits"]}>
      {FOOTER_CREDIT_LINKS.map(footerCreditsItem => (
        <li class={styles["footer__credits__item"]}>
          <a
            rel="noreferrer"
            class={styles["footer__credits__link"]}
            href={footerCreditsItem.url}
          >
            {footerCreditsItem.text}
          </a>
        </li>
      ))}
    </ul>

    <a class={styles["footer__link"]} href="https://zaccolley.com">
      <span class={styles["footer__link__icon"]} aria-hidden="true">
        🍕
      </span>{" "}
      Made by Zac
      </a>

    <a
    class={styles["footer__link"]}
    href="https://github.com/zaccolley/pizza-timer"
    >
      <span class={styles["footer__link__icon"]} aria-hidden="true">
        💽
      </span>{" "}
      Issues/code on GitHub
    </a>
  </div>
);

class Footer extends Component {
  constructor(props) {
    super(props);

    this.handleShareClick = this.handleShareClick.bind(this);
  }

  getSupportsShare() {
    return !IS_SERVER_SIDE_BUILD && "share" in navigator;
  }

  handleShareClick() {
    const supportsShare = this.getSupportsShare();
    if (!supportsShare) {
      return;
    }

    navigator.share({ url: META_URL });
  }

  render({ handleClearDataClick }) {
    const supportsShare = this.getSupportsShare();

    return (
      <footer class={styles.footer}>
        {supportsShare && (
          <Button onClick={this.handleShareClick} isTertiary>
            Share...
          </Button>
        )}

        <Button onClick={handleClearDataClick} isTertiary>
          Clear data
        </Button>

        <Heading>
          Credits
        </Heading>

        <FooterLinks />
      </footer>
    );
  }
}

export default Footer;
