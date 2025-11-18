using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class CompOffAndSwapResponseDto
    {
        public long Id { get; set; }
        public DateOnly WorkingDate { get; set; }
        public DateOnly? LeaveDate { get; set; }
        public string? LeaveDateLabel { get; set; }
        public string? WorkingDateLabel { get; set; }
        public string? Reason { get; set; }
        public LeaveStatus Status { get; set; }
        public string? RejectReason { get; set; }
        public RequestType RequestType { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal NumberOfDays { get; set; }
       
    }
}