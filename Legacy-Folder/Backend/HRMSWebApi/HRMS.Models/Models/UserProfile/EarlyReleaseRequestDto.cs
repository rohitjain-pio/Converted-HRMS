using HRMS.Domain.Enums;
using System.Text.Json.Serialization;

namespace HRMS.Models.Models.UserProfile
{
    public class EarlyReleaseRequestDto
    {
        public int ResignationId { get; set; }
        public DateOnly EarlyReleaseDate { get; set; }
        [JsonIgnore]
        public EarlyReleaseStatus? EarlyReleaseStatus { get; set; }
        [JsonIgnore]
         public string? CreatedBy { get; set; }
    }
}
