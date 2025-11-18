using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class EmployeeLeaveDetailResponseDto
    {
        public int LeaveId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int StartDateSlot { get; set; }
        public int EndDateSlot { get; set; }
        public string Reason { get; set; }
        public string RejectReason { get; set; }
        public decimal TotalLeaveDays { get; set; }
        public int Status { get; set; }
        public DateOnly CreatedOn { get; set; }
        public string ShortName { get; set; }
        public string Title { get; set; }
        
    }

}
