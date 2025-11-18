using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.OfficialDetails
{
    public class BankDetailsRequestDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string AccountNo { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string IFSCCode { get; set; }
        public string BranchName { get; set; }
        public bool IsActive { get; set; }
    }
}
