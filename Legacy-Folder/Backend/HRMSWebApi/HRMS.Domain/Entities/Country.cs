namespace HRMS.Domain.Entities
{
    public class Country :BaseEntity
    {
        public string CountryName { get; set; }
        public int PhoneCode { get; set; }
        public bool IsActive { get; set; }
    }
}
