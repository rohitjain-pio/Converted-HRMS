namespace HRMS.Models.Models.Dashboard
{
    public class EmployeesCountResponseDto
    {
         public long ActiveEmployeeCount { get; set; }
         public long NewEmployeeCount { get; set; }
         public long ExitOrgEmployeeCount { get; set; }
    }
}