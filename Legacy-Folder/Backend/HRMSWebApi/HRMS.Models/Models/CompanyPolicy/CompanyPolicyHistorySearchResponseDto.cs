namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicyHistorySearchResponseDto
    {
        public CompanyPolicyHistorySearchResponseDto() 
        {
            companyPolicyHistoryResponseDto = new List<CompanyPolicyHistoryResponseDto>();
        } 

        public IEnumerable<CompanyPolicyHistoryResponseDto> companyPolicyHistoryResponseDto { get; set; } 
        public long TotalRecords { get; set; } 
    }
}
