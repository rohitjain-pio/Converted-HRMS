using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class AppliedLeave : BaseEntity
    {
     
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public long? ReportingManagerId { get; set; }
        public LeaveStatus Status { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? RejectReason { get; set; }
        public DateOnly StartDate { get; set; }
        public byte StartDateSlot { get; set; }
        public DateOnly EndDate { get; set; }
        public byte EndDateSlot { get; set; }
        public decimal TotalLeaveDays { get; set; }
        public string? AttachmentPath { get; set; }
   
    }
 
}