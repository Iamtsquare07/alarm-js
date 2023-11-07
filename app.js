let alarms = [];
const display = document.getElementById("display");
const alarmList = document.querySelector(".alarms");

// Load saved alarms from localStorage if available
if (localStorage.alarms) {
  alarms = JSON.parse(localStorage.alarms);
  alarms.forEach((alarm, index) => {
    // Create and append alarm items for loaded alarms
    const alarmTime = new Date(alarm.time);
    addAlarmToList(alarm.title, alarmTime);
    // Check the corresponding toggle switch if the alarm was active
    if (alarm.active) {
      alarms[index].interval = startAlarm(index);
      const toggleSwitch = alarm.toggleSwitch;
      toggleSwitch.checked = true;
    }
  });
  document.getElementById("alarmH2").style.display = "block";
}

function startAlarm(alarmIndex) {
  const alarm = alarms[alarmIndex];
  return setInterval(function () {
    const timeLeft = Math.max(0, Math.floor((alarm.time - new Date()) / 1000));
    displayCountdown(timeLeft, alarm.title);
    display.style.display = "inline";
    if (timeLeft === 0) {
      playAlarm();
      display.textContent = `Time for ${alarm.title}`;
      document.getElementById("stopAlarmButton").style.display = "block";
      clearInterval(alarm.interval);
    }
  }, 1000);
}

function addAlarmToList(alarmTitle, alarmTime) {
  // Create a new alarm item with a toggle switch
  const alarmItem = document.createElement("li");
  alarmItem.innerHTML = `
    <label>${alarmTitle} (${alarmTime.toLocaleTimeString()})</label>
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider round"></span>
    </label>
  `;

  const toggleSwitch = alarmItem.querySelector("input[type='checkbox']");
  toggleSwitch.addEventListener("change", function () {
    const alarmIndex = alarms.findIndex(
      (alarm) => alarm.toggleSwitch === toggleSwitch
    );
    if (toggleSwitch.checked) {
      // Start the countdown immediately
      alarms[alarmIndex].interval = startAlarm(alarmIndex);
    } else {
      // If the toggle is switched off, clear the alarm interval
      clearInterval(alarms[alarmIndex].interval);
      display.style.display = "none"; // Hide the display
    }
  });

  // Store alarm settings and state in the alarms array
  alarms.push({
    title: alarmTitle,
    time: alarmTime,
    toggleSwitch: toggleSwitch,
    interval: null,
    active: true, // Set alarm as active by default
  });

  alarmList.appendChild(alarmItem);
  document.getElementById("alarmH2").style.display = "block";
  
  // Save the alarms to localStorage
  localStorage.alarms = JSON.stringify(alarms);
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

  // Check if the selected time is earlier than the current time
  if (alarmDateTime <= now) {
    alarmDateTime.setDate(alarmDay + 1);
  }

  // Add the alarm to the list and start it immediately
  addAlarmToList(alarmTitle, alarmDateTime);
  startAlarm(alarms.length - 1);

  document.getElementById("alarmTime").value = "";
  document.getElementById("title").value = "";

  // Save the alarms to localStorage
  localStorage.alarms = JSON.stringify(alarms);
}

document.getElementById("stopAlarmButton").addEventListener("click", function () {
  stopAlarm();
});

function displayCountdown(seconds, alarmTitle) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  display.textContent = `${alarmTitle} starts in ${minutes}:${
    remainingSeconds < 10 ? "0" : ""
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
  
  // Save the alarms to localStorage after stopping an alarm
  localStorage.alarms = JSON.stringify(alarms);
}
