namespace HRMS.Domain.Entities
{
    public class PreviousEmployer : BaseEntity
    {
        public long EmployeeId { get; set; }
        public string EmployerName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}
