using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class LeaveHistoryResponseDto
    {
        public int Id { get; set; }
        public int LeaveId { get; set; }
        public string LeaveShortName { get; set; }
        public string LeaveTitle { get; set; }
        public double TotalDays { get; set; }
        public string Reason { get; set; }
        public DateOnly StartDate { get; set; }
        public LeaveDayPart StartDateSlot { get; set; }
        public DateOnly EndDate { get; set; }
        public LeaveDayPart EndDateSlot { get; set; }
        public LeaveStatus Status { get; set; } 
        
    }
}
