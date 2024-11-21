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

let isEditMode = false;
const checkboxes = document.querySelectorAll(".checkbox");

// Function to toggle between edit and view mode
function toggleEditMode() {
    
    isEditMode = !isEditMode;
    document.getElementById("edit-button").style.display = isEditMode ? 'none' : 'block';
    document.getElementById("save-button").style.display = isEditMode ? 'block' : 'none';
    document.getElementById("cancel-button").style.display = isEditMode ? 'block' : 'none';

        if (isEditMode) {
          checkboxes.forEach(checkbox=>{
            checkbox.disabled = false;
          })
        } else {
            checkboxes.disabled = true;
        }
};

function saveChanges(){

    const availability = [];

    document.querySelectorAll('.checkbox:checked').forEach(checkbox => {
      const day = checkbox.dataset.day; // Get the day from the checkbox
      const time = checkbox.closest('tr').dataset.time; // Get the time from the parent <tr>
      
      availability.push({ day, time }); // Add to the availability array
  });

    fetch('/tutor/availability', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({availability})

    })
    .then(res=>res.json())
    .then(data=>{

      reloadPage();

    })


};