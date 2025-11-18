using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class GetAllLeaveBalanceResponseDto
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal ClosingBalance { get; set; }
        public decimal LeavesTaken { get; set; }
    }
}
