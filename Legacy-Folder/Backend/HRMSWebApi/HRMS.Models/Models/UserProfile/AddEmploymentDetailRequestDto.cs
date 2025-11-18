using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class AddEmploymentDetailRequestDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;

        [JsonIgnore]
        public long? EmployeeId { get; set; }

        public string? EmployeeCode { get; set; } // confusion
        public string Email { get; set; } = string.Empty;
        public DateOnly JoiningDate { get; set; }
        public BranchLocation BranchId { get; set; }
        public long TeamId { get; set; }
        public string Designation { get; set; } = string.Empty;
        public long? ReportingManagerId { get; set; }
        // public string? ReportingManagerName { get; set; }
        public EmploymentStatus EmploymentStatus { get; set; }
        [JsonIgnore]
        public EmployeeStatus EmployeeStatus { get; set; }
        [JsonIgnore]
        public Roles RoleId { get; set; }
        public string? LinkedInUrl { get; set; }
        public BackgroundVerificationstatus BackgroundVerificationstatus { get; set; }
        public bool CriminalVerification { get; set; }
        public int DepartmentId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public int TotalExperienceYear { get; set; }
        public int TotalExperienceMonth { get; set; }
        public int RelevantExperienceYear { get; set; }
        public int RelevantExperienceMonth { get; set; }
        public JobType JobType { get; set; }
        public bool isProbExtended { get; set; } = false;
        public int ProbExtendedWeeks { get; set; }
        public bool isConfirmed { get; set; }
        public ProbMonths ProbationMonths { get; set; }
        [JsonIgnore]
        public DateOnly? ConfirmationDate { get; set; }
        public int DesignationId { get; set; }
        public long? ImmediateManager  { get; set; }
    }
}
