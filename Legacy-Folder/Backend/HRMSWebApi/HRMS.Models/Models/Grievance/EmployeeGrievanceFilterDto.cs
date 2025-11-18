using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Grievance
{
    public class EmployeeGrievanceFilterDto
    {
      public int? GrievanceTypeId { get; set; }
      public GrievanceStatus? Status { get; set; }
    }
}



