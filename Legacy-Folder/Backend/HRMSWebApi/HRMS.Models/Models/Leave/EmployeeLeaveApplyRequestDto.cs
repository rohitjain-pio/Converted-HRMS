using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class EmployeeLeaveApplyRequestDto
    {
        public int EmployeeId { get; set; }
        public int LeaveId { get; set; }

        public DateOnly StartDate { get; set; }

        public LeaveDayPart StartDateSlot { get; set; }

        public DateOnly EndDate { get; set; }

        public LeaveDayPart EndDateSlot { get; set; }

        public string Reason { get; set; }

        public string? Attachment { get; set; } 
        public decimal TotalLeaveDays { get; set; }
    }
   
}
