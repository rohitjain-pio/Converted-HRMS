using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class EduDocResponseDto
    {
        public long Id { get; set; }
        public long QualificationId { get; set; }
        public string QualificationName { get; set; } = string.Empty;
        public string CollegeUniversity { get; set; } = string.Empty;
        public decimal AggregatePercentage { get; set; }
        public string StartYear { get; set; } = string.Empty;
        public string EndYear { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileOriginalName { get; set; } = string.Empty;
        public string DegreeName { get; set; } = string.Empty;
    }
}
