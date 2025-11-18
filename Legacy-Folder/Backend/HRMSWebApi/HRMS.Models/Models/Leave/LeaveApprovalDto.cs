using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;
 
namespace HRMS.Models.Models.Leave
{
    public class LeaveApprovalDto
    {
        public decimal OpeningBalance { get; set; }
        public LeaveStatus Decision { get; set; }  // "approve = 2" or "reject = 3"
        public int AppliedLeaveId { get; set; }
        public string? RejectReason { get; set; }
}
 
}
 