using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using System.Text.Json.Serialization;

namespace HRMS.Models.Models.UserProfile
{
    public class PersonalDetailsResponseDto
    {
        public PersonalDetailsResponseDto() 
        {
            Address = new AddressResponseDto { };
            PermanentAddress = new PermanentAddressResponseDto { };
        }

        public long Id { get; set; }
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
        public string Email { get; set; } = string.Empty;
        public AddressResponseDto? Address { get; set; }
        public PermanentAddressResponseDto? PermanentAddress { get; set; }
        [JsonIgnore]
        public string? AddressJson { get; set; }
        [JsonIgnore]
        public string? PermanentAddressJson { get; set; }
       
    }
}
