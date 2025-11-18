namespace HRMS.Domain.Entities
{
    public class Group :BaseEntity
    {
        public string GroupName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public bool Status { get; set; } = default!;
        public List<long> EmployeeIds { get; set; } = default!;

    }
}
