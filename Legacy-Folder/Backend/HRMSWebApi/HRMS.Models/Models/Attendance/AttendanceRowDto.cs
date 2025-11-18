using System;
using System.Collections.Generic;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Attendance
{
    public class AttendanceAuditDto
    {
        public string Action { get; set; }
        public string Time { get; set; }
        public string? Comment { get; set; } 
        public string? Reason { get; set; }  
    }

    public class AttendanceRowDto
    {
        public long? Id { get; set; }
        public string Date { get; set; }
        public string? StartTime { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? ModifiedBy { get; set; }
        public string? EndTime { get; set; }
        public string? Day { get; set; }
       public string? AttendanceType { get; set; }
        public string? TotalHours { get; set; }
        public List<AttendanceAuditDto>? Audit { get; set; }
        public string? Location { get; set; } 
        
    }
}