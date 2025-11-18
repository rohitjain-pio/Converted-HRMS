using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class Address
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string Line1 { get; set; } = string.Empty;
        public string Line2 { get; set; } = string.Empty; 
        public long CityId { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public AddressType AddressType { get; set; }
        public string Pincode { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
    }
}
