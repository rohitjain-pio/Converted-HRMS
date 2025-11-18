using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;


namespace HRMS.Infrastructure.Interface
{
    public interface ICompanyPolicyRepository : IGenericRepository<CompanyPolicy>
    {
        Task<CompanyPolicySearchResponseDto> GetCompanyPolicies(SearchRequestDto<CompanyPolicySearchRequestDto> requestDto);
        Task<IEnumerable<PolicyStatus?>> GetPolicyStatus();
        Task<IEnumerable<CompanyPolicyDocCategory>> GetCompanyPolicyDocumentCategory();
        Task<CompanyPolicyHistorySearchResponseDto?> GetPolicyHistory(SearchRequestDto<CompanyPolicyHistorySearchRequestDto> companyPolicyHistorySearch);

        Task<int> AddPolicyHistory(CompanyPolicy entity);
        Task<CompanyPolicyResponseDto?> GetPolicyDetailByIdAsync(long id);
        Task<int> AddUserCompanyPolicyTrackAsync(UserCompanyPolicyTrackRequestDto request);
        Task<int> GetCompanyPolicyTrack(long policyId, long employeeId);
        Task<int> UpdateUserCompanyPolicyTrackAsync(long id);      
        Task<UserCompanyPolicyTrackSearchResponseDto> GetUserCompanyPolicyTrackList(SearchRequestDto<UserCompanyPolicyTrackSearchRequestDto> requestDto);
        Task<CompanyPolicyFileDto?> GetCompanyPolicyFileNameById(long id);    

    }
}
