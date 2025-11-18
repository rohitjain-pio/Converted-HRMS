using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Services.Interfaces
{
    public interface IEducationalDetailService
    {
        Task<ApiResponseModel<CrudResult>> AddEducationalDetails(UserQualificationInfoRequestDto userQualificationRequest);
        Task<ApiResponseModel<CrudResult>> EditEducationalDetails(UserQualificationInfoRequestDto userQualificationRequest);
        Task<ApiResponseModel<EduDocResponseDto>> GetEducationalDetailsById(long id);
        Task<ApiResponseModel<UserQualificationResponseDto>> DeleteEducationalDetails(long id);
        Task<ApiResponseModel<EduDocSearchResponseDto>> GetEducationalDocuments(SearchRequestDto<EduDocSearchRequestDto> requestDto);
    }
}