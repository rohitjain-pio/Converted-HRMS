using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class PersonalDetailsRequestDto
    {
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;   
        public string FatherName { get; set; } = string.Empty;
        public string? BloodGroup { get; set; }
        public Gender Gender { get; set; }
        public DateOnly DOB { get; set; }
        public string? Phone { get; set; }
        public string? AlternatePhone { get; set; }
        public string? EmergencyContactPerson { get; set; }
        public string? EmergencyContactNo { get; set; }
        public string? PersonalEmail { get; set; } = string.Empty;
        public string? Nationality { get; set; }
        public MaritalStatus MaritalStatus { get; set; }
        public string? Interest { get; set; }
        public AddressRequestDto Address { get; set; } = new AddressRequestDto();
        public PermanentAddressDto PermanentAddress { get; set; } = new PermanentAddressDto();

    }
}
