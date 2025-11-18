namespace HRMS.Domain.Entities
{
    public class PermanentAddressResponseDto
    {
         public int Id { get; set; }
        public int StateId { get; set; }
        public int CountryId { get; set; }
        public string CountryName { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public string CityName { get; set; } = string.Empty;
        public long CityId { get; set; }
        public string Line1 { get; set; } = string.Empty;
        public string Line2 { get; set; } = string.Empty;
        public int AddressType { get; set; }
        public string Pincode { get; set; }
    }
}
