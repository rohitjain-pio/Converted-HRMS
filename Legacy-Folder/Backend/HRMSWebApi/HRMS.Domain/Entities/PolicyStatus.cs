namespace HRMS.Domain.Entities
{
    public class PolicyStatus :BaseEntity
    {
        public string StatusValue { get; set; }
        public bool IsActive { get; set; }

    }
}
