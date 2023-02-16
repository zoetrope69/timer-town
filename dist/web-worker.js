const TIMER_INTERVAL_SECONDS = 1;
let timer = setInterval(() => {
  postMessage("tick");
}, TIMER_INTERVAL_SECONDS * 1000);

onmessage = function ({ data }) {
  if (data === "clear") {
    clearInterval(timer);
  }
};
