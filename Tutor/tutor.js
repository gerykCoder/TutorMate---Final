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


/********************** HOME *********************/

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
  }
  
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

/********************** TUTORIAL AVAILABILITY *********************/
// document.addEventListener('DOMContentLoaded', initializeAvailability);

function reloadPage(){

  window.location.reload();
}



//Loads Pending Tutorials
function loadPendingTutorials(){

  fetch('/api/tutor/tutorial-registration-pending-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const panel = document.getElementById('pendingTutorials');
    data.forEach(tutorial=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('pending-tutorial');

      userDiv.innerHTML = `
              <div class="pending-tutorial-left">
                <i class="fa-solid fa-user"></i>
                ${tutorial.tutee}
              </div>
              <div class="pending-tutorial-right">
                <button class="view-details" onclick="openPendingModal(${tutorial.id})"> 
                  View Details
                </button>
                <i class="fa-solid fa-square-check" onclick="openAcceptModal(${tutorial.id})"></i>
                <i class="fa-solid fa-square-xmark" onclick="openDenyModal(${tutorial.id})"></i>
              </div>`
      panel.appendChild(userDiv);
    });
  })
};

//View Details Pending Tutorials
function openPendingModal(id){

  fetch('/api/tutor/tutorial-registration-pending-tutorials')
  .then(res=>res.json())
  .then(data => {

    console.log(data);
    const tutorial = data.find(t=>t.id === id);
    const modal = document.getElementById('tutor-home-view-details-modal');
    const rows = modal.querySelectorAll('.tutorial-details tr');

      rows[0].children[1].textContent = tutorial.status;
      rows[1].children[1].textContent = tutorial.tutee;
      rows[2].children[1].textContent = tutorial.program;
      rows[3].children[1].textContent = tutorial.course;
      rows[4].children[1].textContent = tutorial.topics;
      rows[5].children[1].textContent = tutorial.noOfTutees;
      rows[6].children[1].textContent = tutorial.date;
      rows[7].children[1].textContent = tutorial.time;

      modal.style.display = 'block';

  });

};

//Accepting Pending Tutorials Modal
function openAcceptModal(id){
  
  const modal = document.getElementById('tutor-home-accept-modal');
  modal.addEventListener('click', acceptPendingRegistration(id));
  modal.style.display = 'block';

};

//Accepting Pending Tutorials Button
function acceptPendingRegistration(id){

  const acceptButton = document.getElementById('acceptButton');
  acceptButton.addEventListener('click', ()=>{

    window.location.reload();
    fetch('/api/tutor/tutorial-registration-accept-pending-tutorials', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({id})
    })
  })
};

//Denying Pending Tutorials modal
function openDenyModal(id){

  const modal = document.getElementById('tutor-home-deny-modal');
  modal.addEventListener('click', denyPendingRegistration(id));
  modal.style.display = 'block';

};

//Denying Pending Tutorials Button
function denyPendingRegistration(id){

  fetch('/api/tutor/tutorial-registration-pending-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const tutorial = data.find(t=>t.id === id);

    const pendingTutorial = {

      // tutor: tutorial.tutor,
      tutee: tutorial.tutee,
      program: tutorial.program,
      course: tutorial.course,
      topic: tutorial.topics,
      noOfTutees: 'None',
      date: tutorial.date,
      roomNo: 'None',
      totalTime: 'None',
      status:  'Denied'
    };

    const denyButton = document.getElementById('denyButton');
    denyButton.addEventListener('click', ()=>{
  
      window.location.reload();
      fetch('/api/tutor/tutorial-registration-deny-pending-tutorials', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({id, pendingTutorial})
      })
    })
  })

};

//Loads Scheduled Tutorials
function loadScheduledTutorials(){

  fetch('/api/tutor/tutorial-registration-scheduled-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const panel = document.getElementById('scheduledTutorials');
    data.forEach(tutorial=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('schedule-tutorials');

      userDiv.innerHTML = `
              <div class="schedule-tutorials-left">
                <i class="fa-solid fa-user"></i>
                ${tutorial.tutee}
              </div>
              <div class="schedule-tutorials-right">
                <button class="view-details" onclick="openScheduledModal(${tutorial.id})"> 
                  View Details
                </button>
                <i class="fa-solid fa-square-check" onclick="openCompleteModal(${tutorial.id})"></i>
                <i class="fa-solid fa-square-xmark" onclick="openCancelModal(${tutorial.id})"></i>
              </div>`
      panel.appendChild(userDiv);
    });
  })
};

//View Details Scheduled Tutorials
function openScheduledModal(id){

  fetch('/api/tutor/tutorial-registration-scheduled-tutorials')
  .then(res=>res.json())
  .then(data => {

    console.log(data);
    const tutorial = data.find(t=>t.id === id);
    const modal = document.getElementById('tutor-home-view-details-modal');
    const rows = modal.querySelectorAll('.tutorial-details tr');

      rows[0].children[1].textContent = tutorial.status;
      rows[1].children[1].textContent = tutorial.tutee;
      rows[2].children[1].textContent = tutorial.program;
      rows[3].children[1].textContent = tutorial.course;
      rows[4].children[1].textContent = tutorial.topics;
      rows[5].children[1].textContent = tutorial.noOfTutees;
      rows[6].children[1].textContent = tutorial.date;
      rows[7].children[1].textContent = tutorial.time;

      modal.style.display = 'block';

  });

};

//
function openCompleteModal(id){
  
  const modal = document.getElementById('tutor-home-complete-modal');
  modal.addEventListener('click', completeScheduledRegistration(id));
  modal.style.display = 'block';

};

function completeScheduledRegistration(id){

  fetch('/api/tutor/tutorial-registration-scheduled-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const completeButton = document.getElementById('completeButton');
    completeButton.addEventListener('click', ()=>{

      window.location.reload();
      const tutorial = data.find(t=>t.id === id);
      const course = document.querySelector('input[name="course"]').value;
      const topic = document.querySelector('input[name="topic"]').value;
      const noOfTutees = document.querySelector('input[name="attendees"]').value;
      const roomNo = document.querySelector('input[name="room-number"]').value;
      const totalTime = document.querySelector('input[name="total-time"]').value;

      const completedTutorial = {

        tutorId: tutorial.tutorId,
        tutee: tutorial.tutee,
        program: tutorial.program,
        course: course,
        topic: topic,
        noOfTutees: noOfTutees,
        date: tutorial.date,
        roomNo: roomNo,
        totalTime: totalTime,
        status: 'Completed'
  
      };
  
        fetch('/api/tutor/tutorial-registration-complete-scheduled-tutorials', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({id, completedTutorial})
        })
        .then(res=>res.json())
        .then(
          alert('Tutorial Completed!')
        );
  
    })

  })
    

};

function openCancelModal(id){

  const modal = document.getElementById('tutor-home-cancel-modal');
  modal.addEventListener('click', cancelScheduledRegistration(id));
  modal.style.display = 'block';

};

function cancelScheduledRegistration(id){

  fetch('/api/tutor/tutorial-registration-scheduled-tutorials')
  .then(res=>res.json())
  .then(data=>{

    const tutorial = data.find(t=>t.id === id);

    const cancelledTutorial = {

      tutorId: tutorial.tutorId,
      tutee: tutorial.tutee,
      program: tutorial.program,
      course: tutorial.course,
      topic: tutorial.topic,
      noOfTutees: 'None',
      date: tutorial.date,
      roomNo: 'None',
      totalTime: 'None',
      status: 'Cancelled'
    };

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', ()=>{

      reloadPage();

      fetch('/api/tutor/tutorial-registration-cancel-scheduled-tutorials', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({id, cancelledTutorial})
      });
    })
  })
}

function loadAllTutorials(){

  fetch('/api/tutor/tutorial-history')
  .then(res=>res.json())
  .then(data=>{
    
    const panel = document.getElementById('tutorialHistorySlots');
    data.forEach(tutorial=>{

      const userDiv = document.createElement('tr');
      userDiv.innerHTML = `

                <td>${tutorial.id}</td>
                <td>${tutorial.tutee}</td>
                <td>${tutorial.program}</td>
                <td>${tutorial.course}</td>
                <td>${tutorial.topic}</td>
                <td>${tutorial.noOfTutees}</td>
                <td>${tutorial.date}</td>
                <td>${tutorial.roomNo}</td>
                <td>${tutorial.totalTime}</td>
                <td>${tutorial.status}</td> `

      panel.appendChild(userDiv);
    });
  })
};

//Availability Functions
const checkboxes = document.querySelectorAll(".checkbox");

function loadAvailability() {
  fetch('/api/tutor/availability')
      .then(res => {
          if (!res.ok) {
              throw new Error('Failed to fetch availability');
          }
          return res.json();
      })
      .then(({ availability }) => {
          console.log('Frontend availability:', availability); // Log data
          availability.forEach(({ day, timeslot }) => {
              const checkbox = document.querySelector(`input[data-day="${day}"][data-time="${timeslot}"]`);
              if (checkbox) {
                  checkbox.checked = true;
              } else {
                  console.warn(`Checkbox not found for day: ${day}, timeslot: ${timeslot}`);
              }
          });
      })
      .catch(err => console.error('Error loading availability:', err));

      // Attach event listeners after checkboxes are loaded
      const editButton = document.getElementById('edit-button');
      editButton.addEventListener('click', toggleEditMode);
  
      const saveButton = document.getElementById('save-button');
      saveButton.addEventListener('click', saveChanges);
  
      const cancelButton = document.getElementById('cancel-button');
      cancelButton.addEventListener('click', cancelChanges);
};

// Function to toggle between edit and view mode
function toggleEditMode() {

    document.getElementById("edit-button").style.display = 'none';
    document.getElementById("save-button").style.display = 'block';
    document.getElementById("cancel-button").style.display = 'block';

    checkboxes.forEach(checkbox=>{
            checkbox.disabled = false;
    });
};

function saveChanges(){

    const availability = [];

    checkboxes.forEach(checkbox=>{

      const day = checkbox.dataset.day;
      const time = checkbox.closest('tr').dataset.time;

      //If checkboxes are checked
      if(checkbox.checked){

        availability.push({day, time});
      }
    })

    fetch('/api/tutor/availability', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({availability})

    })
    .then(res=>res.json())
    .then(data=>{

      reloadPage();

    })


};

function cancelChanges() {

  document.getElementById("edit-button").style.display = 'block';
  document.getElementById("save-button").style.display = 'none';
  document.getElementById("cancel-button").style.display = 'none';

  checkboxes.forEach(checkbox=>{
    checkbox.disabled = true;
  })

};

function openCoursesModal(){

  fetch('/api/tutor/availability-teachable-courses')
  .then(res=>res.json())
  .then(courses =>{

    fetch('/api/tutor/selected-courses')
    .then(res => res.json())
    .then(selectedCourses => {

    const modal = document.getElementById('tutor-time-availability-teachable-course-modal');
    const container = document.getElementById('teachable-courses');

    container.innerHTML = '';

    courses.forEach(course=>{

      const courseEntry = document.createElement('input');
      courseEntry.type = "checkbox";
      courseEntry.name = `${course.course}`;
      courseEntry.value = `${course.course}`;
      courseEntry.id = `course-${course.courseId}`;

        // Pre-check if course is already selected
        if (selectedCourses.includes(course.course)) {
          courseEntry.checked = true;
        }

      // Create the label
      const label = document.createElement('label');
      label.setAttribute('for', `course-${course.courseId}`); // Associate with the checkbox
      label.textContent = course.course;

      // Append the input and label to the container
      container.appendChild(courseEntry);
      container.appendChild(label);
      container.appendChild(document.createElement('br')); // Add a line break

    });

    modal.style.display = 'block';

    const saveButton = document.getElementById('saveButtonCourses');
    saveButton.addEventListener('click', ()=>{
      
      window.location.reload();
      const checkboxes = document.querySelectorAll('#teachable-courses input[type="checkbox"]');
      const selectedCourses = [];

      checkboxes.forEach(checkbox=>{
        if(checkbox.checked){
          selectedCourses.push(checkbox.value);
        }
      });

      fetch('/api/tutor/availability-teachable-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({coursesHandled: selectedCourses})})
        .then(res=>res.json())
        .then(response=>{

            if (response.success) {
                alert('Teachable courses updated successfully!');
                modal.style.display = 'none';
            } else {
                alert('Error updating teachable courses.');
            }

        })
    });

    const cancelButton = document.getElementById('cancelButtonCourses');
    cancelButton.addEventListener('click', ()=>{

      modal.style.display= 'none';
    } );
    });  
  });

};


document.addEventListener('DOMContentLoaded', loadPendingTutorials);
document.addEventListener('DOMContentLoaded', loadScheduledTutorials);
document.addEventListener('DOMContentLoaded', loadAllTutorials);