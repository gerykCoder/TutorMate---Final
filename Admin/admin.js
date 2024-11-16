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
  window.location.href = "/Login/login.html"; // Change this to your actual login page URL
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