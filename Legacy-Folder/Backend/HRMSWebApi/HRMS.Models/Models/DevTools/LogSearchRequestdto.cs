namespace HRMS.Models.Models.Log
{
    public class LogSearchRequestDto
    {
        public long? Id { get; set; }
        public string? Message { get; set; }
        public string? RequestId { get; set; }
        public string? Level { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }
}
