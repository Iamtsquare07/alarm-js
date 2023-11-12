let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let nextAlarmId = localStorage.getItem('nextAlarmId') || 1;
const display = document.getElementById("display");
const alarmList = document.querySelector(".alarms");

function startAlarm(alarmIndex) {
  const alarm = alarms[alarmIndex];
  return setInterval(function () {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Check if the alarm is set for today based on recurring days
    if (alarm.days.includes(currentDay)) {
      const timeLeft = Math.max(0, Math.floor((alarm.time - currentDate) / 1000));
      displayCountdown(timeLeft, alarm.title);
      display.style.display = "inline";
      if (timeLeft === 0) {
        playAlarm();
        display.textContent = `Time for ${alarm.title}`;
        document.getElementById("stopAlarmButton").style.display = "block";
        clearInterval(alarm.interval);
      }
    }
  }, 1000);
}

function addAlarmToList(alarmTitle, alarmTime, selectedDays) {
  const alarmItem = document.createElement("li");
  const alarmId = nextAlarmId++;
  const daysAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const selectedDaysSet = new Set(selectedDays);

  alarmItem.innerHTML = `
    <label>${alarmTitle} (${alarmTime.toLocaleTimeString()})</label>
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider round"></span>
    </label>
    <div class="days-container">
      ${daysAbbreviations.map(day => `<span class="${selectedDaysSet.has(day) ? 'active' : ''}">${day}</span>`).join(' ')}
    </div>
    <button class="edit-button">Edit</button>
  `;

  const toggleSwitch = alarmItem.querySelector("input[type='checkbox']");
  toggleSwitch.addEventListener("change", function () {
    const alarmIndex = alarms.findIndex((alarm) => alarm.id === alarmId);
    if (toggleSwitch.checked) {
      alarms[alarmIndex].interval = startAlarm(alarmIndex);
    } else {
      clearInterval(alarms[alarmIndex].interval);
      display.style.display = "none";
    }
  });

  const editButton = alarmItem.querySelector(".edit-button");
  editButton.addEventListener("click", function () {
    editAlarm(alarmId);
  });

  alarms.push({
    id: alarmId,
    title: alarmTitle,
    time: alarmTime,
    toggleSwitch: toggleSwitch,
    interval: null,
    active: true,
    days: selectedDays || [],
  });

  alarmList.appendChild(alarmItem);
  document.getElementById("alarmH2").style.display = "block";

  // Save the updated alarms and nextAlarmId to localStorage
  localStorage.setItem('alarms', JSON.stringify(alarms));
  localStorage.setItem('nextAlarmId', nextAlarmId);
}





document.getElementById("setAlarmButton").addEventListener("click", addAlarm);

document.getElementById("title").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addAlarm();
});

function addAlarm() {
  const alarmTime = document.getElementById("alarmTime").value;
  const alarmTitle = document.getElementById("title").value;
  const selectedDays = getSelectedDays();

  if (!alarmTime) {
    alert("Please select a valid time for the alarm.");
    return;
  }

  if (!alarmTitle) {
    alert("Please select a valid title for the alarm.");
    return;
  }

  const now = new Date();
  const [hour, minute] = alarmTime.split(":");
  let alarmYear = now.getFullYear();
  let alarmMonth = now.getMonth();
  let alarmDay = now.getDate();

  const alarmDateTime = new Date(alarmYear, alarmMonth, alarmDay, hour, minute);

  if (alarmDateTime <= now) {
    alarmDateTime.setDate(alarmDay + 1);
  }

  addAlarmToList(alarmTitle, alarmDateTime, selectedDays);
  startAlarm(alarms.length - 1);

  document.getElementById("alarmTime").value = "";
  document.getElementById("title").value = "";
}

function getSelectedDays() {
  const daysCheckboxes = document.querySelectorAll(".days-container input[type='checkbox']");
  const selectedDays = [];

  daysCheckboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      selectedDays.push(checkbox.id.substring(6, 9)); // Extract the day abbreviation (e.g., 'repeatMonday' becomes 'Mon')
    }
  });

  return selectedDays;
}


document.getElementById("stopAlarmButton").addEventListener("click", function () {
  stopAlarm();
});

function displayCountdown(seconds, alarmTitle) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  display.textContent = `${alarmTitle} starts in ${
    minutes}:${remainingSeconds < 10 ? "0" : ""
  }${remainingSeconds}`;
}

function playAlarm() {
  const alarmSound = document.getElementById("alarmSound");
  alarmSound.play();
}

function stopAlarm() {
  document.getElementById("stopAlarmButton").style.display = "none";
  display.style.display = "none";
  alarms.forEach((alarm) => {
    clearInterval(alarm.interval);
  });
  document.getElementById("alarmSound").pause();
  document.getElementById("alarmSound").currentTime = 0;
}

function editAlarm(alarmId) {
  const alarmIndex = alarms.findIndex((alarm) => alarm.id === alarmId);
  const editedAlarm = alarms[alarmIndex];

  // Implement logic to show a modal for editing and updating the alarm data
  // Update the selected days for the alarm based on user input

  // Restart the alarm with the updated data
  clearInterval(editedAlarm.interval);
  editedAlarm.interval = startAlarm(alarmIndex);

  // Save the updated alarms to localStorage
  localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Load alarms from localStorage when the page loads
window.addEventListener('load', () => {
  if (alarms.length > 0) {
    alarms.forEach((alarm, index) => {
      const alarmDateTime = new Date(alarm.time);
      if (alarmDateTime > new Date()) {
        addAlarmToList(alarm.title, alarmDateTime, alarm.days);
        alarms[index].interval = startAlarm(index);
      }
    });
  }
});
