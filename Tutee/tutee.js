function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Reset all sidebar links
  tablinks = document.getElementsByClassName("sidebar-link");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove('active'); // Remove active class
  }

  // Show the selected tab content
  document.getElementById(pageName).style.display = "block";

  // Set the active class for the clicked link
  elmnt.classList.add('active'); // Add active class
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

/********************** LOGOUT BUTTON *********************/

// Get the modal
var modal = document.getElementById("logout-modal");

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  // Get all modal containers
  var modals = document.querySelectorAll(".modal");
  
  modals.forEach(function(modal) {
      // Check if the click happened outside the modal content
      if (event.target == modal) {
          modal.style.display = "none";
      }
  });
};

// Function to handle logout
function logout() {
  // Redirect to the login page
  window.location.href = "/"; // Change this to your actual login page URL
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function loadAvailableTutors(){

  fetch('/tutee/available-tutors-registration')
  .then(res => res.json())
  .then(tutors =>{

    const tutorSelect = document.getElementById('.tutor');
    tutorSelect.innerHTML = `<option value="" disabled selected>Please Select</option>`;
    tutors.forEach(tutor=>{

      const option = document.createElement('option');
      option.value = tutor.userId;
      option.textContent = `${tutor.firstName} ${tutor.lastName}`;
      tutorSelect.appendChild(option);
    });
  });
};

function loadCourses(){

  fetch('/tutee/courses-of-tutorial-registration')
  .then(res=> res.json())
  .then(courses =>{

  })
}

document.addEventListener('DOMContentLoaded', loadAvailableTutors);

/********************** Time Registration *********************/

function activate() {

	document.head.insertAdjacentHTML("beforeend", `
		<style>
			.time-picker {
				position: absolute;
				display: inline-block;
				padding: 10px;
				background: #eeeeee;
				border-radius: 6px;
			}

			.time-picker__select {
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				outline: none;
				text-align: center;
				border: 1px solid #dddddd;
				border-radius: 6px;
				padding: 6px 10px;
				background: #ffffff;
				cursor: pointer;
				font-family: 'Heebo', sans-serif;
			}
		</style>
	`);

	document.querySelectorAll(".time-pickable").forEach(timePickable => {
		let activePicker = null;

		timePickable.addEventListener("focus", () => {
			if (activePicker) return;

			activePicker = show(timePickable);

			const onClickAway = ({ target }) => {
				if (
					target === activePicker
					|| target === timePickable
					|| activePicker.contains(target)
				) {
					return;
				}

				document.removeEventListener("mousedown", onClickAway);
				document.body.removeChild(activePicker);
				activePicker = null;
			};

			document.addEventListener("mousedown", onClickAway);
		});
	});
}

function show(timePickable) {
	const picker = buildPicker(timePickable);
	const { bottom: top, left } = timePickable.getBoundingClientRect();

	picker.style.top = `${top}px`;
	picker.style.left = `${left}px`;

	document.body.appendChild(picker);

	return picker;
}

// function buildPicker(timePickable) {
// 	const picker = document.createElement("div");
// 	const hourOptions = [9, 10, 11, 12, 1, 2, 3, 4, 5].map(numberToOption);
// 	const minuteOptions = [0, 30].map(numberToOption);

// 	picker.classList.add("time-picker");
// 	picker.innerHTML = `
// 		<select class="time-picker__select">
// 			${hourOptions.join("")}
// 		</select>
// 		:
// 		<select class="time-picker__select">
// 			${minuteOptions.join("")}
// 		</select>
// 		<select class="time-picker__select">
// 			<option value="am">am</option>
// 			<option value="pm">pm</option>
// 		</select>
// 	`;

// 	const selects = getSelectsFromPicker(picker);

// 	selects.hour.addEventListener("change", () => timePickable.value = getTimeStringFromPicker(picker));
// 	selects.minute.addEventListener("change", () => timePickable.value = getTimeStringFromPicker(picker));
// 	selects.meridiem.addEventListener("change", () => timePickable.value = getTimeStringFromPicker(picker));

// 	if (timePickable.value) {
// 		const { hour, minute, meridiem } = getTimePartsFromPickable(timePickable);

// 		selects.hour.value = hour;
// 		selects.minute.value = minute;
// 		selects.meridiem.value = meridiem;
// 	}

// 	return picker;
// }

function buildPicker(timePickable) {
  const picker = document.createElement("div");
  const hourOptions = [9, 10, 11, 12, 1, 2, 3, 4, 5].map(numberToOption);
  const minuteOptions = [0, 30].map(numberToOption);

  picker.classList.add("time-picker");
  picker.innerHTML = `
      <select class="time-picker__select">
          ${hourOptions.join("")}
      </select>
      :
      <select class="time-picker__select">
          ${minuteOptions.join("")}
      </select>
      <select class="time-picker__select" disabled>
          <option value="am">am</option>
          <option value="pm">pm</option>
      </select>
  `;

  const selects = getSelectsFromPicker(picker);

  function validateAndSetTime() {
      let selectedHour = parseInt(selects.hour.value, 10);
      const selectedMinute = parseInt(selects.minute.value, 10);

      if (selectedHour >= 9 && selectedHour <= 11) {
          selects.meridiem.value = "am";
      } else if (selectedHour >= 1 && selectedHour <= 5) {
          selects.meridiem.value = "pm";
      } else if (selectedHour === 12) {
          selects.meridiem.value = "pm";
      }

      timePickable.value = getTimeStringFromPicker(picker);
  }

  selects.hour.addEventListener("change", validateAndSetTime);
  selects.minute.addEventListener("change", validateAndSetTime);

  if (timePickable.value) {
      const { hour, minute, meridiem } = getTimePartsFromPickable(timePickable);

      selects.hour.value = hour;
      selects.minute.value = minute;
      selects.meridiem.value = meridiem;
  }

  return picker;
}

function getTimePartsFromPickable(timePickable) {
	const pattern = /^(\d+):(\d+) (am|pm)$/;
	const [hour, minute, meridiem] = Array.from(timePickable.value.match(pattern)).splice(1);

	return {
		hour,
		minute,
		meridiem
	};
}

function getSelectsFromPicker(timePicker) {
	const [hour, minute, meridiem] = timePicker.querySelectorAll(".time-picker__select");

	return {
		hour,
		minute,
		meridiem
	};
}

function getTimeStringFromPicker(timePicker) {
	const selects = getSelectsFromPicker(timePicker);

	return `${selects.hour.value}:${selects.minute.value} ${selects.meridiem.value}`;
}

function numberToOption(number) {
	const padded = number.toString().padStart(2, "0");

	return `<option value="${padded}">${padded}</option>`;
}

activate();

// function activate() {
//   document.head.insertAdjacentHTML("beforeend", `
//       <style>
//           .time-picker {
//               position: absolute;
//               display: inline-block;
//               padding: 10px;
//               background: #eeeeee;
//               border-radius: 6px;
//           }
//           .time-picker__select {
//               -webkit-appearance: none;
//               -moz-appearance: none;
//               appearance: none;
//               outline: none;
//               text-align: center;
//               border: 1px solid #dddddd;
//               border-radius: 6px;
//               padding: 6px 10px;
//               background: #ffffff;
//               cursor: pointer;
//               font-family: 'Heebo', sans-serif;
//           }
//       </style>
//   `);

//   const startTimePickable = document.getElementById("timeStart");
//   const endTimePickable = document.getElementById("timeEnd");

//   // Activate pickers
//   setupPicker(startTimePickable, { minHour: 9, maxHour: 17 }, () => {
//       updateEndTimeOptions(startTimePickable, endTimePickable);
//   });

//   setupPicker(endTimePickable, { minHour: 9, maxHour: 18 });

//   startTimePickable.addEventListener("input", () => {
//       updateEndTimeOptions(startTimePickable, endTimePickable);
//   });
// }

// function setupPicker(inputElement, range, onChangeCallback) {
//   let activePicker = null;

//   inputElement.addEventListener("focus", () => {
//       if (activePicker) return;

//       activePicker = showPicker(inputElement, range, onChangeCallback);

//       const onClickAway = ({ target }) => {
//           if (
//               target === activePicker ||
//               target === inputElement ||
//               activePicker.contains(target)
//           ) {
//               return;
//           }

//           document.removeEventListener("mousedown", onClickAway);
//           document.body.removeChild(activePicker);
//           activePicker = null;
//       };

//       document.addEventListener("mousedown", onClickAway);
//   });
// }

// function showPicker(inputElement, range, onChangeCallback) {
//   const picker = buildPicker(inputElement, range, onChangeCallback);
//   const { bottom: top, left } = inputElement.getBoundingClientRect();

//   picker.style.top = `${top}px`;
//   picker.style.left = `${left}px`;

//   document.body.appendChild(picker);

//   return picker;
// }

// function buildPicker(inputElement, range, onChangeCallback) {
//   const picker = document.createElement("div");
//   const hourOptions = generateHourOptions(range.minHour, range.maxHour);
//   const minuteOptions = [0, 30].map(numberToOption);

//   picker.classList.add("time-picker");
//   picker.innerHTML = `
//       <select class="time-picker__select hour-select">
//           ${hourOptions.join("")}
//       </select>
//       :
//       <select class="time-picker__select minute-select">
//           ${minuteOptions.join("")}
//       </select>
//       <select class="time-picker__select meridiem-select" disabled>
//           <option value="am">am</option>
//           <option value="pm">pm</option>
//       </select>
//   `;

//   const selects = getSelectsFromPicker(picker);

//   selects.hour.addEventListener("change", () => {
//       validateAndSetTime(inputElement, picker);
//       if (onChangeCallback) onChangeCallback();
//   });

//   selects.minute.addEventListener("change", () => {
//       validateAndSetTime(inputElement, picker);
//       if (onChangeCallback) onChangeCallback();
//   });

//   if (inputElement.value) {
//       const { hour, minute, meridiem } = getTimePartsFromPickable(inputElement);
//       selects.hour.value = hour;
//       selects.minute.value = minute;
//       selects.meridiem.value = meridiem;
//   }

//   return picker;
// }

// function updateEndTimeOptions(startTimeInput, endTimeInput) {
//   const { hour: startHour, minute: startMinute, meridiem: startMeridiem } = getTimePartsFromPickable(startTimeInput);
//   const startTime = convertTo24HourFormat(parseInt(startHour, 10), startMeridiem);
//   const endTimeRange = {
//       minHour: startTime + 1, // 1 hour after the start time
//       maxHour: 18 // 6 PM
//   };

//   // Update the end time picker options
//   const endPicker = document.querySelector(".time-picker");
//   if (endPicker) {
//       document.body.removeChild(endPicker);
//   }

//   setupPicker(endTimeInput, endTimeRange);
// }

// function generateHourOptions(minHour, maxHour) {
//   return Array.from({ length: maxHour - minHour + 1 }, (_, i) => {
//       const hour = (minHour + i) % 12 || 12; // Convert to 12-hour format
//       return numberToOption(hour);
//   });
// }

// function validateAndSetTime(inputElement, picker) {
//   const selects = getSelectsFromPicker(picker);

//   let selectedHour = parseInt(selects.hour.value, 10);
//   let selectedMinute = parseInt(selects.minute.value, 10);

//   if (selectedHour >= 9 && selectedHour <= 11) {
//       selects.meridiem.value = "am";
//   } else {
//       selects.meridiem.value = "pm";
//   }

//   inputElement.value = `${selectedHour}:${selectedMinute.toString().padStart(2, "0")} ${selects.meridiem.value}`;
// }

// function getTimePartsFromPickable(inputElement) {
//   const pattern = /^(\d+):(\d+) (am|pm)$/;
//   const match = inputElement.value.match(pattern);
//   if (!match) return { hour: "9", minute: "0", meridiem: "am" };

//   const [, hour, minute, meridiem] = match;
//   return { hour, minute, meridiem };
// }

// function getSelectsFromPicker(timePicker) {
//   const [hour, minute, meridiem] = timePicker.querySelectorAll(".time-picker__select");

//   return { hour, minute, meridiem };
// }

// function convertTo24HourFormat(hour, meridiem) {
//   if (meridiem === "pm" && hour < 12) return hour + 12;
//   if (meridiem === "am" && hour === 12) return 0;
//   return hour;
// }

// function numberToOption(number) {
//   const padded = number.toString().padStart(2, "0");
//   return `<option value="${padded}">${padded}</option>`;
// }

// activate();

