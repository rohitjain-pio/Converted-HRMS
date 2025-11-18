using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class UserQualificationInfoRequestDto
    {
        public int Id { get; set; }
        public long EmployeeId { get; set; }
        public long QualificationId { get; set; }
        public string CollegeUniversity { get; set; } = string.Empty;
        public double AggregatePercentage { get; set; }
        public IFormFile? File { get; set; }
        public string DegreeName { get; set; } = string.Empty;
        public string StartYear { get; set; } = string.Empty;
        public string EndYear { get; set; } = string.Empty;
    }
}
