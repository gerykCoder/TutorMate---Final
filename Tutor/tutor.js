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

let availabilityData = Array.from({ length: 7 }, () => Array(14).fill(false)); // 7 days, 14 half-hour slots
let previousAvailability = JSON.parse(JSON.stringify(availabilityData)); // Deep copy for cancel functionality
let isEditMode = false;

function toggleEditMode() {
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const cells = document.querySelectorAll('#availability-table td');

    isEditMode = !isEditMode;

    if (isEditMode) {
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
        cells.forEach(cell => {
            cell.addEventListener('click', toggleAvailability);
            cell.style.pointerEvents = 'auto'; // Enable clicking
        });
    } else {
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        cells.forEach(cell => {
            cell.removeEventListener('click', toggleAvailability);
            cell.style.pointerEvents = 'none'; // Disable clicking
        });
    }
}

function toggleAvailability(event) {
    if (!isEditMode) return;

    const cell = event.target;
    const rowIndex = cell.parentNode.rowIndex - 1; // Adjust for header row (1st row is header)
    const colIndex = cell.cellIndex - 1; // Adjust for header column (1st column is header)

    // Toggle availability
    if (cell.classList.contains('available')) {
        cell.classList.remove('available');
        availabilityData[colIndex][rowIndex] = false; // Mark as unavailable
    } else {
        cell.classList.add('available');
        availabilityData[colIndex][rowIndex] = true; // Mark as available
    }

    // Update the previous availability for cancel functionality
    previousAvailability = JSON.parse(JSON.stringify(availabilityData));
}

function saveChanges() {
    // Logic to save changes
    alert('Changes saved!'); // Placeholder for actual save logic
    // Here you would typically send the availabilityData to the server for admin verification
    toggleEditMode(); // Exit edit mode after saving
}

function cancelChanges() {
    // Revert to previous availability
    availabilityData = JSON.parse(JSON.stringify(previousAvailability));
    const cells = document.querySelectorAll('#availability-table td');

    cells.forEach((cell, index) => {
        const rowIndex = cell.parentNode.rowIndex - 1; // Adjust for header row
        const colIndex = cell.cellIndex - 1; // Adjust for header column
        if (availabilityData[colIndex][rowIndex]) {
            cell.classList.add('available');
        } else {
            cell.classList.remove('available');
        }
    });

    alert('Changes canceled!'); // Placeholder for actual cancel logic
    toggleEditMode(); // Exit edit mode after canceling
}


