namespace HRMS.Domain.Entities
{
    public class EventCategory : BaseEntity
    {
        public string Category { get; set; }
        public bool IsActive { get; set; }

    }
}
