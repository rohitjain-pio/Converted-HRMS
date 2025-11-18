using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
     public class AppliedLeaveSearchRequestDto
    {
        public int? LeaveType { get; set; }
        public int? Department { get; set; }
        public string? EmployeeName { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
   
}
