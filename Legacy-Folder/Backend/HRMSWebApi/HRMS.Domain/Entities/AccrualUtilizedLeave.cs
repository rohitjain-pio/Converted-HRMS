namespace HRMS.Domain.Entities
{
    public class AccrualUtilizedLeave : BaseEntity
    {

        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public DateOnly Date { get; set; }
        public string Description { get; set; }
        public decimal? Accrued { get; set; }
        public decimal? UtilizedOrRejected { get; set; }
        public decimal ClosingBalance { get; set; }

    }

}
