using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class CompOffAndSwapHolidayResponseDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public DateOnly WorkingDate { get; set; }
        public DateOnly? LeaveDate { get; set; }
        public string? LeaveDateLabel { get; set; }
        public string? WorkingDateLabel { get; set; }
        public decimal? NumberOfDays { get; set; }
        public string? Reason { get; set; }
        public LeaveStatus Status { get; set; }
        public string? RejectReason { get; set; }
        public RequestType RequestType { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string? CreatedBy { get; set; }
    }
}


