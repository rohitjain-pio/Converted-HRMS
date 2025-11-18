using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class GetLeaveRequestDto
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public int LeaveId { get; set; }
        public string ShortName { get; set; }
        public string Title { get; set; }
        public double TotalLeaveDays { get; set; }
        public string Reason { get; set; }
        public DateOnly StartDate { get; set; }
        public LeaveDayPart StartDateSlot { get; set; }
        public DateOnly EndDate { get; set; }
        public LeaveDayPart EndDateSlot { get; set; }
        public LeaveStatus Status { get; set; }  
        public decimal OpeningBalance { get; set; }
  
    }
}
