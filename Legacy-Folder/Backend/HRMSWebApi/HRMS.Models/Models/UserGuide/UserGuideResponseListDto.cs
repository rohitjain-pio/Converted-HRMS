using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserGuide
{
    public class UserGuideResponseListDto
    {
        public List<UserGuideResponseDto>? UserGuideList { get; set; }
        public int TotalRecords { get; set; }
    }
}