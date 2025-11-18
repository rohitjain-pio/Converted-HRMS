using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class PreviousEmployerSearchRequestDto
    {
        public long EmployeeId { get; set; }
        public string? EmployerName { get; set; } = default!;
        public string? Designation { get; set; } = default!;
        public string? DocumentName { get; set; } = default!;
    }
}
