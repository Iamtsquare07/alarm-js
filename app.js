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

function addAlarmToList(alarmTitle, alarmTime) {
  const alarmItem = document.createElement("li");
  const alarmId = nextAlarmId++;
  alarmItem.innerHTML = `
    <label>${alarmTitle} (${alarmTime.toLocaleTimeString()})</label>
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider round"></span>
    </label>
    <div class="days-container">
      <label>Repeat on:</label>
      <input type="checkbox" id="repeatMonday"> Mon
      <input type="checkbox" id="repeatWednesday"> Wed
      <!-- Add more checkboxes for other days as needed -->
    </div>
    <button class="edit-button">Edit</button>
  `;

  const toggleSwitch = alarmItem.querySelector("input[type='checkbox']");
  toggleSwitch.addEventListener("change", function () {
    const alarmIndex = alarms.findIndex(
      (alarm) => alarm.id === alarmId
    );
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

  const daysCheckboxes = alarmItem.querySelectorAll(".days-container input[type='checkbox']");
  daysCheckboxes.forEach((checkbox, index) => {
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        alarms[alarmIndex].days.push(index); // Store the selected day index
      } else {
        const dayIndex = alarms[alarmIndex].days.indexOf(index);
        if (dayIndex !== -1) {
          alarms[alarmIndex].days.splice(dayIndex, 1); // Remove the selected day index
        }
      }
    });
  });

  alarms.push({
    id: alarmId,
    title: alarmTitle,
    time: alarmTime,
    toggleSwitch: toggleSwitch,
    interval: null,
    active: true,
    days: [], // Array to store selected days for recurring alarm
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

  addAlarmToList(alarmTitle, alarmDateTime);
  startAlarm(alarms.length - 1);

  document.getElementById("alarmTime").value = "";
  document.getElementById("title").value = "";
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

// Load alarms from localStorage when the page loads
window.addEventListener('load', () => {
  if (alarms.length > 0) {
    alarms.forEach((alarm, index) => {
      const alarmDateTime = new Date(alarm.time);
      if (alarmDateTime > new Date()) {
        addAlarmToList(alarm.title, alarmDateTime);
        alarms[index].interval = startAlarm(index);
      }
    });
  }
});
