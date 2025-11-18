using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class GetEmpByManagerRequestDto
    {
        public string? EmployeeName { get; set; } = null;
        public string? EmployeeCode { get; set; } = null;
        public DateOnly? AppraisalDateFrom { get; set; } = null;
        public DateOnly? AppraisalDateTo { get; set; } = null;
        public DateOnly? ReviewDateFrom { get; set; } = null;
        public DateOnly? ReviewDateTo { get; set; } = null;
        public int? StatusFilter { get; set; }


        
    }
}
