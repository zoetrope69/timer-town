const MEDIA_QUERY_DARK_COLOR_SCHEME = "(prefers-color-scheme: dark)";
const MEDIA_QUERY_LIGHT_COLOR_SCHEME = "(prefers-color-scheme: light)";

const MENU_DARK_COLOR_SCHEME = "#3d1e45";
const MENU_LIGHT_COLOR_SCHEME = "#ffe0e0";

export const IS_SERVER_SIDE_BUILD = typeof window === "undefined";
export const LOCALSTORAGE_AVAILABLE =
  !IS_SERVER_SIDE_BUILD && "localStorage" in window;

export const META_URL = "https://timer.pizza/";
export const META_TITLE = "Pizza Timer 🍕⏱️";
export const META_DESCRIPTION = "A timer for pair programming";
export const META_SHARE_IMAGE = "assets/images/share-image.png";

const hasOwn = {}.hasOwnProperty;
export function classNames(obj) {
  const classes = [];

  for (let key in obj) {
    if (hasOwn.call(obj, key) && obj[key]) {
      classes.push(key);
    }
  }

  return classes.join(" ");
}

export function detectColorScheme(setBrowserColorScheme) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return;
  }

  function colorSchemeMediaQueryListener({ matches, media }) {
    if (!matches) {
      return;
    }

    if (media === MEDIA_QUERY_DARK_COLOR_SCHEME) {
      setBrowserColorScheme("dark");
    } else if (media === MEDIA_QUERY_LIGHT_COLOR_SCHEME) {
      setBrowserColorScheme("light");
    }
  }

  const mediaQueryDark = window.matchMedia(MEDIA_QUERY_DARK_COLOR_SCHEME);
  const mediaQueryLight = window.matchMedia(MEDIA_QUERY_LIGHT_COLOR_SCHEME);

  mediaQueryDark.addListener(colorSchemeMediaQueryListener);
  mediaQueryLight.addListener(colorSchemeMediaQueryListener);

  if (mediaQueryDark.matches) {
    setBrowserColorScheme("dark");
  } else if (mediaQueryLight.matches) {
    setBrowserColorScheme("light");
  }
}

export function setMetaThemeColor(colorScheme) {
  const element = document.querySelector("meta[name='theme-color']");
  if (!element) {
    return;
  }

  if (colorScheme === "dark") {
    element.setAttribute("content", MENU_DARK_COLOR_SCHEME);
    return;
  }

  element.setAttribute("content", MENU_LIGHT_COLOR_SCHEME);
}

export function parseTimeStringPart(timeString, timeAmountString) {
  if (timeString === "00") {
    return `${timeString}${timeAmountString} `;
  }

  if (timeString.length === 2 && timeString[0] === "0") {
    return `${timeString[1]}${timeAmountString} `;
  }

  return `${timeString}${timeAmountString} `;
}

export function formatTimeFromSeconds(seconds) {
  const date = new Date(null);
  date.setSeconds(seconds);
  const timeString = date.toISOString().substr(11, 8);
  const [hoursString, minutesString, secondsString] = timeString.split(":");

  let niceTimeString = "";

  if (hoursString !== "00") {
    niceTimeString += parseTimeStringPart(hoursString, "h");
    niceTimeString += parseTimeStringPart(minutesString, "m");
    niceTimeString += parseTimeStringPart(secondsString, "s");
  } else if (minutesString !== "00") {
    niceTimeString += parseTimeStringPart(minutesString, "m");
    niceTimeString += parseTimeStringPart(secondsString, "s");
  } else if (secondsString !== "00") {
    niceTimeString += parseTimeStringPart(secondsString, "s");
  } else {
    niceTimeString += "0s";
  }

  return niceTimeString.trim();
}

export function setHeadTitle(text) {
  if (typeof window === "undefined") {
    return;
  }

  document.title = text;
}

export function addToHeadElements(htmlString) {
  if (typeof window === "undefined") {
    return;
  }

  document.head.insertAdjacentHTML("beforeend", htmlString.trim());
}

export function handleTabInBackground(callback) {
  if (typeof window === "undefined" || document.hidden === undefined) {
    // document.hidden not supported so don't do anything
    return;
  }

  document.addEventListener(
    "visibilitychange",
    () => callback(document.hidden),
    false
  );
}
