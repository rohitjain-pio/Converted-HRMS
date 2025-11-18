using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class DesignationSearchResponseDto
    {
        public DesignationSearchResponseDto()
        {
            DesignationList = new List<DesignationResponseDto>();
        }
        public IEnumerable<DesignationResponseDto> DesignationList { get; set; }
        public int TotalRecords { get; set; }
    }
}
