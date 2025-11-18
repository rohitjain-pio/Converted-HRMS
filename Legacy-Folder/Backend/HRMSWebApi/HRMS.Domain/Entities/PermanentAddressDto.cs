namespace HRMS.Domain.Entities
{
    public class PermanentAddressDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string Line1 { get; set; } = string.Empty;
        public string Line2 { get; set; } = string.Empty;
        public long CityId { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public string Pincode { get; set; }

    }
}
