using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.AttendanceConfiguration
{
    public class AttendanceConfigRequestDto
    {
        public long EmployeeId { get; set; }
        public bool IsManualAttendance { get; set; }

    }
}