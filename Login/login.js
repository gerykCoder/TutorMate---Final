function openPage(pageName,elmnt,color) {
  var i, tabcontent, tablinks;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Reset tab link background colors and text colors
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
    tablinks[i].style.color = "";
  }

  // Show the selected tab content
  document.getElementById(pageName).style.display = "block";

  // Set the background color and text color of the selected tab link
  elmnt.style.backgroundColor = color; // Set background color
  elmnt.style.color = "white"; // Set text color
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function redirectToAdminDashboard() {
  window.location.href = "/Admin/admin.html";
}

function redirectToTuteeDashboard() {
  window.location.href = "/Tutee/tutee.html";
}

function redirectToTutorDashboard() {
  window.location.href = "/Tutor/tutor.html";
}


function redirectToSignup() {
  window.location.href = "/Sign Up/sign-up.html";
}


