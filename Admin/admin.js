/********************** NAVIGATION BAR *********************/

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

/********************** Modals *********************/

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

/********************** LOGOUT BUTTON *********************/

/*// Get the modal
var modals = [
  document.getElementById("logout-modal"),
  document.getElementById("admin-home-view-details-modal")
];

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}*/

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

/********************** TUTORIAL CANCELLATION *********************/

var modal = document.getElementById("admin-tutorial-session-cancellation-modal");
var btn = document.getElementById("admin-tutorial-session-cancellation");
var cancelBtn = document.getElementById("cancelBtn");

// Open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// Close the modal on 'Cancel' button click
cancelBtn.onclick = function() {
  modal.style.display = "none";
}

//Function to reload page
function reloadPage(){
  window.location.reload();
};

// Function to show tutorial counts
function loadHomeCounts(){

  fetch('/admin/home-counts')
  .then(res => res.json())
  .then(({pendingOrScheduled, completedOrCancelled, tutorialPerTutor, accsForApproval})=>{

    const pendingPanel = document.getElementById('pendingCountPanel');
    const scheduledPanel = document.getElementById('scheduledCountPanel');
    const completedPanel = document.getElementById('completedCountPanel');
    const cancelledPanel = document.getElementById('cancelledCountPanel');
    const accsForApprovalPanel = document.getElementById('forApprovalCountPanel');

      pendingPanel.textContent = pendingOrScheduled.pending_count;
      scheduledPanel.textContent = pendingOrScheduled.scheduled_count;
      completedPanel.textContent = completedOrCancelled.completed_count;
      cancelledPanel.textContent = completedOrCancelled.cancelled_count;
      accsForApprovalPanel.textContent = accsForApproval.account_count;

      const panel = document.getElementById('tutor-count-panel');
      tutorialPerTutor.forEach(tutor => {

       const userDiv = document.createElement('div');
       userDiv.classList.add('tutor-count');

       userDiv.innerHTML = `
                <div class="tutor-count-left">
                  ${tutor.tutor} 
                </div>
                <div class="tutor-count-right">
                  <div class="count-number">
                    <div>${tutor.tutorial_count}</div>
                  </div>
                </div>
       `;

       panel.appendChild(userDiv);


  })
}
  )};

// Function to loading pending registrations in home
function loadPendingRegistrations(){
  fetch('/admin/pending-users')
  .then(res => res.json())
  .then(data => {

    const panel = document.getElementById('pendingRegistrationsPanel');

    data.forEach(user => {
    //Create user entry

    const userDiv = document.createElement('div'); //Parent
    userDiv.classList.add('for-approval');
    userDiv.setAttribute('data-user-id', user.userId);
    console.log(`Rendering user div with ID: ${user.userId}`); // Log the user ID

    userDiv.innerHTML = `
                <div class="for-approval-left">
                  ${user.firstName} ${user.lastName}
                </div>
                <div class="for-approval-right">
                  <button class="admin-home-view-details" onclick="showDetailsHomeModal(${user.userId})"> 
                    View Details
                  </button>
                  <i id="check-button" class="fa-solid fa-square-check" onclick="openApprovalModal(${user.userId}, '${user.firstName}', '${user.lastName}', '${user.program}', '${user.yearLvl}', '${user.profPic}', '${user.role}')"></i>
                  <i id="x-button" class="fa-solid fa-square-xmark" onclick="openDenyModal(${user.userId})"></i>
                </div>
      `;

      panel.appendChild(userDiv);
  });
  })
  .catch(error => console.error('Error fetching pending users', error));
};

//Function for loading registered tutors in registered
function loadRegisteredTutors(){
  fetch('/admin/registered-tutors')
  .then(res=>res.json())
  .then(data=>{

    const registeredTutorsPanel = document.getElementById('registeredTutors');

    data.forEach(user=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('list-of-tutor');
      userDiv.setAttribute('data-user-id', user.userId);

      userDiv.innerHTML = `
              <div class="list-of-tutor-left">
              ${user.firstName} ${user.lastName}
              </div>
              <div class="list-of-tutor-right">
                <button class="view-details" onclick="showDetailsRegisteredModalTutors(${user.userId})"> 
                  View Details
                </button>
              </div>`

      registeredTutorsPanel.appendChild(userDiv);
    });
    
  }).catch(error => console.error('Error fetching pending users', error));
};

//Function for loading registered tutees in registered
function loadRegisteredTutees(){
  fetch('/admin/registered-tutees')
  .then(res=>res.json())
  .then(data=>{

    const registeredTuteesPanel = document.getElementById('registeredTutees');

    data.forEach(user=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('list-of-tutee');
      userDiv.setAttribute('data-user-id', user.userId);

      userDiv.innerHTML = `
              <div class="list-of-tutee-left">
              ${user.firstName} ${user.lastName}
              </div>
              <div class="list-of-tutees-right">
                <button class="view-details" onclick="showDetailsRegisteredModalTutees(${user.userId})"> 
                  View Details
                </button>
              </div>`

      registeredTuteesPanel.appendChild(userDiv);
    });
    
  }).catch(error => console.error('Error fetching pending users', error));
};

//Show details modal for home
function showDetailsHomeModal(userId) {

  fetch('/admin/pending-users')
  .then(res=>res.json())
  .then(data => {

    const user = data.find(u=>u.userId === userId);
    const modal = document.getElementById('admin-home-view-details-modal');
    const fields = modal.querySelector('.home-right-side-content').children;

      fields[0].textContent = user.firstName;
      fields[1].textContent = user.lastName;
      fields[2].textContent = user.role;
      fields[3].textContent = user.program;
      fields[4].textContent = user.yearLvl;
      fields[5].textContent = user.contactNo;
      fields[6].textContent = user.studentNo;
      fields[7].textContent = user.email;

      // Display Registration Form (PDF)
      const regFormContainer = fields[8]; // Assuming field[8] is for the registration form
      if (user.regForm) {
        const regFormUrl = `/${user.regForm}`;
        const iframe = document.createElement('iframe');
        iframe.src = regFormUrl;
        iframe.width = '100%';
        iframe.height = '500px';
        regFormContainer.textContent = ''; // Clear existing content
        regFormContainer.appendChild(iframe);
      } else {
        regFormContainer.textContent = 'No registration form available.';
      }

      // Show the modal
      modal.style.display = 'block';

  });

};

//Show details modal for registered tutors
function showDetailsRegisteredModalTutors(userId){

  fetch('/admin/registered-tutors')
  .then(res=>res.json())
  .then(data=>{

    const user = data.find(u=>u.userId === userId);
    const modal = document.getElementById('admin-registered-view-details-modal');
    
    const fields = modal.querySelector('.registered-right-side-content').children;

    fields[0].textContent = user.firstName;
    fields[1].textContent = user.lastName;
    fields[2].textContent = user.role;
    fields[3].textContent = user.program;
    fields[4].textContent = user.yearLvl;
    fields[5].textContent = user.contactNo;
    fields[6].textContent = user.studentNo;
    fields[7].textContent = user.email;
    fields[8].textContent = user.regForm;

    // Display Registration Form (PDF)
    const regFormContainer = fields[8]; // Assuming field[8] is for the registration form
    if (user.regForm) {
      const regFormUrl = `/${user.regForm}`;
      const iframe = document.createElement('iframe');
      iframe.src = regFormUrl;
      iframe.width = '100%';
      iframe.height = '500px';
      regFormContainer.textContent = ''; // Clear existing content
      regFormContainer.appendChild(iframe);
    } else {
      regFormContainer.textContent = 'No registration form available.';
    }

      // Link the "Ban" button in the modal to the correct userId
      const banButton = modal.querySelector('.openBanButtonModal')
      banButton.onclick = () => openBanModal(userId);

    modal.style.display = 'block';
  })
};

//Show details modal for registered tutees
function showDetailsRegisteredModalTutees(userId){

  fetch('/admin/registered-tutees')
  .then(res=>res.json())
  .then(data=>{

    const user = data.find(u=>u.userId === userId);
    const modal = document.getElementById('admin-registered-view-details-modal');
    
    const fields = modal.querySelector('.registered-right-side-content').children;

    fields[0].textContent = user.firstName;
    fields[1].textContent = user.lastName;
    fields[2].textContent = user.role;
    fields[3].textContent = user.program;
    fields[4].textContent = user.yearLvl;
    fields[5].textContent = user.contactNo;
    fields[6].textContent = user.studentNo;
    fields[7].textContent = user.email;
    fields[8].textContent = user.regForm;

    // Display Registration Form (PDF)
    const regFormContainer = fields[8]; // Assuming field[8] is for the registration form
    if (user.regForm) {
      const regFormUrl = `/${user.regForm}`;
      const iframe = document.createElement('iframe');
      iframe.src = regFormUrl;
      iframe.width = '100%';
      iframe.height = '500px';
      regFormContainer.textContent = ''; // Clear existing content
      regFormContainer.appendChild(iframe);
    } else {
      regFormContainer.textContent = 'No registration form available.';
    }

    // Link the "Ban" button in the modal to the correct userId
    const banButton = modal.querySelector('.openBanButtonModal')
    banButton.onclick = () => openBanModal(userId);

    modal.style.display = 'block';
  })
};

//Function for opening the approval modal
function openApprovalModal(userId, firstName, lastName, program, yearLvl, profPic, role) {

  const modal = document.getElementById('admin-home-check-modal');

  // Dynamically update the approve button's onclick handler
  const approveButton = modal.querySelector('.account-approval-approve-button');
  approveButton.onclick = () => approveUser(userId, firstName, lastName, program, yearLvl, profPic, role);

  modal.style.display = 'block';
};

//Function for opening the denial modal
function openDenyModal(userId) {

  const modal = document.getElementById('admin-home-deny-modal');

  // Dynamically update the deny button's onclick handler
  const denyButton = modal.querySelector('.account-denial-deny-button');
  denyButton.onclick = () => denyUser(userId);

  modal.style.display = 'block';
};

//Function for opening the ban modal
function openBanModal(userId) {

  const modal = document.getElementById('admin-registered-view-details-ban-modal');
  const banButton = modal.querySelector('.account-banning-ban-button');

  banButton.onclick = () => banUser(userId);

  modal.style.display = 'block';

};

//Function for approving pending registrations

function approveUser(userId, firstName, lastName, program, yearLvl, profPic, role) {
  reloadPage();
  document.getElementById("admin-home-check-modal").style.display = 'none';
  fetch('/admin/approve-pending-user', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({userId, firstName, lastName, program, yearLvl, profPic, role})
  })
  .then(res=>res.json())
  .then(data =>{

    console.log(data);
    loadPendingRegistrations();

})
  .catch(error =>console.error('Error approving user', error));
};

//Function for denying pending registrations
function denyUser(userId){
  document.getElementById("admin-home-deny-modal").style.display = 'none';
  fetch('/admin/deny-pending-user', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userId})
  })
  .then(res=>res.json())
  .then(data =>{
    loadPendingRegistrations();
  })
  .catch(error =>console.error('Error approving user', error));
  reloadPage();
};

//Function for banning registered students
function banUser(userId){
  reloadPage();
  document.getElementById("admin-registered-view-details-ban-modal").style.display = 'none';
  fetch('/admin/ban-user', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({userId})
  })
  .then(res=>res.json())
  .then(data =>{
    console.log('Server response:', data);
      const userDiv = document.querySelector(`.for-approval[data-user-id="${userId}"]`);
      userDiv.remove();
      console.log(`User ${userId} removed from the panel`);
})
  .catch(error =>console.error('Error approving user', error));

};

//Initialize all screens
function initializePage(){
  loadHomeCounts();
  loadTutorialSessions();
  loadAllTutorials();
  loadPendingRegistrations();
  loadRegisteredTutors();
  loadRegisteredTutees();
};

function loadTutorialSessions() {
  fetch('/admin/tutorial-session', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(({ tutorialCount, tutorials }) => {
      const tableBody = document.querySelector('#tutorial-session-table tbody');
      tableBody.innerHTML = '';

      // Create a lookup object to match tutors to their counts
      const countsMap = {};
      tutorialCount.forEach(count => {
          countsMap[count.tutor] = {
              pending_count: count.pending_count,
              scheduled_count: count.scheduled_count
          };
      });

      // Create a Set to track unique tutors
      const uniqueTutors = new Set();

      // Iterate through tutorials and add unique tutors to the table
      tutorials.forEach(tutorial => {
          if (!uniqueTutors.has(tutorial.tutor)) {
              uniqueTutors.add(tutorial.tutor);

              // Check if the tutor has counts, otherwise default to 0
              const counts = countsMap[tutorial.tutor] || { pending_count: 0, scheduled_count: 0 };

              // Skip tutors with both counts being zero
              if (counts.pending_count === 0 && counts.scheduled_count === 0) {
                return;
              }

              const row = document.createElement('tr');

              row.innerHTML = `
                  <td>${tutorial.tutor}</td>
                  <td><div class="pending-count">${counts.pending_count}</div></td>
                  <td><div class="scheduled-count">${counts.scheduled_count}</div></td>
                  <td>
                      <button class="admin-tutorial-session-view-details" onclick="openTutorialSessionsViewDetailsModal('${tutorial.tutor}')">
                          View Details
                      </button>
                  </td>`;

              tableBody.appendChild(row);
          }
      });
  })
  .catch(error => {
      console.error('Error:', error);
  });
};

function openTutorialSessionsViewDetailsModal(tutor){
  fetch('/admin/tutorial-session-details')
  .then(response => response.json())
  .then(({pendingTutorials, scheduledTutorials}) => {

    const filteredPendingTutorials = pendingTutorials.filter(t=>t.tutor === tutor);
    const filteredScheduledTutorials = scheduledTutorials.filter(t=>t.tutor === tutor);

    const modal = document.getElementById("admin-tutorial-session-view-details-modal");
    const pendingPanel = document.getElementById('pendingPanel');
    const scheduledPanel = document.getElementById('scheduledPanel');

    pendingPanel.innerHTML = '';
    scheduledPanel.innerHTML = '';

    filteredPendingTutorials.forEach(tutorial=>{

      const userDiv = document.createElement('div');
      userDiv.classList.add('pending-tutorial');
  
        userDiv.innerHTML = `
          <div class="pending-tutorial-left">
            ${tutorial.tutee}
          </div>
          <div class="pending-tutorial-right">
            <button class="view-details"> 
              View Details
            </button>
  
      `;

      const viewDetailsButton = userDiv.querySelector('.view-details');
      viewDetailsButton.addEventListener('click', ()=>{
        showTutorialDetails(tutorial)
      });

      pendingPanel.appendChild(userDiv);

    });
  
  filteredScheduledTutorials.forEach(tutorial=>{

    const userDiv = document.createElement('div');
    userDiv.classList.add('schedule-tutorials');

    userDiv.innerHTML = `

            <div class="schedule-tutorials-left">
              ${tutorial.tutee}
            </div>
            <div class="schedule-tutorials-right">
              <button class="view-details"> 
                View Details
              </button>
            </div>
      `;

      const viewDetailsButton = userDiv.querySelector('.view-details');
      viewDetailsButton.addEventListener('click', ()=>{
      showTutorialDetails(tutorial)
  });

      scheduledPanel.appendChild(userDiv);
  });

  modal.style.display = 'block';

  })
  .catch(error => {
      console.error('Error:', error);
  });
  
};

function showTutorialDetails(tutorial){

  const modal = document.getElementById('admin-inside-view-details-modal');
  const fields = modal.querySelectorAll('.tutorial-details tr');

  fields[0].children[1].textContent = tutorial.status;
  fields[1].children[1].textContent = tutorial.tutee;
  fields[2].children[1].textContent = tutorial.program;
  fields[3].children[1].textContent = tutorial.course;
  fields[4].children[1].textContent = tutorial.topics;
  fields[5].children[1].textContent = tutorial.noOfTutees;
  fields[6].children[1].textContent = tutorial.date;
  fields[7].children[1].textContent = tutorial.time;

  modal.style.display = 'block';

}

function loadAllTutorials(){

  fetch('/admin/tutorial-history', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);

      const tableBody = document.querySelector('#tutorial-history-table tbody');
      tableBody.innerHTML = '';

      data.forEach(tutorial=>{

        const row = document.createElement('tr');
        row.innerHTML = `                  
                  <td>${tutorial.id}</td>
                  <td>${tutorial.tutor}</td>
                  <td>${tutorial.tutee}</td>
                  <td>${tutorial.program}</td>
                  <td>${tutorial.course}</td>
                  <td>${tutorial.topics}</td>
                  <td>${tutorial.noOfTutees}</td>
                  <td>${tutorial.date}</td>
                  <td>${tutorial.roomNo}</td>
                  <td>${tutorial.totalTime}</td>
                  <td>${tutorial.status}</td>`

        tableBody.appendChild(row);
      })
  })
  .catch(error => {
      console.error('Error:', error);
  });
}



//Screen loader
document.addEventListener('DOMContentLoaded', initializePage);


