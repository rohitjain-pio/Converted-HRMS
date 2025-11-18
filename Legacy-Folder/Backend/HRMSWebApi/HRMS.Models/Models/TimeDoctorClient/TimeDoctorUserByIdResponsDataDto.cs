using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.TimeDoctorClient
{
    public class TimeDoctorUserByIdResponsDataDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public bool? EmailConfirmed { get; set; }
        public bool? HasPassword { get; set; }
        public string? CreatedAt { get; set; }
        public string? LastSeenGlobal { get; set; }
        public string? Timezone { get; set; }
        public string? ProfileTimezone { get; set; }
        public bool? IsInteractiveAutoTracking { get; set; }
    }
}
