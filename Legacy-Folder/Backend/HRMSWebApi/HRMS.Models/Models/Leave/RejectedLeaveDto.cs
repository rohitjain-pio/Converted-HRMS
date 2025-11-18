using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class RejectedLeaveDto
    {
         public string Email { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateOnly StartDate { get; set; }
        public LeaveDayPart StartDateSlot { get; set; }
        public DateOnly EndDate { get; set; }
        public LeaveDayPart EndDateSlot { get; set; }
        public decimal TotalLeaveDays { get; set; }
        public required string Reason { get; set; }
        public  string? RejectReason { get; set; }
        public int LeaveId { get; set; }

    }
}