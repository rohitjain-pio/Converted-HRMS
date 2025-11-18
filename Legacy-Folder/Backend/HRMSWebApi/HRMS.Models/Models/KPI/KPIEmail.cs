using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class KPIEmail
    {
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public required string LastName { get; set; }
        public required string ReportingManagerName { get; set; }
        public DateTime  ReviewDate{ get; set; }
    }
}