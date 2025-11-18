namespace HRMS.Domain.Entities
{
    public class EmployeeLeave : BaseEntity
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public decimal OpeningBalance { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }

        public Dictionary<string, decimal> Leaves { get; set; } = new();
        public DateOnly LeaveDate { get; set; }
    }
}
