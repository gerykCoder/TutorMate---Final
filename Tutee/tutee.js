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
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Function to handle logout
function logout() {
  // Redirect to the login page
  window.location.href = "/"; // Change this to your actual login page URL
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

document.addEventListener('DOMContentLoaded', loadAvailableTutors);
