namespace HRMS.Models.Models.DevTools
{
    public class CronLogSearchRequestDto
    {
        public long? Id { get; set; }
        public DateTime? DateFrom {get;set;}
        public DateTime? DateTo {get;set;}
        public int? TypeId {get;set;}
        public string? RequestId {get;set; }
    }
}
