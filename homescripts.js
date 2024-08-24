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
      
      /* 
      For each transaction recieved from the api:
        - Create a div with the id matching the transactionID of the transaction
        - Create a label describing the transaction
        - Create a button that when pressed deletes the transaction
      */
      document.getElementById("transactions").innerHTML += 
      "<div id=\""+transaction.transactionID+"\">"
        +"<label class=\"transaction\">"+ JSON.stringify(transaction) +"</label>"
        +"<button type=\"button\" id=\"delete-button\" onclick=\"deleteTransaction(this);\">Delete</button>"
        +"<button type=\"button\" id=\"update-button\" onclick=\"updateTransactionForm(this);\">Update</button>"
      +"</div>";
      netGainLoss += transaction.transactionAmount;
    }

    // Summarize the net gains or loss from the transactions
    // .toFixed is used to ensure that the number has only 2 decimal places
    if(netGainLoss < 0) {
      document.getElementById("transactions-total").innerHTML += "<h2>Net: -$" + -netGainLoss.toFixed(2) + "</h2>" ;
    }
    else {
      document.getElementById("transactions-total").innerHTML += "<h2>Net: $" + netGainLoss.toFixed(2) + "</h2>" ;
    }
    
  })

}

// Create a new transaction for this user
function createNewTransaction() {

  var token = sessionStorage.getItem("token");

  var name = document.getElementById("name-input").value;
  var description = document.getElementById("description-input").value;
  var amount = document.getElementById("amount-input").value;
  
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
      "transactionAmount": amount
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
  var transactionID = button.parentElement.id;

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

  var transactionID = button.parentElement.id;
  // Store this transactionid in session storage so that it can be updated
  sessionStorage.setItem("workingTransactionID", transactionID);

  var transaction;

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
    //transaction = JSON.parse(JSON.stringify(jsonResponse));
    // window.alert(JSON.parse(JSON.stringify(jsonResponse)).transactionName)
    // TODO prefill the text inputs with current values
    area.innerHTML += "<h2 for=\"update-transaction\" class=\"update-transaction-label\">Update Transaction</h2>"
    + "<form id=\"update-transaction\" onsubmit=\"return updateTransaction();\" class=\"transaction-form\">"
      + "<label for=\"updated-name-input\">Transaction Name: <input type=\"text\" id=\"updated-name-input\" value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionName+"\"/></label>"
      + "<label for=\"updated-description-input\">Transaction Description (optional): <input type=\"text\" id=\"updated-description-input\"value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionDescription+"\"/></label>"
      + "<label for=\"updated-amount-input\">Transaction Amount: <input type=\"number\" step=\"0.01\" id=\"updated-amount-input\" value=\""+JSON.parse(JSON.stringify(jsonResponse)).transactionAmount+"\"/></label>"
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
      "transactionAmount": amount
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