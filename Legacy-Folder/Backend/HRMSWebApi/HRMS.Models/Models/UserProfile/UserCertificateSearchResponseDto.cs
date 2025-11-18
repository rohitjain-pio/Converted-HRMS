using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class UserCertificateSearchResponseDto
    {
        public UserCertificateSearchResponseDto()
        {
            UserCertificateResponseList = new List<UserCertificateResponseDto>();
        }
        public IEnumerable<UserCertificateResponseDto> UserCertificateResponseList { get; set; }
        public int TotalRecords { get; set; }
    }
}

