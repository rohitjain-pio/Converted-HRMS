using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;

namespace HRMS.Application.Services.Interfaces
{
    public interface ICompanyPolicyService
    {
        Task<ApiResponseModel<CompanyPolicyResponseDto>> Add(CompanyPolicyRequestDto companyPolicyRequestDto);
        Task<ApiResponseModel<CompanyPolicyResponseDto>> GetCompanyPolicyById(long id);
        Task<ApiResponseModel<CompanyPolicySearchResponseDto>> GetCompanyPolicies(SearchRequestDto<CompanyPolicySearchRequestDto> requestDto);
        Task<ApiResponseModel<IEnumerable<PolicyStatusResponseDto>>> GetPolicyStatus();
        Task<ApiResponseModel<IEnumerable<CompanyPolicyDocCategoryResponseDto>>> GetDocumentCategory();
        Task<ApiResponseModel<CompanyPolicyResponseDto>> Edit(CompanyPolicyRequestDto companyPolicyRequestDto);
        Task<ApiResponseModel<CompanyPolicyResponseDto>> Delete(long id);
        Task<ApiResponseModel<CompanyPolicyHistorySearchResponseDto>> GetCompanyPolicyHistoryListById(SearchRequestDto<CompanyPolicyHistorySearchRequestDto> policyHistorySearchRequestDto);
        Task<ApiResponseModel<DownloadDocResponseDto>> DownloadPolicyDocument(UserCompanyPolicyTrackRequestDto request);
        Task<ApiResponseModel<UserCompanyPolicyTrackSearchResponseDto>> GetUserCompanyPolicyTrack(SearchRequestDto<UserCompanyPolicyTrackSearchRequestDto> requestDto);
    }
}
