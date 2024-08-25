/**
 * Attempts to register the user with the api.
 * 
 * @returns {boolean} true if the user is successfully registered, false otherwise
 */
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
/**
 * Attempts to login the user with the api.
 * 
 * @returns {boolean} true if the user is able to successfully login, false otherwise
 */
function login() {

  var email = document.getElementById("email-input").value;
  var password = document.getElementById("password-input").value;
  var loginForm = document.getElementById("login-form");
  
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
  // Check the response status, if ok then get the json, otherwise throw an error
  .then(response => {
    // If the login was successful
    if(response.ok) {
      return response.json();
    }
    else {
      throw new Error(response.status);
    }
   })
   // Send the user to the home page with their bearer token stored in session storage
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
  // If an error occurs along the way, inform the user that the username or password must be incorrect
  .catch(() => {
    loginForm.innerHTML += "<label class=\"warning-label\">Username and/or password are incorrect. Try Again.</label>";
  })
  // If true is not returned somewhere above, then false should be returned so the form is not 
  // submitted
  return false;
}

