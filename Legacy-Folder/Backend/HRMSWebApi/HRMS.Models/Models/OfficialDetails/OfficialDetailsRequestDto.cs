using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.OfficialDetails
{
    public class OfficialDetailsRequestDto
    {
        public int Id { get; set; }
        public string PANNumber { get; set; }
        public string AdharNumber { get; set; }
        public string? PFNumber { get; set; }
        public string? UANNo { get; set; }
        public string? ESINo { get; set; }
        public bool HasESI { get; set; }
        public bool HasPF { get; set; }
        public DateTime? PassportExpiry { get; set; }
        public string? PassportNo { get; set; }
        public DateTime? PFDate { get; set; }
        public BankDetailsRequestDto BankDetails { get; set; }
    }
}
