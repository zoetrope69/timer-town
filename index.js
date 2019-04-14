import { Component } from "preact";
import {
  addToHeadElements,
  setHeadTitle,
  classNames,
  detectColorScheme,
  formatTimeFromSeconds,
  handleTabInBackground,
  setMetaThemeColor,

  IS_SERVER_SIDE_BUILD,
  LOCALSTORAGE_AVAILABLE,
  META_URL,
  META_TITLE,
  META_DESCRIPTION,
  META_SHARE_IMAGE
} from "./helpers";
import {
  Button,
  Footer,
  Header,
  Heading,
  Input,
  Loader,
  Main,
  Message,
  Timer,
  ToggleButton
} from './components'

import "./style";

const PIZZA_IMAGE = "assets/images/pizza.png";
const SOUNDS = {
  gong: "assets/sounds/gong.mp3",
  bell: "assets/sounds/bell.mp3",
  foghorn: "assets/sounds/foghorn.mp3",
  "music-box": "assets/sounds/music-box.mp3",
  "chief-chef": "assets/sounds/chief-chef.mp3",
  "marshall-house": "assets/sounds/marshall-house.mp3",
  "beano-yelp": "assets/sounds/beano-yelp.mp3"
};

const DEFAULT_MINUTES_AMOUNT = 10;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      soundName: "gong",

      audio: null,
      canPlayAudio: false,
      audioPlaying: false,
      audioEnabled: false,

      notificationPermission: null,
      notificationsEnabled: false,
      notificationsDurationSeconds: 1,

      timer: null,
      timerPaused: false,
      timerRunning: false,
      timerCurrentTimeSeconds: 0,
      timerEndTimeSeconds: DEFAULT_MINUTES_AMOUNT * 60,
      timerEndTimeMinutes: DEFAULT_MINUTES_AMOUNT,
      timerRemainingTimeFormatted: formatTimeFromSeconds(
        DEFAULT_MINUTES_AMOUNT * 60
      ),
      timerProgressPercentage: 0,
      timerIntervalSeconds: 1,
      timerRepeatAtEndEnabled: false,

      browserColorScheme: null,
      colorScheme: "auto"
    };

    this.handleToggleAudioClick = this.handleToggleAudioClick.bind(this);
    this.handleStartPauseTimerClick = this.handleStartPauseTimerClick.bind(
      this
    );
    this.handleTimerEndTimeMinutesChange = this.handleTimerEndTimeMinutesChange.bind(
      this
    );
    this.handleTimerEndTimeMinutesFocus = this.handleTimerEndTimeMinutesFocus.bind(
      this
    );
    this.handleResetTimerClick = this.handleResetTimerClick.bind(this);
    this.handleAudioSelectChange = this.handleAudioSelectChange.bind(this);
    this.handleTimerRepeatAtEndEnabledClick = this.handleTimerRepeatAtEndEnabledClick.bind(
      this
    );
    this.handleAudioSelectChange = this.handleAudioSelectChange.bind(this);
    this.handleTestAudioClick = this.handleTestAudioClick.bind(this);
    this.handleToggleNotificationsClick = this.handleToggleNotificationsClick.bind(
      this
    );
    this.handleTestNotificationsClick = this.handleTestNotificationsClick.bind(
      this
    );
    this.handleColorSchemeSelectChange = this.handleColorSchemeSelectChange.bind(
      this
    );

    handleTabInBackground(inBackground => {
      if (!this.timerRunning) {
        return;
      }

      this.setTimerRunning(false);
      this.setTimerIntervalSeconds(inBackground ? 2 : 1);
      this.setTimerRunning(true);
    });

    detectColorScheme(this.setBrowserColorScheme);

    addToHeadElements(`
      <meta name="title" content="${META_TITLE} | ${META_DESCRIPTION}">
      <meta name="description" content="${META_DESCRIPTION}">

      <!-- open graph / facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="${META_URL}">
      <meta property="og:title" content="${META_TITLE}">
      <meta property="og:description" content="${META_DESCRIPTION}">
      <meta property="og:image" content="${META_SHARE_IMAGE}">

      <!-- twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="${META_URL}">
      <meta property="twitter:title" content="${META_TITLE}">
      <meta property="twitter:description" content="${META_DESCRIPTION}">
      <meta property="twitter:image" content="${META_SHARE_IMAGE}">
    `);

    this.setTitle();
    this.initSettingsFromLocalStorage();
    this.initAudio();
    this.handleNotificationClickMessages();
  }

  // setters

  initSettingsFromLocalStorage() {
    if (!LOCALSTORAGE_AVAILABLE) {
      return;
    }

    const audioEnabled = window.localStorage.getItem("audioEnabled");
    if (audioEnabled !== null) {
      this.setAudioEnabled(JSON.parse(audioEnabled));
    }

    const soundName = window.localStorage.getItem("soundName");
    if (soundName !== null) {
      this.setSoundName(soundName);
    }

    const notificationsEnabled = window.localStorage.getItem(
      "notificationsEnabled"
    );
    if (notificationsEnabled !== null) {
      this.setNotificationsEnabled(JSON.parse(notificationsEnabled));
    }
    // check if notificaions are blocked after getting local copy
    this.initNotificationsPermissions();

    const timerRepeatAtEndEnabled = window.localStorage.getItem(
      "timerRepeatAtEndEnabled"
    );
    if (timerRepeatAtEndEnabled !== null) {
      this.setTimerRepeatAtEndEnabled(JSON.parse(timerRepeatAtEndEnabled));
    }

    const timerEndTimeMinutes = window.localStorage.getItem(
      "timerEndTimeMinutes"
    );
    if (timerEndTimeMinutes !== null) {
      this.setTimerEndTime(JSON.parse(timerEndTimeMinutes) * 60);
    }

    const colorScheme = window.localStorage.getItem("colorScheme");
    if (colorScheme !== null) {
      this.setColorScheme(colorScheme);
    }
  }

  initNotificationsPermissions() {
    const { notificationPermission } = this.state;

    if (!notificationPermission || notificationPermission === Notification.permission) {
      return;
    }

    this.handleNotificationPermission(Notification.permission);
  }

  setTitle(title) {
    if (!title) {
      setHeadTitle(`${META_TITLE} | ${META_DESCRIPTION}`);
      return;
    }

    setHeadTitle(`${title} | ${META_TITLE}`);
  }

  triggerEndOfTimer() {
    const {
      audio,
      audioEnabled,
      notificationsEnabled,
      timerRepeatAtEndEnabled
    } = this.state;

    if (audioEnabled) {
      audio.play();
    }

    if (notificationsEnabled) {
      this.spawnNotification({
        title: "Timer finished",
        body: timerRepeatAtEndEnabled
          ? "Timer starting again. Click to stop timer again."
          : "Click to start timer again"
      });
    }

    if (this.state.timerRepeatAtEndEnabled) {
      this.setTimerCurrentTime(0);
    } else {
      this.setTimerRunning(false);
    }
  }

  setTimeProgressPercentage() {
    const { timerEndTimeSeconds, timerCurrentTimeSeconds } = this.state;

    const newTimerRemainingTimeFormatted = formatTimeFromSeconds(
      timerEndTimeSeconds - timerCurrentTimeSeconds
    );

    const newTimerProgressPercentage =
      (timerCurrentTimeSeconds / timerEndTimeSeconds) * 100;

    this.setTitle(newTimerRemainingTimeFormatted);
    this.setState({
      timerRemainingTimeFormatted: newTimerRemainingTimeFormatted,
      timerProgressPercentage: newTimerProgressPercentage
    });
  }

  progressTimer() {
    const {
      timerCurrentTimeSeconds,
      timerEndTimeSeconds,
      timerIntervalSeconds
    } = this.state;

    if (timerCurrentTimeSeconds >= timerEndTimeSeconds) {
      this.triggerEndOfTimer();
      return;
    }

    this.setTimerCurrentTime(timerCurrentTimeSeconds + timerIntervalSeconds);
  }

  setTimerPaused(newValue) {
    this.setState({ timerPaused: newValue });
  }

  setTimerCurrentTime(newValue) {
    this.setState({ timerCurrentTimeSeconds: newValue });
    this.setTimeProgressPercentage();
  }

  setTimerEndTime(newValue) {
    const newTimerEndTimeMinutes = newValue / 60;

    if (LOCALSTORAGE_AVAILABLE) {
      window.localStorage.setItem(
        "timerEndTimeMinutes",
        newTimerEndTimeMinutes
      );
    }

    this.setState({
      timerEndTimeSeconds: newValue,
      timerEndTimeMinutes: newTimerEndTimeMinutes
    });
    this.setTimeProgressPercentage();
  }

  setTimerIntervalSeconds(newValue) {
    this.setState({ timerIntervalSeconds: newValue });
  }

  setTimerRunning(newValue) {
    this.setState({ timerRunning: newValue });

    if (newValue === false) {
      clearInterval(this.state.timer);
      this.setState({ timer: null });
      return;
    }

    const newTimer = setInterval(
      () => this.progressTimer(),
      this.state.timerIntervalSeconds * 1000
    );

    this.progressTimer();
    this.setState({ timer: newTimer });
  }

  setTimerRepeatAtEndEnabled(newValue) {
    if (LOCALSTORAGE_AVAILABLE) {
      window.localStorage.setItem("timerRepeatAtEndEnabled", newValue);
    }
    this.setState({ timerRepeatAtEndEnabled: newValue });
  }

  setSoundName(newValue) {
    if (LOCALSTORAGE_AVAILABLE) {
      window.localStorage.setItem("soundName", newValue);
    }
    this.setState({ soundName: newValue });
    this.setAudio(SOUNDS[newValue]);
  }

  initAudio() {
    if (IS_SERVER_SIDE_BUILD) {
      return;
    }

    const testAudio = new Audio("");
    const canPlayAudio = this.setCanPlayAudio(
      testAudio.canPlayType("audio/mp3")
    );

    if (!canPlayAudio) {
      return;
    }

    this.setAudio(SOUNDS[this.state.soundName]);
  }

  setAudio(newValue) {
    const newAudio = new Audio(newValue);
    newAudio.preload = true;

    this.setState({ audio: newAudio });
  }

  setCanPlayAudio(newValue) {
    const canProbablyPlayAudio = newValue !== "";

    this.setState({ canPlayAudio: canProbablyPlayAudio });

    if (canProbablyPlayAudio === false) {
      this.setAudioEnabled(false);
    }

    return canProbablyPlayAudio;
  }

  setAudioEnabled(newValue) {
    const { audio } = this.state;

    if (audio && newValue === false) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (LOCALSTORAGE_AVAILABLE) {
      window.localStorage.setItem("audioEnabled", newValue);
    }
    this.setState({ audioEnabled: newValue });
  }

  setNotificationsDurationSeconds(newValue) {
    this.setState({ notificationsDurationSeconds: newValue });
  }

  setNotificationsEnabled(newValue) {
    if (LOCALSTORAGE_AVAILABLE) {
      window.localStorage.setItem("notificationsEnabled", newValue);
    }
    this.setState({ notificationsEnabled: newValue });
  }

  spawnNotification({ title, body, image, test }) {
    const {
      timerRepeatAtEndEnabled,
      notificationsDurationSeconds
    } = this.state;

    const getTag = () => {
      if (test) {
        return "pizza-timer-notification--test";
      }

      if (timerRepeatAtEndEnabled) {
        return "pizza-timer-notification--repeat";
      }

      return "pizza-timer-notification";
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
        { action: "stop", title: "Stop" }
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
        url: location.href
      };
    };

    const notificationOptions = {
      tag: getTag(),
      requireInteraction: getRequireInteraction(),
      body,
      badge: PIZZA_IMAGE,
      icon: PIZZA_IMAGE,
      image,
      actions: getActions(),
      data: getData()
    };

    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications().then(notifications => {
        // close exisiting notifications
        notifications.forEach(notification => {
          notification.close();
        });

        // show new notification
        registration.showNotification(title, notificationOptions);
      });
    });
  }

  setBrowserColorScheme(newValue) {
    const { colorScheme } = this.state;

    // if auto set meta color
    if (colorScheme === "auto") {
      setMetaThemeColor(newValue);
    }

    this.setState({ browserColorScheme: newValue });
  }

  setColorScheme(newValue) {
    if (this.state.colorScheme === newValue) {
      // hasn't changed don't change anything
      return;
    }

    if (LOCALSTORAGE_AVAILABLE) {
      window.localStorage.setItem("colorScheme", newValue);
    }
    this.setState({ colorScheme: newValue });

    if (newValue === "auto") {
      setMetaThemeColor(this.state.browserColorScheme);
      return;
    }

    setMetaThemeColor(newValue);
  }

  // handlers

  handleNotificationClickMessages() {
    if (IS_SERVER_SIDE_BUILD || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('service-worker.js');

    navigator.serviceWorker.addEventListener("message", event => {
      const { data } = event;

      const dontDoAnthing = data.close || data.dataSentToNotification.test; // test notification
      if (dontDoAnthing) {
        return;
      }

      const stopTimer =
        data.dataSentToNotification.timerRepeatAtEndEnabled ||
        data.action === "stop";
      if (stopTimer) {
        this.setTimerCurrentTime(0);
        this.setTimerPaused(false);
        this.setTimerRunning(false);
        return;
      }

      // otherwise you've clicked the notification/start button
      // start the timer again
      this.setTimerCurrentTime(0);
      this.setTimerRunning(true);
    });
  }

  handleNotificationPermission(newValue) {
    this.setState({ notificationPermission: newValue });

    const notificationsGranted = newValue === "granted";

    this.setNotificationsEnabled(notificationsGranted);

    return notificationsGranted;
  }

  handleToggleAudioClick() {
    this.setAudioEnabled(!this.state.audioEnabled);
  }

  handleTestAudioClick() {
    const { audio } = this.state;

    this.handleStopAudio();
    audio.play();
  }

  handleStopAudio() {
    const { audio } = this.state;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }

  handleAudioSelectChange(e) {
    const newSoundName = e.target.value;
    this.setSoundName(newSoundName);
  }

  handleStartPauseTimerClick() {
    const { timer, timerPaused } = this.state;
    this.handleStopAudio();

    if (!timer) {
      this.setTimerCurrentTime(0);
      this.setTimerRunning(true);
      this.setTimerPaused(false);
      return;
    }

    this.setTimerRunning(false);
    this.setTimerPaused(!timerPaused);
  }

  handleTestNotificationsClick() {
    this.spawnNotification({
      title: "This is a test notification",
      test: true
    });
  }

  handleToggleNotificationsClick() {
    if (this.state.notificationsEnabled) {
      this.setNotificationsEnabled(false);
      return;
    }

    Notification.requestPermission().then(permission => {
      this.handleNotificationPermission(permission);
    });
  }

  handleResetTimerClick() {
    this.setTimerCurrentTime(0);
    this.setTimerPaused(false);
    this.setTimerRunning(false);
    this.handleStopAudio();
  }

  handleTimerEndTimeMinutesChange(e) {
    const newValue = e.target.value;
    const newEndTime = Math.max(0.1, newValue);
    this.setTimerEndTime(newEndTime * 60);
  }

  handleTimerEndTimeMinutesFocus() {
    if (!this.state.timerRunning) {
      return;
    }
    
    this.setTimerCurrentTime(0);
    this.setTimerPaused(false);
    this.setTimerRunning(false);
  }

  handleTimerRepeatAtEndEnabledClick() {
    this.setTimerRepeatAtEndEnabled(!this.state.timerRepeatAtEndEnabled);
  }

  handleColorSchemeSelectChange(e) {
    const newValue = e.target.value;
    this.setColorScheme(newValue);
  }

  render(props, state) {
    const {
      audioEnabled,
      browserColorScheme,
      colorScheme,
      isTimerRunning,
      notificationPermission,
      notificationsEnabled,
      soundName,
      timerEndTimeMinutes,
      timerProgressPercentage,
      timerRemainingTimeFormatted,
      timerRepeatAtEndEnabled,
      timerRunning
    } = state;

    return (
      <div
        id="app"
        class={classNames({
          "color-scheme--dark": colorScheme === "dark",
          "color-scheme--light": colorScheme === "light"
        })}
      >
        <Main>
          <Header faded={timerRunning} />
          
          <Timer>
            {timerRemainingTimeFormatted}

            <Loader
              pizzaImage={PIZZA_IMAGE}
              isTimerRunning={isTimerRunning}
              timerProgressPercentage={timerProgressPercentage}
            />
          </Timer>
          

          <Button onClick={this.handleStartPauseTimerClick} isPrimary isBigger>
            {timerRunning ? "Stop" : "Start"}
          </Button>

          <Button isSecondary isBigger onClick={this.handleResetTimerClick}>
            Reset
          </Button>

          <Heading>
            Timer
          </Heading>

          <Input
            type="number"
            id="timer-end-time"
            label="Timer end time (minutes)"
            value={timerEndTimeMinutes}
            onChange={this.handleTimerEndTimeMinutesChange}
            onFocus={this.handleTimerEndTimeMinutesFocus}
          />

          <ToggleButton
            id="timer-repeat-at-end-enabled"
            onClick={this.handleTimerRepeatAtEndEnabledClick}
            isActive={timerRepeatAtEndEnabled}
            label="Repeat timer automatically"
          />

          <Heading>
            Audio
          </Heading>

          <ToggleButton
            id="audio-enabled"
            onClick={this.handleToggleAudioClick}
            isActive={audioEnabled}
            label="Audio"
          />

          {audioEnabled && (
            <div>
              <Input
                type="select"
                id="sound-select"
                label="Sound"
                options={[
                  { value: "gong", text: "Gong", icon: "🍃" },
                  { value: "bell", text: "Bell", icon: "🔔" },
                  { value: "foghorn", text: "Foghorn", icon: "🚢" },
                  { value: "music-box", text: "Music Box", icon: "🎶" },
                  { value: "chief-chef", text: "Chief Chef", icon: "👨‍🍳" },
                  {
                    value: "marshall-house",
                    text: "Marshall House",
                    icon: "🏠"
                  },
                  { value: "beano-yelp", text: "Beano Yelp", icon: "😱" }
                ]}
                value={soundName}
                disabled={!audioEnabled}
                onChange={this.handleAudioSelectChange}
              />

              <Button isSecondary onClick={this.handleTestAudioClick}>
                Test audio
              </Button>
            </div>
          )}

          <Heading>
            Notifications
          </Heading>

          <ToggleButton
            id="notifications-enabled"
            onClick={this.handleToggleNotificationsClick}
            isActive={notificationsEnabled}
            label="Notifications"
            disabled={notificationPermission === "denied"}
          />

          {notificationPermission === "denied" && (
            <Message isErrored>
              Notifications are blocked. You'll need to reallow them to handle notifications.
            </Message>
          )}

          {notificationsEnabled && (
            <Button onClick={this.handleTestNotificationsClick} isSecondary>
              Test push notification
            </Button>
          )}

          <Heading>
            Dark mode
          </Heading>

          <Message>
            Force it to be dark/light mode. Matches your default computer settings when set to 'Auto'.
          </Message>

          <Input
            type="select"
            id="color-scheme-select"
            label="Color scheme"
            value={colorScheme}
            options={[
              { value: "auto", text: "Auto", icon: "🌬️" },
              { value: "dark", text: "Dark", icon: "🌚" },
              { value: "light", text: "Light", icon: "🌞" }
            ]}
            onChange={this.handleColorSchemeSelectChange}
          />

          {colorScheme === "auto" && (
            <div>
              {!browserColorScheme && (
                <Message>No specific color scheme detected.</Message>
              )}
              {browserColorScheme === "dark" && (
                <Message>Dark mode color scheme detected.</Message>
              )}
              {browserColorScheme === "light" && (
                <Message>Light mode color scheme detected.</Message>
              )}
            </div>
          )}
        </Main>

        <Footer />
      </div>
    );
  }
}

export default App;
