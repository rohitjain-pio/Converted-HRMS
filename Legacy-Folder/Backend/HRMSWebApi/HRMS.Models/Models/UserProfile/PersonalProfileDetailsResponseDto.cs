using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using System.Text.Json.Serialization;

namespace HRMS.Models.Models.UserProfile
{
    public class PersonalProfileDetailsResponseDto
    {
         
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty; 
        public string LastName { get; set; } = string.Empty; 
        public string FileName { get; set; } = string.Empty; 
       
    }
}
