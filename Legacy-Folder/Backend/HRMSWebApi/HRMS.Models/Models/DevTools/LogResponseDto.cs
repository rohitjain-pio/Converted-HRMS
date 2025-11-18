namespace HRMS.Models.Models.Log
{
    public class LogResponseDto
    {
        public long Id { get; set; }
        public string? Message { get; set; }
        public string? Level { get; set; }
        public DateTime TimeStamp { get; set; }
        public string? Exception { get; set; }
        public string? RequestId { get; set; }
        public string? LogEvent { get; set; }
    }
}
