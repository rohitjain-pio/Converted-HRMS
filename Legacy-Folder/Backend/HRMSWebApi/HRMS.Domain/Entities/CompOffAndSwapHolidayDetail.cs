using HRMS.Domain.Enums;


namespace HRMS.Domain.Entities
{
    public class CompOffAndSwapHolidayDetail:BaseEntity
    {
        public long EmployeeId { get; set; }
        public DateOnly WorkingDate { get; set; }  
        public DateOnly? LeaveDate { get; set; }
        public string? LeaveDateLabel { get; set; }
        public string? WorkingDateLabel { get; set; }
        public string? Reason { get; set; }  
        public LeaveStatus Status { get; set; }
        public string? RejectReason { get; set; }   
        public RequestType Type { get; set; }
        public decimal? NumberOfDays { get; set; }

    }



}
