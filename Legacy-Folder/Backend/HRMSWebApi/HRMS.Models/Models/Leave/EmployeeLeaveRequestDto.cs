using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class EmployeeLeaveRequestDto
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public decimal OpeningBalance { get; set; }
        public string?  Description { get; set; }
        public bool IsActive { get; set; }
  
    }
}
