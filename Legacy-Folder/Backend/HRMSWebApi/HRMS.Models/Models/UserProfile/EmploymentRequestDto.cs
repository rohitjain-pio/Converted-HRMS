using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class EmploymentRequestDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string Email { get; set; } = string.Empty;
        public DateOnly? JoiningDate { get; set; }
        public BranchLocation BranchId { get; set; }
        public long TeamId { get; set; }
        public string Designation { get; set; } = string.Empty;
        public long? ReportingManagerId { get; set; }
        public string? ReportingManagerName { get; set; }
        public EmploymentStatus? EmploymentStatus { get; set; }
        public EmployeeStatus? EmployeeStatus { get; set; }
        public Roles RoleId { get; set; }
        public string? LinkedInUrl { get; set; }
        public BackgroundVerificationstatus? BackgroundVerificationstatus { get; set; }
        public bool? CriminalVerification { get; set; }
        public int DepartmentId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public int TotalExperienceYear { get; set; }
        public int TotalExperienceMonth { get; set; }
        public int RelevantExperienceYear { get; set; }
        public int RelevantExperienceMonth { get; set; }
        public JobType? JobType { get; set; }
        public bool isProbExtended { get; set; } = false;
        public int ProbExtendedWeeks { get; set; }
        public bool isConfirmed { get; set; }
        public ProbMonths ProbationMonths { get; set; }
        public DateOnly? ConfirmationDate { get; set; }
        public DateOnly? ExtendedConfirmationDate { get; set; }
        public int DesignationId { get; set; }
        public string? EmployeeCode { get; set; }
        public long? ImmediateManager { get; set; }
        public bool IsReportingManager { get; set; }

    }
}
