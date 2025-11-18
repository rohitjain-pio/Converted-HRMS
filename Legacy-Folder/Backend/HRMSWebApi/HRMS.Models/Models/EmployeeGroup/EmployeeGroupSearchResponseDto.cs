namespace HRMS.Models.Models.EmployeeGroup
{
    public class EmployeeGroupSearchResponseDto
    {
      public IEnumerable<EmployeeGroupSearchDto> EmployeeGroupList { get; set; } = default!;
      public int TotalRecords { get; set; }
    }
}
