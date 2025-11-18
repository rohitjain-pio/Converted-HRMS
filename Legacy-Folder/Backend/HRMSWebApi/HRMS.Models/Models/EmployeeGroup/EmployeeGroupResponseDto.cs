namespace HRMS.Models.Models.EmployeeGroup
{
    public class EmployeeGroupResponseDto : EmployeeGroupSearchDto
    {       
        public DateTime CreatedOn { get; set; }       
        public string CreatedBy { get; set; } = default!;       
        public List<EmployeeDto> Employee { get; set; } = new();
    }
}
