using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Role
{
    public class RoleSearchResponseDto
    {
        public RoleSearchResponseDto() 
        {
            RoleResponseList = new List<RoleResponseDto>();
        }
        public IEnumerable<RoleResponseDto> RoleResponseList { get; set; }

        public int TotalRecords { get; set; }
    }
}
