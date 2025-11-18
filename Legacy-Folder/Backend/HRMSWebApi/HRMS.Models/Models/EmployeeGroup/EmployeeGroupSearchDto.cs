namespace HRMS.Models.Models.EmployeeGroup
{
    public class EmployeeGroupSearchDto
    {
        public long Id { get; set; }
        public string GroupName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; } = default!;
    }
}
