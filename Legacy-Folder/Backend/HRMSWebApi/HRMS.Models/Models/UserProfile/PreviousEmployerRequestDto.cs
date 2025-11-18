using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class PreviousEmployerRequestDto
    {
        public long  Id { get; set; }
        public long EmployeeId { get; set; }
        public string EmployerName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}
