namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicySearchResponseDto
    {
        public CompanyPolicySearchResponseDto()
        {
            CompanyPolicyList = new List<CompanyPolicyResponseDto>();
        }
        public IEnumerable<CompanyPolicyResponseDto> CompanyPolicyList { get; set; }
        public int TotalRecords { get; set; }
    }
}
