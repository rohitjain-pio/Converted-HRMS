using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Services.Interfaces
{
    public interface IPreviousEmployerService
    {
        Task<ApiResponseModel<long>> AddPreviousEmployer(PreviousEmployerRequestDto request);
         Task<ApiResponseModel<PreviousEmployerSearchResponseDto>> GetPreviousEmployerList(SearchRequestDto<PreviousEmployerSearchRequestDto> requestDto);
         Task<ApiResponseModel<CrudResult>> DeletePreviousEmployer(long id);
         Task<ApiResponseModel<CrudResult>> UploadPreviousEmployerDocument(PreviousEmployerDocRequestDto employerDocRequestDto);
         Task<ApiResponseModel<PreviousEmployerResponseDto>> GetPreviousEmployerById(long id);
         Task<ApiResponseModel<CrudResult>> UpdatePreviousEmployer(PreviousEmployerRequestDto request);
         Task<ApiResponseModel<CrudResult>> DeletePreviousEmployerDocument(long id);
    }
}