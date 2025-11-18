using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Employees
{
    public class EmployeeListSearchResponseDto
    {
        public EmployeeListSearchResponseDto()
        {
            EmployeeList = new List<EmployeeListResponseDto>();
        }
        public IEnumerable<EmployeeListResponseDto> EmployeeList { get; set; }
        public int TotalRecords { get; set; }
    }
}
