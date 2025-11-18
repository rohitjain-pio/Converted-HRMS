using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class EmploymentDetailsForDwnTwn
    {
        public string EmployeeFullName { get; set; }
        public int TotalExperienceYear { get; set; }
        public int TotalExperienceMonth { get; set; }
        public int RelevantExperienceYear { get; set; }
        public int RelevantExperienceMonth { get; set; }
        public List<EducationalDetailForDwnTwn>? EducationalDetailLst { get; set; }
        [JsonIgnore]
        public string? EducationalDetailJson { get; set; } 
        public string? FileName { get; set; }
        public List<PreviousEmployerRequestDto>? PreviousEmployerDetailLst { get; set; }
        [JsonIgnore]
        public string? PreviousEmployerDetailJson { get; set; }
    }
}
