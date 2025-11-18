using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Attendance
{
    public class AttendanceResponseDto
    {

        public List<AttendanceRowDto>? AttendaceReport { get; set; }
        public bool IsManualAttendance { get; set; }
        public int TotalRecords { get; set; }
        public bool IsTimedIn { get; set; } = true;
        public List<string> Dates {get;set;}
       
    }
  }