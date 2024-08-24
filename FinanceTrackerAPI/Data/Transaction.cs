namespace FinanceTrackerAPI.Data
{
    public class Transaction
    {
        public String TransactionID { get; set; } = string.Empty;
        public string TransactionName { get; set; } = string.Empty;
        public string TransactionDescription { get; set; } = string.Empty;
        public double TransactionAmount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string UserId { get; set; } = string.Empty;
    }
}
