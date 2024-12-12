
// Get the modal
var modal = document.getElementById("terms-and-conditions-modal");

// Validate the contact number format on form submission
document.getElementById('signUpForm').addEventListener('submit', function (event) {
  const contactNoInput = document.getElementById('contactNo');
  const contactNoValue = contactNoInput.value;
  const contactNoRegex = /^09\d{2}-\d{3}-\d{4}$/; // Regex for 09XXX-XXX-XXXX format

  if (!contactNoRegex.test(contactNoValue)) {
    alert('Invalid contact number. It must follow the format 09XXX-XXX-XXXX and be exactly 11 digits.');
    event.preventDefault(); // Prevent form submission
  }
});

// Auto-format the contact number input as the user types
document.getElementById('contactNo').addEventListener('input', function (event) {
  let value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
  if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits

  // Add formatting (09XXX-XXX-XXXX)
  if (value.length > 4 && value.length <= 7) {
    value = `${value.slice(0, 4)}-${value.slice(4)}`;
  } else if (value.length > 7) {
    value = `${value.slice(0, 4)}-${value.slice(4, 7)}-${value.slice(7)}`;
  }

  event.target.value = value; // Set the formatted value back to the input field
});

// Validate the student number on form submission
document.getElementById('signUpForm').addEventListener('submit', function (event) {
  const studentNoInput = document.getElementById('studentNo');
  const studentNoValue = studentNoInput.value;
  const studentNoRegex = /^\d{7}$/; // Regex for exactly 7 digits

  if (!studentNoRegex.test(studentNoValue)) {
    alert('Invalid student number. It must be exactly 7 digits.');
    event.preventDefault(); // Prevent form submission
  }
});

// Restrict student number input to 7 digits dynamically
document.getElementById('studentNo').addEventListener('input', function (event) {
  let value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
  if (value.length > 7) value = value.slice(0, 7); // Limit to 7 digits

  event.target.value = value; // Set the cleaned value back to the input field
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}

function selectProgram(){

  const programs = [
    'BS Civil Engineering', 'BS Electrical Engineering', 'BS Electronics Engineering', 'BS Mechanical Engineering',
    'BS Environmental and Sanitary Engineering', 'BS Industrial Engineering', 'BS Architecture', 'BS Mathematics', 
    'BS Computer Science', 'BS Information Technology','BS Information Systems','BS Data Science and Analytics',
    'BS Accountancy', 'BS Accounting Information System','BS Business Administration', 'Bachelor of Secondary Education Major in English',
    'Bachelor of Secondary Education Major in Mathematics', 'Bachelor of Secondary Education Major in Science', 'Bachelor of Special Need Education'
  ];

  const selection = document.getElementById('program');

   // Add a default placeholder option
   const defaultOption = document.createElement('option');
   defaultOption.value = '';
   defaultOption.textContent = 'Program';
   defaultOption.disabled = true; // Prevent selection
   defaultOption.selected = true; // Set as selected by default
   selection.appendChild(defaultOption);
 
   // Add program options
  programs.forEach(program => {
    const option = document.createElement('option');
    option.value = program;
    option.textContent = program;

    selection.appendChild(option);

})
};

function selectYearLevel(){

  const yearLvls = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  const selection = document.getElementById('yearLvl');

 // Add a default placeholder option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Year Level';
  defaultOption.disabled = true; // Prevent selection
  defaultOption.selected = true; // Set as selected by default
  selection.appendChild(defaultOption);

  // Add year level options
  yearLvls.forEach(yearLvl => {
    const option = document.createElement('option');
    option.value = yearLvl;
    option.textContent = yearLvl;

    selection.appendChild(option);
  })
};

document.addEventListener('DOMContentLoaded', selectProgram);
document.addEventListener('DOMContentLoaded', selectYearLevel);

