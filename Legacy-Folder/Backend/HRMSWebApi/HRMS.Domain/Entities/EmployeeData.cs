using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class EmployeeData : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileOriginalName { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public DateOnly? DOB { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string AlternatePhone { get; set; } = string.Empty;
        public string EmergencyContactPerson { get; set; } = string.Empty;
        public string EmergencyContactNo { get; set; } = string.Empty;
        public string PersonalEmail { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public MaritalStatus MaritalStatus { get; set; }
        public string Interest { get; set; } = string.Empty; 
        public string PANNumber { get; set; } = string.Empty;
        public string PFNumber { get; set; } = string.Empty;
        public string AdharNumber { get; set; }
        public string ESINo { get; set; } = string.Empty;
        public bool HasESI { get; set; }
        public bool HasPF { get; set; }
        public string UANNo { get; set; } = string.Empty;
        public DateOnly? PassportExpiry { get; set; } 
        public string PassportNo { get; set; } = string.Empty;
        public DateOnly? PFDate { get; set; }
        public string EmployeeCode { get; set; }
        public int? Status { get; set; }
        public string EmployeeStatus { get; set; }


    }
}
