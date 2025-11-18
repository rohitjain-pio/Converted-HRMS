using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class EduDocSearchResponseDto
    {
        public EduDocSearchResponseDto()
        {
            EduDocResponseList = new List<EduDocResponseDto>();
        }
        public IEnumerable<EduDocResponseDto> EduDocResponseList { get; set; }
        public int TotalRecords { get; set; }
    }
}
