namespace HRMS.Domain.Entities
{
    public class State :BaseEntity
    {
        public long CountryId { get; set; }
        public string StateName { get; set; } = string.Empty; 
        public bool IsActive { get; set; }
    }
}
