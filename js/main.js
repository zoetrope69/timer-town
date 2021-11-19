const DEBUG = false;

const EMOJI = {
  people: [
    "🧍🏻‍♀️",
    "🧍🏼‍♀️",
    "🧍🏽‍♀️",
    "🧍🏾‍♀️",
    "🧍🏿‍♀️",
    "🧍🏻",
    "🧍🏼",
    "🧍🏽",
    "🧍🏾",
    "🧍🏿",
    "🧍🏻‍♂️",
    "🧍🏼‍♂️",
    "🧍🏽‍♂️",
    "🧍🏾‍♂️",
    "🧍🏿‍♂️",
  ],
};

// See footer for credits for images and sounds

const IMAGES = {
  timer: "images/timer.png",
};

const SOUNDS = {
  gong: "sounds/gong.mp3",
  bell: "sounds/bell.mp3",
  foghorn: "sounds/foghorn.mp3",
  "music-box": "sounds/music-box.mp3",
  "chief-chef": "sounds/chief-chef.mp3",
  "marshall-house": "sounds/marshall-house.mp3",
  "beano-yelp": "sounds/beano-yelp.mp3",
};

const TIMER_INTERVAL_SECONDS = 1;
const DEFAULT_MINUTES_AMOUNT = 10;

const MEDIA_QUERY_DARK_COLOR_SCHEME = "(prefers-color-scheme: dark)";
const MEDIA_QUERY_LIGHT_COLOR_SCHEME = "(prefers-color-scheme: light)";

const MENU_DARK_COLOR_SCHEME = "#3d1e45";
const MENU_LIGHT_COLOR_SCHEME = "#ffe0e0";

const SUPPORTS_WEB_WORKERS = typeof Worker !== undefined;

function webWorkerInterval(callback) {
  const worker = new Worker("web-worker.js");

  function handleWebWorkerMessage(event) {
    const { data } = event;

    if (DEBUG) console.log("Data from notificaton event", data);

    if (data === "tick") {
      callback();
      return;
    }
  }

  worker.addEventListener("message", handleWebWorkerMessage);

  return worker;
}

function clearWebWorkerInterval(worker) {
  if (worker) worker.terminate();
}

function setMetaThemeColor(colorScheme) {
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

function parseTimeStringPart(timeString, timeAmountString) {
  if (timeString === "00") {
    return `${timeString}${timeAmountString} `;
  }

  if (timeString.length === 2 && timeString[0] === "0") {
    return `${timeString[1]}${timeAmountString} `;
  }

  return `${timeString}${timeAmountString} `;
}

function formatTimeFromSeconds(seconds) {
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

function randomPerson() {
  return EMOJI.people[Math.floor(Math.random() * EMOJI.people.length)];
}

function main() {
  const store = {
    debug: DEBUG,

    state: {
      soundName: "gong",

      audio: null,
      canPlayAudio: false,
      audioPlaying: false,
      audioEnabled: false,

      notificationPermission: "",
      notificationsEnabled: false,
      notificationsDurationSeconds: 1,

      timer: null,
      timerRunning: false,
      timerCurrentTimeSeconds: 0,
      timerEndTimeSeconds: DEFAULT_MINUTES_AMOUNT * 60,
      timerEndTimeMinutes: DEFAULT_MINUTES_AMOUNT,
      timerRemainingTimeFormatted: formatTimeFromSeconds(
        DEFAULT_MINUTES_AMOUNT * 60
      ),
      timerProgressPercentage: 0,
      timerRepeatAtEndEnabled: false,
      timerCompleteCount: 0,

      townPeople: [],

      browserColorScheme: null,
      colorScheme: "auto",
    },

    setTitle(title) {
      if (DEBUG) console.log("setTitle triggered");

      if (!title) {
        document.title =
          "Timer Town ⏱🏡 | A timer for Pomodoro technique and/or pair programing";
      }

      document.title = `${title} | Timer Town ⏱🏡`;
    },

    triggerEndOfTimer() {
      if (DEBUG) console.log("triggerEndOfTimer triggered");

      if (this.state.audioEnabled) {
        this.state.audio.play();
      }

      if (this.state.notificationsEnabled) {
        this.spawnNotification({
          title: "Timer finished",
          body: "Press/click to return to timer",
        });
      }

      if (this.state.timerRepeatAtEndEnabled) {
        this.setTimerCurrentTime(0);
      }

      if (!this.state.timerRepeatAtEndEnabled) {
        this.setTimerRunning(false);
      }

      this.setTimerCompleteCount(this.state.timerCompleteCount + 1);
      this.addTownPeople(randomPerson());
    },

    setTimeProgressPercentage() {
      if (DEBUG) console.log("setTimeProgressPercentage triggered");

      const formattedTimeRemaining = formatTimeFromSeconds(
        this.state.timerEndTimeSeconds - this.state.timerCurrentTimeSeconds
      );
      this.state.timerRemainingTimeFormatted = formattedTimeRemaining;
      this.setTitle(formattedTimeRemaining);

      const timerProgressPercentage =
        (this.state.timerCurrentTimeSeconds / this.state.timerEndTimeSeconds) *
        100;
      this.state.timerProgressPercentage = timerProgressPercentage;
    },

    progressTimer() {
      if (DEBUG) console.log("progressTimer triggered");

      if (
        this.state.timerCurrentTimeSeconds >= this.state.timerEndTimeSeconds
      ) {
        this.triggerEndOfTimer();
        return;
      }

      this.setTimerCurrentTime(
        this.state.timerCurrentTimeSeconds + TIMER_INTERVAL_SECONDS
      );
    },

    setTimerCurrentTime(newValue) {
      if (DEBUG) console.log("setTimerCurrentTime triggered with", newValue);

      this.state.timerCurrentTimeSeconds = newValue;
      this.setTimeProgressPercentage();
    },

    setTimerEndTime(newValue) {
      if (DEBUG) console.log("setTimerEndTime triggered with", newValue);

      this.state.timerEndTimeSeconds = newValue;

      const timerEndTimeMinutes = newValue / 60;
      if ("localStorage" in window) {
        window.localStorage.setItem("timerEndTimeMinutes", timerEndTimeMinutes);
      }
      this.state.timerEndTimeMinutes = timerEndTimeMinutes;
      this.setTimeProgressPercentage();
    },

    setTimerRunning(newValue) {
      if (DEBUG) console.log("setTimerRunning triggered with", newValue);

      this.state.timerRunning = newValue;

      if (SUPPORTS_WEB_WORKERS) {
        if (DEBUG) console.log("Using Web Workers for timer");

        if (this.state.timerRunning === false) {
          clearWebWorkerInterval(this.state.timer);
          this.state.timer = null;
          return;
        }

        this.progressTimer();
        this.state.timer = webWorkerInterval(
          () => this.progressTimer(),
          TIMER_INTERVAL_SECONDS * 1000
        );
        return;
      }

      // fallback if web workers dont work
      if (this.state.timerRunning === false) {
        clearInterval(this.state.timer);
        this.state.timer = null;
        return;
      }

      this.progressTimer();
      this.state.timer = setInterval(
        () => this.progressTimer(),
        TIMER_INTERVAL_SECONDS * 1000
      );
    },

    setTimerRepeatAtEndEnabled(newValue) {
      if (DEBUG) console.log("setTimeRepeatAtEnd triggered with", newValue);

      if ("localStorage" in window) {
        window.localStorage.setItem("timerRepeatAtEndEnabled", newValue);
      }
      this.state.timerRepeatAtEndEnabled = newValue;
    },

    setTimerCompleteCount(newValue) {
      if (DEBUG) console.log("setTimerCompleteCount triggered with", newValue);

      if ("localStorage" in window) {
        window.localStorage.setItem("timerCompleteCount", newValue);
      }
      this.state.timerCompleteCount = newValue;
    },

    setTownPeople(newValue) {
      if (DEBUG) console.log("setTownPeople triggered with", newValue);

      if ("localStorage" in window) {
        window.localStorage.setItem("townPeople", JSON.stringify(newValue));
      }
      this.state.townPeople = newValue;
    },

    addTownPeople(newValue) {
      if (DEBUG) console.log("addTownPeople triggered with", newValue);

      const newTownPeople = this.state.townPeople;
      newTownPeople.push(newValue);

      this.setTownPeople(newTownPeople);
    },

    setSoundName(newValue) {
      if (DEBUG) console.log("setSoundName triggered with", newValue);

      if ("localStorage" in window) {
        window.localStorage.setItem("soundName", newValue);
      }

      this.state.soundName = newValue;

      this.setAudio(SOUNDS[newValue]);
    },

    setAudio(newValue) {
      if (DEBUG) console.log("setAudio triggered with", newValue);

      const newAudio = new Audio(newValue);
      newAudio.preload = true;

      this.state.audio = newAudio;
    },

    setCanPlayAudio(newValue) {
      if (DEBUG) console.log("setCanPlayAudio triggered with", newValue);

      const canProbablyPlayAudio = newValue !== "";

      this.state.canPlayAudio = canProbablyPlayAudio;

      if (canProbablyPlayAudio === false) {
        this.setAudioEnabled(false);
      }

      return canProbablyPlayAudio;
    },

    setAudioEnabled(newValue) {
      if (DEBUG) console.log("setAudioEnabled triggered with", newValue);

      if (this.state.audio) {
        if (newValue === false) {
          this.state.audio.pause();
          this.state.audio.currentTime = 0;
        }
      }

      if ("localStorage" in window) {
        window.localStorage.setItem("audioEnabled", newValue);
      }
      this.state.audioEnabled = newValue;
    },

    setNotificationsDurationSeconds(newValue) {
      if (DEBUG)
        console.log("setNotificationsDurationSeconds triggered with", newValue);
      this.state.notificationsDurationSeconds = newValue;
    },

    setNotificationsEnabled(newValue) {
      if (DEBUG)
        console.log("setNotificationsEnabled triggered with", newValue);

      if ("localStorage" in window) {
        window.localStorage.setItem("notificationsEnabled", newValue);
      }
      this.state.notificationsEnabled = newValue;
    },

    handleNotificationPermission(newValue) {
      if (DEBUG)
        console.log("handleNotificationPermission triggered with", newValue);

      this.state.notificationPermission = newValue;

      const notificationsGranted = newValue === "granted";

      this.setNotificationsEnabled(notificationsGranted);

      return notificationsGranted;
    },

    spawnNotification({ title, body, image, test }) {
      const { timerRepeatAtEndEnabled, notificationsDurationSeconds } =
        this.state;

      const getTag = () => {
        if (test) {
          return "timer-notification--test";
        }

        if (timerRepeatAtEndEnabled) {
          return "timer-notification--repeat";
        }

        return "timer-notification";
      };

      const getActions = () => {
        if (test) {
          return [];
        }

        if (timerRepeatAtEndEnabled) {
          return [{ action: "stop", title: "Stop" }];
        }

        return [
          { action: "restart", title: "Restart" },
          { action: "stop", title: "Stop" },
        ];
      };

      const getRequireInteraction = () => {
        if (timerRepeatAtEndEnabled || test) {
          return false;
        }

        return true;
      };

      const getData = () => {
        return {
          test,
          timerRepeatAtEndEnabled,
          notificationsDurationSeconds,
          url: location.href,
        };
      };

      const notificationOptions = {
        tag: getTag(),
        requireInteraction: getRequireInteraction(),
        body,
        badge: IMAGES.timer,
        icon: IMAGES.timer,
        image,
        actions: getActions(),
        data: getData(),
      };

      navigator.serviceWorker.ready.then((registration) => {
        registration.getNotifications().then((notifications) => {
          // close exisiting notifications
          notifications.forEach((notification) => {
            notification.close();
          });

          // show new notification
          registration.showNotification(title, notificationOptions);
        });
      });
    },

    setBrowserColorScheme(newValue) {
      if (DEBUG) console.log("setBrowserColorScheme triggered with", newValue);

      // if auto set meta color
      if (this.state.colorScheme === "auto") {
        setMetaThemeColor(newValue);
      }

      this.state.browserColorScheme = newValue;
    },

    setColorScheme(newValue) {
      if (DEBUG) console.log("setColorScheme triggered with", newValue);

      if ("localStorage" in window) {
        window.localStorage.setItem("colorScheme", newValue);
      }

      if (newValue === "auto") {
        setMetaThemeColor(this.state.browserColorScheme);
      } else {
        setMetaThemeColor(newValue);
      }

      this.state.colorScheme = newValue;
    },
  };

  navigator.serviceWorker.register("service-worker.js");

  // detect color schemes dark/light
  function detectColorScheme() {
    if (!window.matchMedia) {
      return;
    }

    function colorSchemeMediaQueryListener({ matches, media }) {
      if (!matches) {
        return;
      }

      if (media === MEDIA_QUERY_DARK_COLOR_SCHEME) {
        store.setBrowserColorScheme("dark");
      } else if (media === MEDIA_QUERY_LIGHT_COLOR_SCHEME) {
        store.setBrowserColorScheme("light");
      }
    }

    const mediaQueryDark = window.matchMedia(MEDIA_QUERY_DARK_COLOR_SCHEME);
    const mediaQueryLight = window.matchMedia(MEDIA_QUERY_LIGHT_COLOR_SCHEME);

    mediaQueryDark.addListener(colorSchemeMediaQueryListener);
    mediaQueryLight.addListener(colorSchemeMediaQueryListener);

    if (mediaQueryDark.matches) {
      store.setBrowserColorScheme("dark");
    } else if (mediaQueryLight.matches) {
      store.setBrowserColorScheme("light");
    }
  }
  detectColorScheme();

  Vue.component("toggle-button", {
    props: ["id", "onClick", "isActive", "label"],

    template: `
      <div class="toggle">
        <button
          role="switch"
          aria-labelledby="id"
          v-on:click="onClick"
          :aria-checked="isActive.toString()"
          class="toggle__button"
          :class="{ 'toggle__button--active': isActive }"
        >
          {{ isActive ? 'On' : 'Off' }}
        </button>

        <span
          class="toggle__label"
          id="id"
        >
          {{ label }}
        </span>
      </div>
    `,
  });

  Vue.component("loader", {
    props: ["isTimerRunning", "timerProgressPercentage"],

    methods: {
      loaderBarStyles: function () {
        return { height: `${this.calcuateHeightOfLoaderBar()}%` };
      },

      calcuateHeightOfLoaderBar: function () {
        if (!this.isTimerRunning) {
          return 0;
        }

        return 100 - this.timerProgressPercentage;
      },
    },

    template: `
      <div
        class="loader"
        :class="{ 'loader--active': isTimerRunning }"
      >
        <img
          class="loader__image"
          src="${IMAGES.timer}"
          role="presentation"
        />
        <div
          class="loader__bar"
          :style="loaderBarStyles()"
        >
        </div>
      </div>
    `,
  });

  const testAudio = new Audio("");
  const canPlayAudio = store.setCanPlayAudio(
    testAudio.canPlayType("audio/mp3")
  );

  if (canPlayAudio) {
    store.setAudio(SOUNDS[store.state.soundName]);
  }

  if ("localStorage" in window) {
    if (DEBUG) console.log(window.localStorage);

    const audioEnabled = window.localStorage.getItem("audioEnabled");
    if (audioEnabled !== null) {
      store.setAudioEnabled(JSON.parse(audioEnabled));
    }

    const soundName = window.localStorage.getItem("soundName");
    if (soundName !== null) {
      store.setSoundName(soundName);
    }

    const notificationsEnabled = window.localStorage.getItem(
      "notificationsEnabled"
    );
    if (notificationsEnabled !== null) {
      store.setNotificationsEnabled(JSON.parse(notificationsEnabled));
    }

    const timerRepeatAtEndEnabled = window.localStorage.getItem(
      "timerRepeatAtEndEnabled"
    );
    if (timerRepeatAtEndEnabled !== null) {
      store.setTimerRepeatAtEndEnabled(JSON.parse(timerRepeatAtEndEnabled));
    }

    const timerEndTimeMinutes = window.localStorage.getItem(
      "timerEndTimeMinutes"
    );
    if (timerEndTimeMinutes !== null) {
      store.setTimerEndTime(JSON.parse(timerEndTimeMinutes) * 60);
    }

    const timerCompleteCount =
      window.localStorage.getItem("timerCompleteCount");
    if (timerCompleteCount !== null) {
      store.setTimerCompleteCount(JSON.parse(timerCompleteCount));
    }

    const townPeople = window.localStorage.getItem("townPeople");
    if (townPeople !== null) {
      store.setTownPeople(JSON.parse(townPeople));
    }

    const colorScheme = window.localStorage.getItem("colorScheme");
    if (colorScheme !== null) {
      store.setColorScheme(colorScheme);
    }
  }

  const app = new Vue({
    el: "#app",
    data: {
      privateState: {},
      sharedState: store.state,
    },
    methods: {
      handleToggleAudioClick: function () {
        store.setAudioEnabled(!this.sharedState.audioEnabled);
      },

      handleTestAudioClick: function () {
        this.sharedState.audio.pause();
        this.sharedState.audio.currentTime = 0;
        this.sharedState.audio.play();
      },

      handleStopAudio: function () {
        this.sharedState.audio.pause();
        this.sharedState.audio.currentTime = 0;
      },

      handleAudioSelectChange: function (event) {
        const newSoundName = event.target.value;
        store.setSoundName(newSoundName);
      },

      handleToggleNotificationsClick: function () {
        if (this.sharedState.notificationsEnabled) {
          store.setNotificationsEnabled(false);
          return;
        }

        Notification.requestPermission().then((permission) => {
          store.handleNotificationPermission(permission);
        });
      },

      handleTestNotificationsClick: function () {
        console.log("hello lol");
        store.spawnNotification({
          title: "This is a test notification",
          test: true,
        });
      },

      handleStartPauseTimerClick: function () {
        this.handleStopAudio();

        if (!this.sharedState.timerRunning) {
          store.setTimerCurrentTime(0);
          store.setTimerRunning(true);
          return;
        }

        store.setTimerRunning(false);
      },

      handleResetTimerClick: function () {
        store.setTimerCurrentTime(0);
        store.setTimerRunning(false);
        this.handleStopAudio();
      },

      handleTimerEndTimeMinutesChange: function (e) {
        const newValue = e.target.value;
        store.setTimerEndTime(newValue * 60);
      },

      handleTimerRepeatAtEndEnabledClick: function (e) {
        store.setTimerRepeatAtEndEnabled(
          !this.sharedState.timerRepeatAtEndEnabled
        );
      },

      handleColorSchemeSelectChange: function (e) {
        const newValue = e.target.value;
        store.setColorScheme(newValue);
      },

      handleClearDataClick: function () {
        if ("localStorage" in window) {
          window.localStorage.clear();
        }
        window.location = window.location;
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", main);
