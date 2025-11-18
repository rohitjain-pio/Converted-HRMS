namespace HRMS.Domain.Entities
{
    public class City : BaseEntity
    {
        public int StateId { get; set; }
        public string CityName { get; set; } = string.Empty;
        public bool IsActive { get; set; }

    }
}
