using HRMS.Models.Models.EmployeeGroup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class NomineeSearchResponseDto
    {
        public IEnumerable<NomineeResponseDto> NomineeList { get; set; } = default!;
        public int TotalRecords { get; set; }
        public int TotalPercentage { get; set; }
    }
}
