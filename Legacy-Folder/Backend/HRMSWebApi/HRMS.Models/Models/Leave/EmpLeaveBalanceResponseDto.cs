using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class EmpLeaveBalanceResponseDto
    {
        public int LeaveId { get; set; }

        public decimal ClosingBalance { get; set; }
        public string ShortName { get; set; }
        public string Title { get; set; }
              
    }
}
