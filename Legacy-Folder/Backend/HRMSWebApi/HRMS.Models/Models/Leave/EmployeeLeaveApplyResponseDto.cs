using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class EmployeeLeaveApplyResponseDto
    {

        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public long ReportingManagerId { get; set; }
        public byte Status { get; set; }
        public string Reason { get; set; }
        public DateOnly StartDate { get; set; }
        public LeaveDayPart StartDateSlot { get; set; }
        public DateOnly EndDate { get; set; }
        public LeaveDayPart EndDateSlot { get; set; }
        public string? AttachmentPath { get; set; }


    }
}
