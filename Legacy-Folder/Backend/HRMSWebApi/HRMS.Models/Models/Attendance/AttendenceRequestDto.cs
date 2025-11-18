using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Attendance
{
    public class AttendanceRequestDto
    {
        public long? Id { get; set; }
        public string Date { get; set; }
        public string? StartTime { get; set; }
         public string? EndTime { get; set; }
        public string? Day { get; set; }
       public string? AttendanceType { get; set; }
        public string? TotalHours { get; set; }
        public List<AttendanceAuditDto>? Audit { get; set; }
        public string? Location { get; set; } 
    }
}