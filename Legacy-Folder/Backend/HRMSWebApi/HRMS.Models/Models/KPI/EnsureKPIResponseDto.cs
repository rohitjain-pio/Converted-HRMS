using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class EnsureKPIResponseDto
    {
        
        public long PlanId { get; set; }
        public DateOnly? LastAppraisal { get; set; }
        public DateOnly? NextAppraisal { get; set; }

    }
}
