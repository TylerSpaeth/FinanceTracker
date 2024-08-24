using FinanceTrackerAPI.Data;
using System.Security.Claims;

namespace FinanceTrackerAPI.Endpoints
{
    public static class TransactionEndpoints
    {

        public static void RegisterTransactionEndpoints(this IEndpointRouteBuilder routes)
        {
            var app = routes.MapGroup("/transaction");

            // Get all transactions matching the requestees userid
            app.MapGet("", (AppDbContext context, ClaimsPrincipal principal) =>
            {
                var userid = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
                // Returns the transactions with the oldest first and the newest last
                return context.Transactions.OrderBy(t => t.TransactionDate).Where(t => t.UserId == userid);
            }).RequireAuthorization();

            // Get the transaction matching the transactionID only if the userid on the transaction matches the requestees
            app.MapGet("/{transactionID}", (AppDbContext context, ClaimsPrincipal principal, String transactionID) =>
            {
                var userid = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
                // Find the transaction
                Transaction transaction = context.Transactions.Find(transactionID);
                
                // If the transaction is not found return that
                if(transaction is null)
                {
                    return Results.NotFound();
                }

                // Verify that the user is the owner of the transaction and is therefore allowed to view it
                return transaction.UserId.Equals(userid)
                    ? Results.Ok(transaction)
                    : Results.Unauthorized();

            }).RequireAuthorization();

            // Create a new transaction
            app.MapPost("", (AppDbContext context, Transaction transaction, ClaimsPrincipal principal) =>
            {
                // Set the user id to that of the creator
                transaction.UserId = principal.FindFirst(ClaimTypes.NameIdentifier).Value;

                // Generate new transactionsids until a unique one is found
                String transactionID;
                do
                {
                    transactionID = Guid.NewGuid().ToString();
                }
                while (context.Transactions.Find(transactionID) != null);

                transaction.TransactionID = transactionID;
                context.Transactions.Add(transaction);
                context.SaveChanges();
                return Results.Created($"transaction/{transaction.TransactionID}", transaction);
            }).RequireAuthorization();

            app.MapPut("/{transactionID}", (AppDbContext context, ClaimsPrincipal principal, String transactionID, Transaction updatedTransaction) =>
            {
                var userid = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
                // Find the transaction
                Transaction transaction = context.Transactions.Find(transactionID);

                // If the transaction is not found return that
                if(transaction is null)
                {
                    return Results.NotFound();
                }
                // Verify the user is allowed to access this
                else if(!transaction.UserId.Equals(userid)) {
                    return Results.Unauthorized();
                }

                transaction.TransactionName = updatedTransaction.TransactionName;
                transaction.TransactionDescription = updatedTransaction.TransactionDescription;
                transaction.TransactionAmount = updatedTransaction.TransactionAmount;
                transaction.TransactionDate = updatedTransaction.TransactionDate;

                context.SaveChanges();
                return Results.NoContent();

            }).RequireAuthorization();

            app.MapDelete("{transactionID}", (AppDbContext context, ClaimsPrincipal principal, String transactionID) =>
            {
                var userid = principal.FindFirst(ClaimTypes.NameIdentifier).Value;
                // Find the transaction
                Transaction transaction = context.Transactions.Find(transactionID);

                // If the transaction is not found return that
                if (transaction is null)
                {
                    return Results.NotFound();
                }
                // Verify the user is allowed to access this
                else if (!transaction.UserId.Equals(userid))
                {
                    return Results.Unauthorized();
                }
                 context.Transactions.Remove(transaction);
                context.SaveChanges();
                return Results.NoContent();
            }).RequireAuthorization();
        }

    }
}
