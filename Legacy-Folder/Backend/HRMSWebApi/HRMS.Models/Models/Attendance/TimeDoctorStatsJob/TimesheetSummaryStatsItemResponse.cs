using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Attendance.TimeDoctorStatsJob
{
    public class TimesheetSummaryStatsItemResponse
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string UserId { get; set; }
        public List<DateTime> Date { get; set; }
        public int Total { get; set; }
    }
}
