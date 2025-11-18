using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class GetEmpListResponseDto
    {
        public int TotalRecords { get; set; }
        public List<EmployeeByManagerResponse> GoalList { get; set; } = new List<EmployeeByManagerResponse>();

            
    }
}
