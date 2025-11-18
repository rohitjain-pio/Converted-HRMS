using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class GetEmpResponseDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public DateOnly? LastAppraisal { get; set; }
        public DateOnly? NextAppraisal { get; set; }
        public long PlanId { get; set; }
    }
}
