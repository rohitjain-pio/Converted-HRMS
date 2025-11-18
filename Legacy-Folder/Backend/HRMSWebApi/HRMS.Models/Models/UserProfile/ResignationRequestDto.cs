using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class ResignationRequestDto
    {
        public int EmployeeId { get; set; }
        public int DepartmentId { get; set; }
        public string Reason { get; set; }
        public long ReportingManagerId { get; set; }
        public JobType JobType { get; set; }
    
        
    }
}
