
// Get the modal
var modal = document.getElementById("terms-and-conditions-modal");

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

  yearLvls.forEach(yearLvl => {
    const option = document.createElement('option');
    option.value = yearLvl;
    option.textContent = yearLvl;

    selection.appendChild(option);
  })
};

document.addEventListener('DOMContentLoaded', selectProgram);
document.addEventListener('DOMContentLoaded', selectYearLevel);

