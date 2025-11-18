using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Employees
{
    public class EmployeeSearchResponseDto
    {
        public EmployeeSearchResponseDto()
        {
            EmployeeList = new List<EmployeeResponseDto>();
        }
        public IEnumerable<EmployeeResponseDto> EmployeeList { get; set; }
        public int TotalRecords { get; set; }
    }
}
