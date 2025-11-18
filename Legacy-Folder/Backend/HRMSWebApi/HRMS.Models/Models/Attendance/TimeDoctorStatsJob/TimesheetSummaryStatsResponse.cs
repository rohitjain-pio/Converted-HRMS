using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Attendance.TimeDoctorStatsJob
{
    public class TimesheetSummaryStatsResponse
    {
        public List<List<TimesheetSummaryStatsItemResponse>> Data { get; set; }
    }
}
