using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class TeamSearchResponseDto
    {
        public TeamSearchResponseDto()
        {
            TeamList = new List<TeamResponseDto>();
        }
        public IEnumerable<TeamResponseDto> TeamList { get; set; }
        public int TotalRecords { get; set; }
    }
}
