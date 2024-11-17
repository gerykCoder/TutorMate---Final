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

function reloadPage(){
  window.location.reload();
}
// Function to handle pending registrations 
function loadPendingRegistrations(){
  fetch('/admin/pending-users')
  .then(res => res.json())
  .then(data => {
    const panel = document.getElementById('pendingRegistrationsPanel');
    // panel.innerHTML = ''; //Clear panel before populating
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
                  <button class="admin-home-view-details" onclick="showDetailsModal(${user.userId})"> 
                    View Details
                  </button>
                  <i id="check-button" class="fa-solid fa-square-check" onclick="openApprovalModal(${user.userId})"></i>
                  <i id="x-button" class="fa-solid fa-square-xmark" onclick="openDenyModal(${user.userId})"></i>
                </div>
      `;

      panel.appendChild(userDiv);
  });
  })
  .catch(error => console.error('Error fetching pending users', error));
};

//Show details modal
function showDetailsModal(userId) {

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
      fields[8].textContent = user.regForm;

      // Handle Blob for Registration Form
      if (user.regForm) {
        const blob = new Blob([user.regForm], { type: 'image/png' }); // Assuming it's a PDF
        const blobUrl = URL.createObjectURL(blob);

        // Example for PDF
        const regFormContainer = document.createElement('iframe');
        regFormContainer.src = blobUrl;
        regFormContainer.width = '100%';
        regFormContainer.height = '500px';

        fields[8].textContent = ''; // Clear existing content
        fields[8].appendChild(regFormContainer);
      } else {
        fields[8].textContent = 'No registration form available.';
      }

      modal.style.display = 'block';

  });

};

//Function for opening the approval modal
function openApprovalModal(userId) {

  const modal = document.getElementById('admin-home-check-modal');

  // Dynamically update the approve button's onclick handler
  const approveButton = modal.querySelector('.account-approval-approve-button');
  approveButton.onclick = () => approveUser(userId);

  modal.style.display = 'block';
}

//Function for opening the denial modal

function openDenyModal(userId) {

  const modal = document.getElementById('admin-home-deny-modal');

  // Dynamically update the deny button's onclick handler
  const denyButton = modal.querySelector('.account-denial-deny-button');
  denyButton.onclick = () => denyUser(userId);

  modal.style.display = 'block';
}

//Function for approving pending registrations

function approveUser(userId) {
  reloadPage();
  document.getElementById("admin-home-check-modal").style.display = 'none';
  fetch('/admin/approve-pending-user', {
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

//Function for denying pending registrations

function denyUser(userId){
  reloadPage();
  document.getElementById("admin-home-check-modal").style.display = 'none';
  fetch('/admin/deny-pending-user', {
    method: 'POST',
    headers: {'Content-Type': 'applcation/json'},
    body: JSON.stringify({userId})
  })
  .then(res=>res.json())
  .then(data =>{
    console.log('Server response:', data);
    const userDiv = document.querySelector(`.for-approval[data-user-id="${userId}"]`);
    userDiv.remove();
    console.log(`User ${userId} removed from the panel`);

  })
  
}

document.addEventListener('DOMContentLoaded', loadPendingRegistrations);


