namespace HRMS.Domain.Entities
{
    public class Logging : BaseEntity
    {
        public string? Message { get; set; }
        public string? MessageTemplate { get; set; }
        public string? Level { get; set; }
        public DateTime TimeStamp { get; set; }
        public string? Exception { get; set; }
        public string? RequestId { get; set; }
        public string? LogEvent { get; set; }     
    }
}
