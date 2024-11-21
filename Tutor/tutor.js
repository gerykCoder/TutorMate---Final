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
}

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

