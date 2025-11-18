using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class AppliedLeaveDto
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public DateOnly StartDate { get; set; }
        public LeaveDayPart StartDateSlot { get; set; }
        public DateOnly EndDate { get; set; }
        public LeaveDayPart EndDateSlot { get; set; }
        public decimal TotalLeaveDays { get; set; }
        public string? ReportingManagerEmail { get; set; }


    }


}
