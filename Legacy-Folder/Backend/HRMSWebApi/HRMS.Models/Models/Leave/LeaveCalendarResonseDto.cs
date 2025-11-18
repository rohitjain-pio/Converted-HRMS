using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{

    public class DailyLeaveStatusDto
    {
        public DateTime Date { get; set; }
        public int PendingCount { get; set; }
        public int ApprovedCount { get; set; }
        public string EmployeeName { get; set; }
        public string Department { get; set; }
        public string LeaveName { get; set; }
    }

    public class LeaveCalendarResonseDto
    {
        public List<DailyLeaveStatusDto> DailyStatuses { get; set; } = new();
    }

}
