using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class AccrualsUtilizedResponseDto
    {

        
       
        public int EmployeeId { get; set; }
        public string Description { get; set; }
        public Decimal ClosingBalance { get; set; }
        public DateOnly Date { get; set; }
        public Decimal Accrued { get; set; }
        public Decimal UtilizedOrRejected { get; set; }
       
    }
}
