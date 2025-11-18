using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class CronLog : BaseEntity
    {
        public CronType? TypeId { get; set; }
        public string? RequestId { get; set; }
        public DateTime? StartedAt {  get; set; }
        public DateTime? CompletedAt {  get; set; }
        public string? Payload { get; set; }
    }
}
