using HRMS.Domain.Enums;

public class ResignationExistResponseDto
{
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName{ get; set; }
        public string Reason { get; set; }
        public string Department { get; set; }
        public string ReportingManager { get; set; }
        public DateOnly LastWorkingDay { get; set; }
        public bool IsActive { get; set; }
        public ResignationStatus Status { get; set; }
        public DateOnly? EarlyReleaseDate { get; set; }
        public EarlyReleaseStatus? EarlyReleaseStatus { get; set; }
        public string RejectResignationReason { get; set; } = string.Empty;
        public string RejectEarlyReleaseReason { get; set; } = string.Empty;
        public DateOnly ResignationDate { get; set; }
}