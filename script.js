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

// Get the dropdown element
const dropdown = document.querySelector('.dropdown');
// Get the dropdown content element
const dropdownContent = document.getElementById('history');

// Create an array to store the last 5 reset times
const resetTimes = [];

window.addEventListener('load', function() {
  stop.classList.remove('hidden')
  toggleElementDisable(stop, true);
  const storedHistory = localStorage.getItem("history");
  if (storedHistory) {
    resetTimes = JSON.parse(storedHistory);
    updateDropdownContent();
  }
});

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
  const days = Math.floor(time / (1000 * 60 * 60 * 24));

  const formattedSeconds = seconds % 60;
  const formattedMinutes = minutes % 60;
  const formattedHours = hours % 60;
  const formattedDays = days % 60

  return `${formattedDays}:${formattedHours}:${formattedMinutes}:${formattedSeconds}:${millis}`;
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

  resetTimes.unshift(elapsedTime);

  elapsedTime = 0;
  time.textContent = formatTime(elapsedTime);

  isRunning = false;
  toggleElementDisable(start, false);
  toggleElementDisable(stop, true);
  toggleElementDisable(reset, true);

  stop.textContent = "Stop";

  // Remove elapsed time from localStorage
  localStorage.removeItem("elapsedTime");

  // Add the reset time to the array
  // If there are more than 5 reset times, remove the oldest one
  if (resetTimes.length > 5) {
    resetTimes.pop();
  }
  localStorage.setItem("history", JSON.stringify(resetTimes));

  // Update the dropdown content
  updateDropdownContent();
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

const storedElapsedTime = localStorage.getItem("elapsedTime");
if (storedElapsedTime) {
  elapsedTime = parseInt(storedElapsedTime);
  time.textContent = formatTime(elapsedTime);
  toggleElementDisable(stop, true);
}

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

window.addEventListener("click", (event) => {
  if (event.target === resetPopup) {
    closeResetPopup();
    clearPreferencesButton.style.display = "block";
  } else if (event.target === clearPreferencesPopup) {
    closeClearPreferencesPopup();
    clearPreferencesButton.style.display = "block";
  }
});

// Function to update the dropdown content
// Get the history popup element
const historyPopup = document.getElementById("history-popup");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const successMessage = document.getElementById("success-message");

// Show history popup
dropdown.addEventListener("click", () => {
  historyPopup.style.display = "block";
});

// Close history popup when clicked outside
// Get the close button element
const closeButton = document.querySelector('.close-button');

// Close history popup when the close button is clicked
closeButton.addEventListener('click', () => {
  historyPopup.style.display = 'none';
});

// Close history popup when clicked outside
window.addEventListener('click', (event) => {
  if (event.target === historyPopup) {
    historyPopup.style.display = 'none';
  }
});

// Clear history when the "Clear History" button is clicked
clearHistoryButton.addEventListener("click", () => {
  resetTimes.length = 0; // Clear the resetTimes array
  localStorage.removeItem("history"); // Remove history from local storage
  updateDropdownContent(); // Update the dropdown content
  successMessage.textContent = "Successfully cleared history";
  successMessage.style.animation = "fadeOut 500s forwards";
  setTimeout(() => {
    successMessage.textContent = "";
    successMessage.style.animation = "";
  }, 5000);
});

// Update the dropdown content and history popup
const updateDropdownContent = () => {
  dropdownContent.innerHTML = ""; // Clear the existing dropdown content
  historyList.innerHTML = ""; // Clear the existing history popup content

  resetTimes.forEach((resetTime) => {
    const formattedResetTime = formatTime(resetTime);

    const newListItem = document.createElement("li");
    newListItem.textContent = formattedResetTime;

    const newHistoryItem = document.createElement("li");
    newHistoryItem.textContent = formattedResetTime;

    dropdownContent.appendChild(newListItem);
    historyList.appendChild(newHistoryItem);
  });
};

// Get the theme toggle buttons
const lightThemeButton = document.getElementById("light-theme");
const darkThemeButton = document.getElementById("dark-theme");

// Get the body element
const body = document.body;

// Add event listeners to the theme toggle buttons
lightThemeButton.addEventListener("click", () => {
  // Remove the dark theme class from the body
  body.classList.remove("dark-theme");
});

darkThemeButton.addEventListener("click", () => {
  // Add the dark theme class to the body
  body.classList.add("dark-theme");
});

// Check if the user has a preferred theme stored in localStorage
const preferredTheme = localStorage.getItem("theme");

// If the user has a preferred theme, set it
if (preferredTheme) {
  body.classList.add(preferredTheme);
}



