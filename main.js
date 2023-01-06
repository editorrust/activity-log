// ==========================================
// Init and save
// ==========================================

let activities = [];

let settingsInit = {
   runWhileClosed: false,
   oneTaskWorkflow: false,
   lastTick: Date.now(),
   collapse: "short"
};
let settings = settingsInit;

// Stats vars
let labels = [];
let data = [];

if (localStorage.getItem("activitytrackersave")) {
   activities = JSON.parse(localStorage.getItem("activitytrackersave"));
   settings = JSON.parse(localStorage.getItem("activitytrackersettingssave"));
   reinit();
} else {
   activities = [];
   settings = settingsInit;
}

let save = setInterval(() => {
   localStorage.setItem("activitytrackersave", JSON.stringify(activities));
   localStorage.setItem( "activitytrackersettingssave", JSON.stringify(settings));
}, 500);

function reinit() {
   activities.forEach((el, i, arr) => { createActivity(el[0], i); });
   // Select the right radio button
   document.querySelector(`#${settings.collapse}`).checked = true;
}

function clearSave() {
   if (confirm("Are you sure you want to delete your save?")) {
      activities = [];
      localStorage.setItem("activitytrackersave", JSON.stringify(activities));
      window.location.href = window.location.href; // Only for codepen
      // location.reload(); // Normal
   }
}

function exportSave() {
   let txt = document.querySelector(".exportdata");
   txt.value = JSON.stringify(activities);
   txt.select();
   txt.setSelectionRange(0, 99999); // mobile
   navigator.clipboard.writeText(txt.value);
   alert("Data saved to clipboard!");
}

function importSave() {
   if (confirm("This will delete your current save. Are you sure?")) {
      let inputTxt = prompt("Enter save...");
      activities = JSON.parse(inputTxt);
      window.location.href = window.location.href; // Only for codepen
      // location.reload(); // Normal
   }
}

// Collapse settings
function saveCollapseSettings() {
   let collapseoption = document.querySelector("input[name='collapsesettings']:checked").value;
   settings.collapse = collapseoption;
}

// ==========================================
// Tasks
// ==========================================

// When entering tasks
function textentered() {
   if (document.querySelector(".newActivity").value !== "")
      document.querySelector(".newActivityBtn").disabled = false;
   else if (document.querySelector(".newActivity").value == "")
      document.querySelector(".newActivityBtn").disabled = true;
}

// On enter in input
document.querySelector(".newActivity").addEventListener("keyup", (event) => {
   if (event.key === "Enter" && document.querySelector(".newActivity").value !== "") newActivity();
});

// For from save
function restartActivity(activity) {
   document.querySelector(".newActivity").value = activity;
   newActivity();
}

// Only when making a new actity
function newActivity() {
   document.querySelector(".newActivityBtn").disabled = true;
   let activityName = document.querySelector(".newActivity").value;
   document.querySelector(".newActivity").value = "";
   let activity = activities.push([activityName, "time", "working", true, { start: new Date(), finish: undefined }]) - 1;
   createActivity(activityName, activity);
}

// Recreates or creates a task
function createActivity(activityName, activity) {
   document.querySelector(".activityProgressing").textContent = "";
   // Activity parent
   let element = document.createElement("DIV");
   element.classList.add("activity");
   // Activity Name
   let elName = document.createElement("H4");
   elName.textContent = activityName;
   element.appendChild(elName);
   // Counter
   let elCount = document.createElement("SPAN");
   element.appendChild(elCount);
   // Controls
   let controls = document.createElement("DIV");
   controls.classList.add("controls");
   element.appendChild(controls);
   // Pause button
   let elPause = document.createElement("SPAN");
   elPause.classList.add("pauseActivity");
   // Check if paused before styling
   if (activities[activity][3])
      elPause.innerHTML = "<span class='material-symbols-rounded'>pause</span>";
   else
      elPause.innerHTML = "<span class='material-symbols-rounded'>play_arrow</span>";
   elPause.onclick = () => {
      if (activities[activity][3]) {
         clearInterval(timerRun);
         activities[activity][3] = false;
         elPause.innerHTML = "<span class='material-symbols-rounded'>play_arrow</span>";
      } else {
         startInterval();
         activities[activity][3] = true;
         elPause.innerHTML = "<span class='material-symbols-rounded'>pause</span>";
      }
   };
   controls.appendChild(elPause);
   // Finish button
   let elFinish = document.createElement("SPAN");
   elFinish.classList.add("finishActivity");
   elFinish.innerHTML = "<span class='material-symbols-rounded'>done</span>";
   elFinish.onclick = () => {
      finishActivity();
   };
   controls.appendChild(elFinish);
   // Remove button
   let elRemove = document.createElement("SPAN");
   elRemove.classList.add("cancelActivity");
   elRemove.innerHTML = "<span class='material-symbols-rounded'>close</span>";
   elRemove.onclick = () => {
      clearInterval(timerRun);
      element.remove();
      let spliced = activities.splice(activity, 1);
      if (!document.querySelector(".activitiesProgressing").firstChild) document.querySelector(".activityProgressing").textContent = "No tasks in progress";
   };
   controls.appendChild(elRemove);

   // Add activity to page
   document.querySelector(".activitiesProgressing").appendChild(element);

   // Timer
   let timer;
   if (activities[activity][1] == "time") timer = 0;
   else timer = activities[activity][1];
   let timerRun;
   let intervalRunning = activities[activity][3];
   // Before starting timer, check if activity is finished
   if (activities[activity][2] == "complete") finishActivity();
   else if (activities[activity][3] == false) {
      // Display time, but do not continue interval
      activities[activity][1] = timer;
      elCount.textContent = formatTime(timer);
   } else {
      startInterval();
      activities[activity][3] = true;
   }
   function startInterval() {
      timerRun = setInterval(() => {
         activities[activity][1] = Math.round(10 * timer) / 10;
         let seconds = Math.round(10 * (timer += 0.1)) / 10;
         let minutes = Math.floor(seconds / 60);
         seconds = Math.round(10 * (seconds -= minutes * 60)) / 10;
         if (minutes > 0)
            elCount.textContent = minutes + " minute(s) and " + seconds + " seconds";
         else elCount.textContent = seconds + " second(s)";
      }, 100);
   }
   // save fixed
   // hana odeufhaiubyfe khabjfagvj

   function finishActivity() {
      // Finish time if not from save 
      if (activities[activity][4]["finish"] == undefined) activities[activity][4]["finish"] = new Date();
      // Pause timer
      clearInterval(timerRun);
      activities[activity][3] = false;
      // Move element
      let newActivity = element;
      element.remove();
      document.querySelector(".activitiesCompleted").textContent = "";
      // Checks if multiple elements of same task, then collapses
      if (document.querySelector(`._${noSpaces(activityName)}`) && settings.collapse !== "none") {
         if (settings.collapse == "long") {
            let newww = document.createElement("DIV");
            newww.innerHTML = `${formatTime(timer)} <br> 
            Started ${new Date(activities[activity][4]["start"]).toLocaleString()} <br> 
            Finished ${new Date(activities[activity][4]["finish"]).toLocaleString()} <br><br>`;
            document.querySelector(`._${noSpaces(activityName)}`).append(newww);
         } else if (settings.collapse == "short") {
            // If there isn't another summary
            if (document.querySelector(`._short_${noSpaces(activityName)}`) == null) {
               // Remove time for first activity
               document.querySelector(`._${noSpaces(activityName)}`).firstChild.nextSibling.remove();
               // Parent container
               let element = document.createElement("DIV");
               element.classList.add(`_short_${noSpaces(activityName)}`);
               // To get the labels and data
               avgActivityTime();
               // Average time
               let taskAvg = document.createElement("P");
               const average = (array) => array.reduce((a, b) => a + b) / array.length;
               // Find index of label, then find corresponding in data
               let thisIndex = labels.indexOf(activityName);
               taskAvg.innerHTML = `<div class="complete-summary"><span class="material-symbols-rounded completed-activity-summary-icon">avg_time</span><p>Average time: ${formatTime(
                  Math.round(10 * average(data[thisIndex])) / 10
               )}</p></div>`;
               // Total time
               let taskTotal = document.createElement("P");
               const totalTime = (array) => array.reduce((part, a) => part + a, 0);
               taskTotal.innerHTML = `<div class="complete-summary"><span class="material-symbols-rounded completed-activity-summary-icon">timer</span><p>Total time: ${formatTime(
                  totalTime(data[thisIndex])
               )}</p></div>`;
               // Amount of activites
               let activityAmounts = document.createElement("P");
               activityAmounts.innerHTML = `<div class="complete-summary"><span class="material-symbols-rounded completed-activity-summary-icon">numbers</span><p>Activites: ${data[thisIndex].length}</p></div>`;
               // Append items to block
               element.append(taskAvg);
               element.append(taskTotal);
               element.append(activityAmounts);
               document.querySelector(`._${noSpaces(activityName)}`).append(element);
            }
         }
      } else {
         document.querySelector(".completedActivities").append(newActivity);
         newActivity.classList.add(`_${noSpaces(activityName)}`);

         // Remove old controls
         elPause.remove();
         elFinish.remove();
         elRemove.remove();
         // Add new controls
         // Start again button
         let elRestart = document.createElement("SPAN");
         elRestart.classList.add("continueActivity");
         elRestart.classList.add(`ar${activities.indexOf(activity)}`);
         elRestart.innerHTML =
            "<span class='material-symbols-rounded'>replay</span>";
         elRestart.onclick = () => restartActivity(activityName);
         controls.appendChild(elRestart);

         // Set time if from save
         elCount.textContent = formatTime(timer);
         
         // Display start and end times
         elCount.innerHTML = `${elCount.textContent} <br> 
         Started ${new Date(activities[activity][4]["start"]).toLocaleString()} <br> 
         Finished ${new Date(activities[activity][4]["finish"]).toLocaleString()} <br><br>`;
      }
      // Add identifier
      // Set state as complete
      activities[activity][2] = "complete";
      // Check if no tasks running
      if (!document.querySelector(".activitiesProgressing").firstChild)
         document.querySelector(".activityProgressing").textContent =
            "No tasks in progress";
   }
}

// ==========================================
// Stats
// ==========================================

const ctx = document.getElementById("myChart");
let colors = [];

updateChartValues();

let chart = new Chart(ctx, {
   type: "doughnut",
   data: {
      labels: labels,
      datasets: [{
         label: "seconds",
         data: data
      }]
   }
});

setInterval(() => {
   updateChartValues();
   chart.data.labels = labels;
   chart.data.datasets[0].data = data;
   chart.update();
}, 2000);

function updateChartValues() {
   labels = [];
   data = [];
   activities.forEach((el, i) => {
      if (el[2] == "complete") {
         if (labels.findIndex((name) => name == el[0]) != -1) {
            data[labels.findIndex((name) => name == el[0])] += el[1];
         } else {
            labels.push(el[0]);
            data.push(el[1]);
         }
      }
   });
}

// Avg activity time
avgActivityTime();
setInterval(avgActivityTime, 2000);

function avgActivityTime() {
   document.querySelector(".avgtime").innerHTML = "";
   labels = [];
   data = [];
   activities.forEach((el, i) => {
      if (el[2] == "complete") {
         if (labels.findIndex((name) => name == el[0]) != -1) {
            data[labels.findIndex((name) => name == el[0])].push(el[1]);
         } else {
            labels.push(el[0]);
            data.push([el[1]]);
         }
      }
   });
   for (i in labels) {
      let element = document.createElement("DIV");
      element.classList.add("avgtimeblock");
      let taskName = document.createElement("P");
      taskName.textContent = labels[i];
      let taskAvg = document.createElement("P");
      const average = (array) => array.reduce((a, b) => a + b) / array.length;
      taskAvg.textContent =
         "Average time: " + formatTime(Math.round(10 * average(data[i])) / 10);
      let taskTotal = document.createElement("P");
      const totalTime = (array) => array.reduce((part, a) => part + a, 0);
      taskTotal.textContent = "Total time: " + formatTime(totalTime(data[i]));
      element.append(taskName);
      element.append(taskAvg);
      element.append(taskTotal);
      document.querySelector(".avgtime").append(element);
   }
}

// ==========================================
// Superfluous Functions
// ==========================================

function formatTime(timeInSeconds) {
   let seconds = Math.round(10 * (timeInSeconds += 0.1)) / 10;
   let minutes = Math.floor(seconds / 60);
   let hours = Math.floor(minutes / 60);
   seconds = Math.round(10 * (seconds -= minutes * 60)) / 10;
   minutes = Math.round(10 * (minutes -= hours * 60)) / 10;
   if (hours > 0)
      return `${hours} hour${hours != 1 ? "s" : ""} and ${minutes} minute${
         minutes != 1 ? "s" : ""
      }`;
   else if (minutes > 0)
      return `${minutes} minute${
         minutes != 1 ? "s" : ""
      } and ${seconds} second${seconds != 1 ? "s" : ""}`;
   else if (seconds == 1) return seconds + " second";
   else return `${seconds}  second${seconds != 1 ? "s" : ""}`;
}

let randomColor = "#" + Math.floor(Math.random() * 2 ** 24).toString(16).padStart(6, 0);

function noSpaces(txt) {
   // Note that if any of these replacment words are used in the actual activity name, it might cause problems, like considering them the same
   return encodeURI(txt.replace(/\s/g, "").replaceAll("!", "nonono").replaceAll("?", "nononono")).replaceAll("%", "WHYCSS");
}

// ==========================================
// Ideas and Plans
// ==========================================

// Recommend commonly used tasks based on time and location
// Group tasks by catogory (custom color, used for charts)
// Add settings to export
// Rename tasks
// About page

/*
== Things that are broken ==
// Err on clear cache
// Multiple tabs mess with save
// Deleting a task will murder the program
// I suppose the hacky way I remove spaces is a problem

== Settings ==
// Setting to continue tasks when tab is closed
// Option that adding new tasks completes previous (for one-direction workflow)
// Option for charts to show tasks in progress

== Visual ==
// Only show most recent in completed tasks
// Custom popups/alerts (bottom popups like Thoughts (bottom right, ect) and top like iPadOS (same size for large and small screens))
// Task color is black on first added tasks
// Dark theme

== Automate activites ==
Automated activites will have a set schedule time, which can be repeated, when it will alert you, and you can choose to start/delay/ignore the activity (call reminders?)
*/