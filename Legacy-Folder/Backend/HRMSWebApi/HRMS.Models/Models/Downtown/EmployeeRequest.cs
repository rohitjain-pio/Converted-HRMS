using HRMS.Domain;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Downtown
{
    public class EmployeeRequest :BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileOriginalName { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public EmployeeStatusType Status { get; set; }
        public string? DOB { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string AlternatePhone { get; set; } = string.Empty;
        public string EmergencyContactPerson { get; set; } = string.Empty;
        public string EmergencyContactNo { get; set; } = string.Empty;
        public string PersonalEmail { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;        
        public string Interest { get; set; } = string.Empty;
    }
}
