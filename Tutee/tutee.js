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

function reloadPage(){
   window.location.reload();
}

function tuteeName(){

  fetch('/api/tutee/user-name')
  .then(res=>res.json())
  .then(({lastName})=>{

    const tuteeNamePanel = document.getElementById('tuteeNamePanel');
  
        // Clear all current content inside #tuteeName
        tuteeNamePanel.innerHTML = `
        <i class="fa-solid fa-bell"></i>
        <i class="fa-solid fa-user"></i>`;
  
        // Add the tutee's name after the icons
        const nameSpan = document.createElement('span');
        nameSpan.textContent = lastName;
        nameSpan.style.marginLeft = '10px'; // Add spacing between the icons and the name
  
        tuteeNamePanel.appendChild(nameSpan);
      });

  };

function loadRegistration(){

  //Tutor and Course Relationship
  fetch('/api/tutee/tutorial-registration')
  .then(res => res.json())
  .then(({courses, tutors, tuteeId, tuteeName, program})=>{

   const selectElementCourses = document.getElementById('course');
   const selectElementTutors = document.getElementById('tutor');

   courses.forEach(course=>{
    const option = document.createElement('option');
    option.value = course.course;
    option.textContent = course.course;

    selectElementCourses.appendChild(option);
   });

        selectElementCourses.addEventListener('change', () => {
        const selectedCourseName = selectElementCourses.value;

        // Clear the tutor dropdown
        selectElementTutors.innerHTML = '<option value="" disabled selected>Please Select a Tutor</option>';

        // Filter tutors who can handle the selected course
        const filteredTutors = tutors.filter(tutor => tutor.coursesHandled.includes(selectedCourseName));

        // Populate tutors dropdown with filtered tutors
        filteredTutors.forEach(tutor => {
          const option = document.createElement('option');
          option.value = tutor.tutorId;
          option.textContent = `${tutor.firstName} ${tutor.lastName}`;
          selectElementTutors.appendChild(option);
        });
      });

          const registerButton = document.getElementById('registration-tutorial-register-button');
          registerButton.addEventListener('click', async()=>{

            reloadPage();
            const tutorDropdown = document.getElementById('tutor');
            const tutorId = tutorDropdown.value;
            const selectedTutor = tutorDropdown.options[tutorDropdown.selectedIndex].textContent;
            const selectedCourse = document.getElementById('course').value;
            const topicsForTutorial = document.getElementById('topic').value;
            const tuteeAmount = document.getElementById('NoOfTutees').value;
            const preferredDate = document.getElementById('date').value;
            const startingTime = document.getElementById('timeStart').value;
            const endingTime = document.getElementById('timeEnd').value;
            const time = `${startingTime} - ${endingTime}`;
        
            const registrationDetails= {

              tuteeId: tuteeId,
              tutorId: tutorId,
              tutee: tuteeName,
              tutor: selectedTutor,
              program: program,
              course: selectedCourse,
              topics: topicsForTutorial,
              noOfTutees: tuteeAmount,
              date: preferredDate,
              time: time,
              status: 'Pending'
            };

        // try{

          const response = await fetch('/api/tutee/tutorial-registration', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({registrationDetails})
          });

            if (!response.ok) {
              const { error } = await response.json(); // Get error message from backend
              alert(error); // Display error as an alert
            }else {
              const newTutorial = await response.json();
              console.log('Tutorial successfully registered:', newTutorial);
              alert('Tutorial successfully registered!'); // Success alert
          }
            
          });
      });

};

function loadPendingTutorials(){

  fetch('/api/tutee/tutorial-registration-pending-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const panel = document.getElementById('pendingTutorials');
    data.forEach(tutorial=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('pending-tutorial');

      userDiv.innerHTML = `
                <div class="pending-tutorial-left">
                  ${tutorial.tutor}
                </div>
                <div class="pending-tutorial-right">
                  <button class="view-details" onclick="openPendingModal(${tutorial.id})"> 
                    View Details
                  </button>
                  <i class="fa-solid fa-square-xmark" onclick="openDeleteModal(${tutorial.id})"></i>
                </div>`
      panel.appendChild(userDiv);
    });
  });
};

function openPendingModal(id){

  fetch('/api/tutee/tutorial-registration-pending-tutorials')
  .then(res=>res.json())
  .then(data => {

    console.log(data);
    const tutorial = data.find(t=>t.id === id);
    const modal = document.getElementById('tutee-registration-view-details-modal');
    const rows = modal.querySelectorAll('.tutorial-details tr');

      rows[0].children[1].textContent = tutorial.status;
      rows[1].children[1].textContent = tutorial.tutor;
      rows[2].children[1].textContent = tutorial.course;
      rows[3].children[1].textContent = tutorial.topics;
      rows[4].children[1].textContent = tutorial.noOfTutees;
      rows[5].children[1].textContent = tutorial.date;
      rows[6].children[1].textContent = tutorial.time;

      modal.style.display = 'block';

  });

};

function openDeleteModal(id){

  const modal = document.getElementById('tutee-registration-delete-modal');
  modal.addEventListener('click', deletePendingRegistration(id));

  modal.style.display = 'block';
};

function deletePendingRegistration(id){

  const deleteButton = document.getElementById('deleteButton');
  deleteButton.addEventListener('click', ()=>{

    window.location.reload();
    fetch('/api/tutee/tutorial-registration-pending-tutorials',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id})
      })
      .then(res=>res.json())
      .then()
  })
};

function loadScheduledTutorials(){

  fetch('/api/tutee/tutorial-registration-scheduled-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const panel = document.getElementById('scheduledTutorials');
    data.forEach(tutorial=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('scheduled-tutorial');

      userDiv.innerHTML = `
                <div class="scheduled-tutorial-left">
                  ${tutorial.tutor}
                </div>
                <div class="scheduled-tutorial-right">
                  <button class="view-details" onclick="openScheduledModal(${tutorial.id})"> 
                    View Details
                  </button>
                  <i class="fa-solid fa-square-xmark" onclick="openCancelModal(${tutorial.id})"></i>
                </div> `;

      panel.appendChild(userDiv);

    })

  })
};

function openScheduledModal(id){

  fetch('/api/tutee/tutorial-registration-scheduled-tutorials')
  .then(res=>res.json())
  .then(data => {

    console.log(data);
    const tutorial = data.find(t=>t.id === id);
    const modal = document.getElementById('tutee-registration-view-details-modal');
    const rows = modal.querySelectorAll('.tutorial-details tr');

      rows[0].children[1].textContent = tutorial.status;
      rows[1].children[1].textContent = tutorial.tutor;
      rows[2].children[1].textContent = tutorial.course;
      rows[3].children[1].textContent = tutorial.topics;
      rows[4].children[1].textContent = tutorial.noOfTutees;
      rows[5].children[1].textContent = tutorial.date;
      rows[6].children[1].textContent = tutorial.time;

      modal.style.display = 'block';

})
};

function openCancelModal(id){

  const modal = document.getElementById('tutee-registration-cancel-modal');
  modal.addEventListener('click', cancelScheduledRegistration(id));

  modal.style.display = 'block';

};

function cancelScheduledRegistration(id){

  fetch('/api/tutee/tutorial-registration-scheduled-tutorials', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);

      const tutorial = data.find(t=>t.id === id);

      const cancelledTutorial = {
  
        tutorId: tutorial.tutorId,
        tutee: tutorial.tutee,
        program: tutorial.program,
        course: tutorial.course,
        topics: tutorial.topics,
        noOfTutees: 'None',
        date: tutorial.date,
        roomNo: 'None',
        totalTime: 'None',
        status: 'Cancelled By Tutee'
      };


  const cancelButton = document.getElementById('cancelButton');
  cancelButton.addEventListener('click', ()=>{

    window.location.reload();

    fetch('/api/tutee/tutorial-registration-cancel-scheduled-tutorials',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, cancelledTutorial})
      }
     )
  })
    });
};

function loadTutorialList(){

  fetch('/api/tutee/tutorial-list-of-tutors')
  .then(res=>res.json())
  .then(({courses, tutors})=>{

    const selectElementCourses = document.getElementById('courseDropdown');
    const searchBar = document.getElementById('searchBar');
    const searchBtn = document.getElementById('searchButton');
    const container = document.getElementById('tutorInfos'); // Div where tutors' info will be shown

    let filteredTutors = tutors;

      // Function to filter tutors based on the selected course and search query
      function filterTutors() {
        const searchQuery = searchBar.value.trim().toLowerCase();
        const selectedCourse = selectElementCourses.value;

        // Filter by course and search query
        filteredTutors = tutors.filter(tutor => {
          const tutorCourses = tutor.coursesHandled.split(', ').map(course => course.trim());
          const matchesCourse = selectedCourse ? tutorCourses.includes(selectedCourse) : true;
          const matchesSearch = tutor.firstName.toLowerCase().includes(searchQuery) || tutor.lastName.toLowerCase().includes(searchQuery);
          return matchesCourse && matchesSearch;
        });

        // Render the filtered tutors
        renderTutors(filteredTutors);
      }

        // Function to render tutors in the container
        function renderTutors(tutorsList) {
          container.innerHTML = ''; // Clear the current list
          tutorsList.forEach(tutor => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('perso-info');
  
            userDiv.innerHTML = `
              <img class="perso-info-profile" src="/${tutor.profPic}" />
              <p class="perso-info-name">${tutor.firstName} ${tutor.lastName}</p>
              <p class="perso-info-detail">${tutor.yearLvl} || ${tutor.program}</p>
              <button id="view-availability" onclick="openAvailabilityModal(${tutor.tutorId})">View Availability</button>
            `;
  
            container.appendChild(userDiv);
          });
        }
  
        // Event listener for course dropdown change
        selectElementCourses.addEventListener('change', filterTutors);
  
        // Event listener for search button click
        searchBtn.addEventListener('click', filterTutors);
  
        // Initial rendering of tutors
        renderTutors(filteredTutors);
        
        // Add courses to the dropdown
        courses.forEach(course => {
          const option = document.createElement('option');
          option.value = course.course;
          option.textContent = course.course;
          selectElementCourses.appendChild(option);
        });
      })

  };

function openAvailabilityModal(tutorId){

  fetch('/api/tutee/tutorial-list-of-tutors')
  .then(response => response.json())
  .then(({availability}) => {

    console.log(availability);

    const modal = document.getElementById('tutee-tutor-schedule-modal');
    const availabilityPerTutor = availability.filter(t=>t.tutorId === tutorId);
    const availabilityTable = document.getElementById('availabilityTable');

    let tableBody = document.querySelector("#availabilityTable tbody");

        if (!tableBody) {
            tableBody = document.createElement("tbody");
            availabilityTable.appendChild(tableBody);
        }
        tableBody.innerHTML = '';

        const timeSlots = [
            "9:00 AM - 9:30 AM", "9:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
            "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
            "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM", "1:00 PM - 1:30 PM",
            "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM", "2:30 PM - 3:00 PM",
            "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM", "4:00 PM - 4:30 PM",
            "4:30 PM - 5:00 PM", "5:00 PM - 5:30 PM", "5:30 PM - 6:00 PM"
        ];
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        timeSlots.forEach(slot => {
            const row = document.createElement("tr");
            row.dataset.time = slot;

            const timeCell = document.createElement("th");
            timeCell.textContent = slot;
            row.appendChild(timeCell);

            days.forEach(day => {
                const cell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.classList.add("checkbox");
                checkbox.dataset.day = day;
                checkbox.dataset.time = slot;
                checkbox.disabled = true;
                cell.appendChild(checkbox);
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

    availabilityPerTutor.forEach(({day, timeSlot})=>{

      console.log(`Day: ${day}, Timeslot: ${timeSlot}`);
      const checkbox = document.querySelector(`input[data-day="${day.trim()}"][data-time="${timeSlot.trim()}"]`
      );
      if (checkbox) {
          checkbox.checked = true;
      } else {
          console.warn(`Checkbox not found for day: ${day}, timeslot: ${timeSlot}`);
      }

    })
    modal.style.display = 'block';
  })
  .catch(error => {
      console.error('Error:', error);
  });

};

document.addEventListener('DOMContentLoaded', tuteeName);
document.addEventListener('DOMContentLoaded', loadTutorialList);
document.addEventListener('DOMContentLoaded', loadRegistration);
document.addEventListener('DOMContentLoaded', loadPendingTutorials);
document.addEventListener('DOMContentLoaded', loadScheduledTutorials);



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

function buildPicker(timePickable) {
  const picker = document.createElement("div");

  const hourOptions = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(numberToOption);
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

    // // Limit minute options when the hour is 6
    // if (selectedHour === 6) {
    //   selects.minute.innerHTML = numberToOption(0); // Only allow 0
    //   selects.minute.value = "0"; // Set value to 0
    //   selects.meridiem.value = "pm"; // Ensure PM is selected

    //   // Trigger change event manually to register the value
    //   const event = new Event("change");
    //   selects.minute.dispatchEvent(event);
    // } else {
    //   // Restore full minute options for other hours
    //   selects.minute.innerHTML = [0, 30].map(numberToOption).join("");
    // }

      if (selectedHour >= 9 && selectedHour <= 11) {
          selects.meridiem.value = "am";
      } else if (selectedHour >= 1 && selectedHour <= 6) {
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

