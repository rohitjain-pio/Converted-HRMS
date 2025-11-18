namespace HRMS.Domain.Entities
{

   public class AttendanceAudit:BaseEntity
    {
        public long? Id { get; set; }
        public long? AttendanceId { get; set; }
        public string Action { get; set; }
        public string Time { get; set; }
        public string? Comment { get; set; } 
        public string? Reason { get; set; }  
    }

    public class Attendance:BaseEntity
    {
        public long? Id { get; set; }
        public string Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string? Day { get; set; }
        public string? AttendanceType { get; set; }
        public string? TotalHours { get; set; }
        public List<AttendanceAudit>? Audit { get; set; }
        public string? Location { get; set; } 
        
    }
}
