using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.TimeDoctorClient
{
    public class TimeDoctorUserByEmailResponseDataDto
    {
        public string? Id { get; set; }
        public bool? IsInteractiveAutoTracking { get; set; }
        public string? Email { get; set; }
        public bool? EmailConfirmed { get; set; }
        public string? CreatedAt { get; set; }
        public string? Timezone { get; set; }
        public string? ProfileTimezone { get; set; }
        public string? Name { get; set; }
    }
}
