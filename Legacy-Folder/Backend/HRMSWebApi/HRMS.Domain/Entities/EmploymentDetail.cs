using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class EmploymentDetail
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string Email { get; set; } = string.Empty;
        public DateOnly? JoiningDate { get; set; }
        public BranchLocation? BranchId { get; set; }
        public long? TeamId { get; set; }
        public string? TeamName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public long? ReportingMangerId { get; set; }
        public EmploymentStatus EmploymentStatus { get; set; }
        public EmployeeStatus EmployeeStatus { get; set; }
        public Roles RoleId { get; set; }
        public string LinkedInUrl { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int DesignationId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;

        public BackgroundVerificationstatus BackgroundVerificationstatus { get; set; }
        public bool CriminalVerification { get; set; }
        public int TotalExperienceYear { get; set; }
        public int TotalExperienceMonth { get; set; }
        public int RelevantExperienceYear { get; set; }
        public int RelevantExperienceMonth { get; set; }
        public JobType? JobType { get; set; }
        public DateOnly? ConfirmationDate { get; set; }
        public DateOnly? ExtendedConfirmationDate { get; set; }
        public bool isProbExtended { get; set; }
        public int ProbExtendedWeeks { get; set; }
        public bool isConfirmed { get; set; }
        public ProbMonths ProbationMonths { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string ReportingManagerName { get; set; } = string.Empty;
        public string ImmediateManagerName { get; set; } = string.Empty;
        public string BranchName { get; set; }
        public string? EmployeeCode { get; set; }

        public string? TimeDoctorUserId { get; set; }
        public long? ImmediateManager { get; set; }
        public bool IsReportingManager { get; set; }
    }
}
