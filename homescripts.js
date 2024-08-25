function signout() {
  sessionStorage.removeItem("token");
  window.location.href = "index.html";
}

// Load all transactions specific to this user
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

    var netGainLoss = 0;

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
      netGainLoss += transaction.transactionAmount;
    }

    // Summarize the net gains or loss from the transactions
    // .toFixed is used to ensure that the number has only 2 decimal places
    if(netGainLoss < 0) {
      document.getElementById("transactions-total").innerHTML += 
        "<h2 class=\"negative\">Net: -$" + -netGainLoss.toFixed(2) + "</h2>" ;
    }
    else {
      document.getElementById("transactions-total").innerHTML += 
        "<h2 class=\"positive\">Net: $" + netGainLoss.toFixed(2) + "</h2>" ;
    }
    
  })

}

// Create a new transaction for this user
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

// Delete a given transaction with its transaction id
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

// Creates a form to update a transaction
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