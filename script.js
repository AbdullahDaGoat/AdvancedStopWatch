const time = document.getElementById("time");
const start = document.getElementById("start");
const stop = document.getElementById("stop");
const reset = document.getElementById("reset");
const resetPopup = document.getElementById("reset-popup");
const resetConfirmButton = document.getElementById("reset-confirm");
const resetCancelButton = document.getElementById("reset-cancel");
const rememberChoiceCheckbox = document.getElementById("remember-choice");

const clearPreferencesButton = document.getElementById("clear-preferences");
const clearPreferencesPopup = document.getElementById("clear-preferences-popup");
const clearPreferencesConfirmButton = document.getElementById("clear-preferences-confirm");
const clearPreferencesCancelButton = document.getElementById("clear-preferences-cancel");

let startTime = 0;
let elapsedTime = 0;
let timerId = null;
let isRunning = false;
let shouldPromptReset = true;

const toggleElementDisable = (element, disable) => {
  disable
    ? element.setAttribute("disabled", true)
    : element.removeAttribute("disabled");
};

const formatTime = (time) => {
  const seconds = Math.floor(time / 1000);
  const millis = Math.floor((time % 1000) / 10);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const formattedSeconds = seconds % 60;
  const formattedMinutes = minutes % 60;
  const formattedHours = hours % 60;

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${millis}`;
};

const startTimer = () => {
  if (!isRunning) {
    startTime = Date.now() - elapsedTime;
    timerId = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      time.textContent = formatTime(elapsedTime);
    }, 10);

    isRunning = true;
    toggleElementDisable(start, true);
    toggleElementDisable(stop, false);
    toggleElementDisable(reset, true);
  }
};

const stopTimer = () => {
  clearInterval(timerId);

  isRunning = false;
  toggleElementDisable(start, false);
  toggleElementDisable(stop, true);
  toggleElementDisable(reset, false);

  if (elapsedTime === 0) {
    stop.textContent = "Stop";
  } else {
    stop.textContent = "Reset";
  }

  // Save elapsed time to localStorage
  localStorage.setItem("elapsedTime", elapsedTime);
};

const resetTimer = () => {
  if (shouldPromptReset) {
    resetPopup.style.display = "block";
  } else {
    performReset();
  }
};

const performReset = () => {
  clearInterval(timerId);

  elapsedTime = 0;
  time.textContent = formatTime(elapsedTime);

  isRunning = false;
  toggleElementDisable(start, false);
  toggleElementDisable(stop, true);
  toggleElementDisable(reset, true);

  stop.textContent = "Stop";

  // Remove elapsed time from localStorage
  localStorage.removeItem("elapsedTime");
};

const closeResetPopup = () => {
  resetPopup.style.display = "none";
};

const clearPreferences = () => {
  clearPreferencesPopup.style.display = "block";
};

const performClearPreferences = () => {
  localStorage.removeItem("elapsedTime");
  localStorage.removeItem("shouldPromptReset");
  shouldPromptReset = true;
  rememberChoiceCheckbox.checked = false;
  closeClearPreferencesPopup();
};

const closeClearPreferencesPopup = () => {
  clearPreferencesPopup.style.display = "none";
};

resetConfirmButton.addEventListener("click", () => {
  performReset();
  if (rememberChoiceCheckbox.checked) {
    shouldPromptReset = false;
    localStorage.setItem("shouldPromptReset", false);
  }
  closeResetPopup();
});

resetCancelButton.addEventListener("click", () => {
  closeResetPopup();
});

clearPreferencesConfirmButton.addEventListener("click", () => {
  performClearPreferences();
});

clearPreferencesCancelButton.addEventListener("click", () => {
  closeClearPreferencesPopup();
});

// Check if elapsed time is stored in localStorage
const storedElapsedTime = localStorage.getItem("elapsedTime");
if (storedElapsedTime) {
  elapsedTime = parseInt(storedElapsedTime);
  time.textContent = formatTime(elapsedTime);
  toggleElementDisable(stop, true);
}

// Check if shouldPromptReset is stored in localStorage
const storedShouldPromptReset = localStorage.getItem("shouldPromptReset");
if (storedShouldPromptReset === "false") {
  shouldPromptReset = false;
  rememberChoiceCheckbox.checked = true;
}

start.addEventListener("click", startTimer);
stop.addEventListener("click", () => {
  if (isRunning) {
    stopTimer();
  } else {
    if (elapsedTime === 0) {
      resetTimer();
    } else {
      startTimer();
    }
  }
});
reset.addEventListener("click", resetTimer);
clearPreferencesButton.addEventListener("click", clearPreferences);