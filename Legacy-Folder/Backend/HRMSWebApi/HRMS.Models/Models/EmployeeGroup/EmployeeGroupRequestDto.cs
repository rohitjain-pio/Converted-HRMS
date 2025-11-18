namespace HRMS.Models.Models.EmployeeGroup
{
    public class EmployeeGroupRequestDto
    {
        public long Id { get; set; } = default!;
        public string GroupName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public bool Status {  get; set; } = default!;  
        public List<long> EmployeeIds { get; set; } = default!;
    }
}
