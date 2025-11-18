namespace HRMS.Domain.Entities
{
    public class KPIGoals : BaseEntity
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public long DepartmentId { get; set; }
        public string EmployeeIds { get; set; } = string.Empty;

    }
}
