using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.OfficialDetails
{
    public class OfficialDetailsResponseDto
    {
        public int EmployeeId { get; set; }
        public string PANNumber { get; set; }
        public string PFNumber { get; set; }
        public string AdharNumber { get; set; }
        public string ESINo { get; set; }
        public bool HasESI { get; set; }
        public bool HasPF { get; set; }
        public string UANNo { get; set; }
        public string BankName { get; set; }
        public string AccountNo { get; set; }
        public string IFSCCode { get; set; }
        public string BranchName { get; set; }
        public DateTime? PassportExpiry { get; set; }
        public DateTime? PFDate { get; set; }
        public string PassportNo { get; set; }
    
    }
}
