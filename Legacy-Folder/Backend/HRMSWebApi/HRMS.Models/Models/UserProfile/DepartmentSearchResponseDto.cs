using HRMS.Models.Models.Event;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class DepartmentSearchResponseDto
    {
        public DepartmentSearchResponseDto()
        {
            DepartmentList = new List<DepartmentResponseDto>();
        }
        public IEnumerable<DepartmentResponseDto> DepartmentList { get; set; }
        public int TotalRecords { get; set; }
    }
}

