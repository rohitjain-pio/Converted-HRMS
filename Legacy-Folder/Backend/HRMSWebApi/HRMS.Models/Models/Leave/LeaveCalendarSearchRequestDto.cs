using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class LeaveCalendarSearchRequestDto
    {
        public long EmployeeId { get; set; }
            public int DepartmentId{get; set; }
        public LeaveStatus? Status { get; set; }
        public DateTime? Date { get; set; }
        public int? LeaveTypeId { get; set; }
    }
}
