using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Employees
{
    public class AdminExitEmployeeResponseDto

    {
        public int ResignationId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public bool FnFStatus{ get; set; }
        public string DepartmentName { get; set; }
        public DateOnly ResignationDate { get; set; }
        public DateOnly LastWorkingDay { get; set; }
        public DateOnly? EarlyReleaseDate { get; set; }
        public ResignationStatus ResignationStatus { get; set; }
        public EmployeeStatus EmployeeStatus { get; set; }
        public EmploymentStatus EmploymentStatus { get; set; }
        public KTStatus KTStatus { get; set; }
        public bool ExitInterviewStatus { get; set; }
        public EarlyReleaseStatus EarlyReleaseStatus { get; set; }
        public bool ITNoDue { get; set; }
        public int JobType { get; set; }
        public bool AccountsNoDue { get; set; }
        public string ReportingManagerName { get; set; }
        public string RejectEarlyReleaseReason { get; set; } = string.Empty;
        public string RejectResignationReason { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public int? BranchId { get; set; }

    }
}
