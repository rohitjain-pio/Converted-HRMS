namespace HRMS.Models.Models.DevTools
{
    public class CronLogResponseDto
    {
        public string Id {get;set;}
        public int TypeId {get;set; }
        public long? LogId { get; set; }
        public string Payload {get;set;}
        public DateTime StartedAt {get;set;}
        public DateTime? CompletedAt { get; set; }
    }
}
