// Registers with the the api
function register() {

  var email = document.getElementById("email-input").value;
  var password = document.getElementById("password-input").value;

  fetch("https://localhost:7137/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "*/*"
    },
    body: JSON.stringify( {
      "email": email,
      "password": password
    })
  })
  .then(response => {
    // If the registration was successful log the user in
    if(response.ok) {
      return login();
    }
  })
  return false;
}

// Login via the api
function login() {

  var email = document.getElementById("email-input").value;
  var password = document.getElementById("password-input").value;

  fetch("https://localhost:7137/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "*/*"
    },
    body: JSON.stringify( {
      "email": email,
      "password": password
    })
  })
  // TODO clean up the returns
  .then(response => {
    // If the login was successful
    if(response.ok) {
      return response.json();
    }
    return false;
   })
   .then(jsonResponse => {
    // Parse the bearer token from the response
    var accessToken = JSON.parse(JSON.stringify(jsonResponse)).accessToken;
    // Store the token in the session storage
    sessionStorage.setItem("token", accessToken);
    // Send the user to the home page
    window.location.href = "home.html";
    // If the all happened successfully, then return true so the form is submitted
    return true;
   })
  return false;
}

