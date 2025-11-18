using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class ResignationResponseDto
    {
            public long Id { get; set; }
            public string? EmployeeName { get; set; }
            public long DepartmentId { get; set; }
           public ResignationStatus Status { get; set; }
            public string? Department { get; set; }
            public long ReportingManagerId { get; set; }
            public string? ReportingManagerName { get; set; }
            public  JobType JobType { get; set; }
        

    }
}
