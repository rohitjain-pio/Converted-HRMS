namespace HRMS.Domain.Entities
{
    public class LeaveType:BaseEntity
    {
        public long? Id { get; set; }
        public string? Title { get; set; }
        public string? ShortName { get; set; }
    }
}
