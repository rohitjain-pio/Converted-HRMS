using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class AddressRequestDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public int StateId { get; set; }
        public int CountryId { get; set; }
        public long CityId { get; set; }
        public string Line1 { get; set; } = string.Empty;
        public string Line2 { get; set; } = string.Empty;
        public string? Pincode { get; set; }
    }
}
