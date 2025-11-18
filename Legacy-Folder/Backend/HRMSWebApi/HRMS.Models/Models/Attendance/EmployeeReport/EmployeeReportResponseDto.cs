using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.EmployeeReport
{
    public class EmployeeReportResponseDto
    {
        public List<EmployeeReportDto>? EmployeeReports { get; set; } 
       public int TotalRecords{ get; set; }

    }
}