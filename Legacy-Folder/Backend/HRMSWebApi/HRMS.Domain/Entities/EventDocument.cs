namespace HRMS.Domain.Entities
{
    public class EventDocument : BaseEntity
    {
        public long EventId { get; set; }
        public string FileName {  get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
    }
}
