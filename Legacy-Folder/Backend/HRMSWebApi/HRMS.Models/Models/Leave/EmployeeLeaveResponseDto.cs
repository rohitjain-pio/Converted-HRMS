using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class EmployeeLeaveResponseDto
    {
        public long EmployeeId { get; set; }
        public string ShortName { get; set; }
        public string Title { get; set; }
        public decimal OpeningBalance { get; set; }
        public int LeaveId { get; set; }
        public decimal AccruedLeave { get; set; }
        public bool IsActive { get; set; }
        public decimal ClosingBalance { get; set; }

    }
}
