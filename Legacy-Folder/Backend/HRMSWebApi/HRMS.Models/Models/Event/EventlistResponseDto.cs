using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Event
{
    public class EventlistResponseDto
    {
        public long Id { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string EmployeeGroup { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }       
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;     
        public string Venue { get; set; } = string.Empty;
        public String BannerFileName { get; set; } = string.Empty;
    }
}
