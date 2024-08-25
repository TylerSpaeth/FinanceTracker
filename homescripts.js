/**
 * Signs the user out and sends them back to the login page
 */
function signout() {
  sessionStorage.removeItem("token");
  window.location.href = "index.html";
}

// Load all transactions specific to this user
/**
 * Loads all of the transactions specific the the user into the transaction log.
 * Also calculates the transaction totals over the past month, year, and all time.
 */
function loadAllTransactions() {

  var token = sessionStorage.getItem("token");

  fetch("https://localhost:7137/transaction", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "accept": "application/json"
    }
  })
  .then(response => {
    if(response.ok) {
      return response.json();
    }
  })
  .then(jsonResponse => {

    var allTimeNetGainLoss = 0;
    var yearNetGainLoss = 0;
    var monthNetGainLoss = 0;

    for(let i = 0; i < jsonResponse.length; i++) {

      var transaction = jsonResponse[i];

      var transactionName = JSON.parse(JSON.stringify(transaction)).transactionName;
      var transactionDescription = JSON.parse(JSON.stringify(transaction)).transactionDescription;

      // Determine the transaction amount, format the string properly, and determine if the class
      // should be positive or negative
      var transactionAmount = JSON.parse(JSON.stringify(transaction)).transactionAmount;
      var positiveNegativeString;
      if(transactionAmount < 0) {
        transactionAmount = "-$" + (-transactionAmount).toFixed(2);
        positiveNegativeString = "negative"
      }
      else {
        transactionAmount = "$" + transactionAmount.toFixed(2);
        positiveNegativeString = "positive"
      }

      // Parse the individual components out of the transactionDate and then reformat in
      // a way that is easier to read
      var rawTransactionDate = JSON.parse(JSON.stringify(transaction)).transactionDate;
      var year = rawTransactionDate.slice(0,4);
      var month = rawTransactionDate.slice(5,7);
      var day = rawTransactionDate.slice(8,10);
      var hour = rawTransactionDate.slice(11,13);
      var minute = rawTransactionDate.slice(14,16);
      var transactionDate = hour + ":" + minute + " " + month + "/" + day + "/" + year;
      
      /* 
      For each transaction recieved from the api:
        - Create a div with the id matching the transactionID of the transaction
        - Create a label describing the transaction
        - Create a button that when pressed deletes the transaction
      */
      document.getElementById("transactions").innerHTML += 
      "<div id=\""+transaction.transactionID+"\" class=\"transaction\">"
        +"<div id=\"text-portion\">"
          +"<div>"
            +"<label id=\"transaction-name\" class=\"transaction-piece\">"+ transactionName +" - </label>"
            +"<label class=\"transaction-piece "+ positiveNegativeString +"\">"+ transactionAmount +"</label>"
          +"</div>"
          +"<label id=\"description-label\" class=\"transaction-piece\">"+ transactionDescription +"</label>"
          +"<label class=\"transaction-piece\">"+ transactionDate +"</label>"
        +"</div>"
        +"<div id=\"button-portion\">"
          +"<button type=\"button\" id=\"delete-button\" onclick=\"deleteTransaction(this);\">Delete</button>"
          +"<button type=\"button\" id=\"update-button\" onclick=\"updateTransactionForm(this);\">Update</button>"
        +"</div>"
      +"</div>";
      allTimeNetGainLoss += transaction.transactionAmount;
      var currentDate = new Date();
      var compareDate = new Date(rawTransactionDate);
      if(currentDate.getTime() - compareDate.getTime() < 31556952000) {
        yearNetGainLoss += transaction.transactionAmount;
      }
      if(currentDate.getTime() - compareDate.getTime() < 2629746000) {
        monthNetGainLoss += transaction.transactionAmount;
      }
    }

    // Summarize the net gains or loss from the transactions
    document.getElementById("transactions-total").innerHTML += 
      "<h2 class=\"" +getPositiveNegative(allTimeNetGainLoss)+ "\">All Time Net: " + formatCurrencyString(allTimeNetGainLoss) + "</h2>";
    document.getElementById("transactions-total").innerHTML += 
      "<h2 class=\"" +getPositiveNegative(yearNetGainLoss)+ "\">Yearly Net: " + formatCurrencyString(yearNetGainLoss) + "</h2>";
    document.getElementById("transactions-total").innerHTML += 
      "<h2 class=\"" +getPositiveNegative(monthNetGainLoss)+ "\">Monthly Net: " + formatCurrencyString(monthNetGainLoss) + "</h2>";
  })

}

/**
 * Formats a number into a dollar string representation
 * @param {number} number a number that should be formatted into a currency. 
 * @returns {string} a string represenation of the number in dollar format
 */
function formatCurrencyString(number) {
  if(str < 0) {
    return "-$" + -number.toFixed(2);
  }
  return "$" + number.toFixed(2);
}

/**
 * Gives a string the corresponds to a css class selector for positive or negative
 * numbers.
 * @param {number} number the number that is either positive or negative
 * @returns {string} a string that is either "positive" or "negative" depending on the
 * given number. 0 returns positive.
 */
function getPositiveNegative(number) {
  if(number >= 0) return "positive";
  return "negative";
}

/**
 * Attempts to create a new transaction for the user. Utilizing input
 * fields in the home.html file for that values needed in creation.
 * @returns {boolean} true if the creation is successful, false otherwise.
 */
function createNewTransaction() {

  var token = sessionStorage.getItem("token");

  var name = document.getElementById("name-input").value;
  var description = document.getElementById("description-input").value;
  var amount = document.getElementById("amount-input").value;
  var date = document.getElementById("date-input").value;
  
  fetch("https://localhost:7137/transaction", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "accept": "*/*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify( {
      "transactionName": name,
      "transactionDescription": description,
      "transactionAmount": amount,
      "transactionDate": date
    })
  })
  .then(response => {
    // If the creation was successful, load the transactions and reload the page
    if(response.ok) {
      loadAllTransactions();
      // This is probably not the bet way to refresh the content
      window.location.reload();
      return true;
    }
  })
  return false;
}

/**
 * Deletes the transactions the corresponds with the delete button that was pressed.
 * @param {HTMLButtonElement} button the button that was clicked, which corresponds to
 * a specific transaction
 */
function deleteTransaction(button) {

  var token = sessionStorage.getItem("token");
  var transactionID = button.parentElement.parentElement.id;

  fetch("https://localhost:7137/transaction/"+transactionID, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
      "accept": "*/*",
    },
  })
  .then(response => {
    if(response.ok) {
      loadAllTransactions();
      window.location.reload();
    }
  })
}

/**
 * Creates a new form on the page that allows the user to update the transaction that they selected
 * the update button for. The form is prefilled with the existing values.
 * @param {HTMLButtonElement} button the update button that was pressed, corresponding to a specific
 * transaction.
 */
function updateTransactionForm(button) {

  var token = sessionStorage.getItem("token");

  var area = document.getElementById("update-form");

  var transactionID = button.parentElement.parentElement.id;
  // Store this transactionid in session storage so that it can be updated
  sessionStorage.setItem("workingTransactionID", transactionID);

  fetch("https://localhost:7137/transaction/"+transactionID, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "accept": "application/json"
    }
  })
  .then(response => {
    if(response.ok) {
      return response.json();
    }
  })
  .then(jsonResponse => {
    area.innerHTML += "<h2 for=\"update-transaction\" class=\"update-transaction-label\">Update Transaction</h2>"
    + "<form id=\"update-transaction\" onsubmit=\"return updateTransaction();\" class=\"transaction-form\">"
      + "<label for=\"updated-name-input\">Transaction Name: <input type=\"text\" id=\"updated-name-input\" value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionName+"\" required /></label>"
      + "<label for=\"updated-description-input\">Transaction Description (optional): <input type=\"text\" id=\"updated-description-input\"value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionDescription+"\"/></label>"
      + "<label for=\"updated-amount-input\">Transaction Amount: <input type=\"number\" step=\"0.01\" id=\"updated-amount-input\" value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionAmount+"\" required /></label>"
      + "<label for=\"updated-date-input\">Transaction Date: <input type=\"datetime-local\" id=\"updated-date-input\" value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionDate.slice(0,16)+"\" required/></label>"
      + " <button type=\"submit\" class=\"form-button\">Submit</button>"
    + "</form>";
  })
}

// Updates a transaction
/**
 * Updates the is currently selected as the working transaction according the information
 * that was input into the update form.
 * @returns {boolean} true if the update to the transaction was successful, false otherwise
 */
function updateTransaction() {
  
  var token = sessionStorage.getItem("token");

  var transactionID = sessionStorage.getItem("workingTransactionID");

  var name = document.getElementById("updated-name-input").value;
  var description = document.getElementById("updated-description-input").value;
  var amount = document.getElementById("updated-amount-input").value;
  var date = document.getElementById("updated-date-input").value;


  
  fetch("https://localhost:7137/transaction/"+transactionID, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "accept": "*/*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify( {
      "transactionName": name,
      "transactionDescription": description,
      "transactionAmount": amount,
      "transactionDate": date
    })
  })
  .then(response => {
    // If the creation was successful, load the transactions and reload the page
    if(response.ok) {

      loadAllTransactions();
      // This is probably not the bet way to refresh the content
      window.location.reload();

      sessionStorage.removeItem("workingTransactionID");
      return true;
    }
  })
  return false;
}