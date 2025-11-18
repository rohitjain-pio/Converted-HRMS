using HRMS.Domain.Enums;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;

namespace HRMS.Application.Services.Interfaces
{
    public interface INomineeService
    {
        Task<ApiResponseModel<CrudResult>> AddNominee(NomineeRequestDto request);
        Task<ApiResponseModel<CrudResult>> UpdateNominee(NomineeRequestDto request);
        Task<ApiResponseModel<CrudResult>> DeleteNominee(long id);
        Task<ApiResponseModel<NomineeSearchResponseDto>> GetNomineeList(SearchRequestDto<NomineeSearchRequestDto> requestDto);
        Task<ApiResponseModel<NomineeResponseDto>> GetNomineeById(long id);
        Task<ApiResponseModel<byte[]?>> DownloadNomineeDocument(string containerName, string filename);
    }
}
