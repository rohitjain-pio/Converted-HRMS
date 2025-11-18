using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class GetAllLeaveBalanceRequestDto
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }

    }
}
