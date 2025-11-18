using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class NomineeSearchRequestDto
    {
        public long EmployeeId { get; set; }
        public int RelationshipId { get; set; }
        public string? NomineeName { get; set; } = default!;
        public string Others { get; set; } = string.Empty;
    }
}
