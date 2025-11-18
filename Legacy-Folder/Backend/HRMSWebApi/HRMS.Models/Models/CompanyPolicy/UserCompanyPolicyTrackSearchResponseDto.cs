namespace HRMS.Models.Models.CompanyPolicy
{
    public class UserCompanyPolicyTrackSearchResponseDto
    {
        public UserCompanyPolicyTrackSearchResponseDto()
        {
            CompanyPolicyTrackList = new List<UserCompanyPolicyTrackResponseDto>();
        }
        public IEnumerable<UserCompanyPolicyTrackResponseDto> CompanyPolicyTrackList { get; set; }
        public int TotalRecords { get; set; }
    }
}