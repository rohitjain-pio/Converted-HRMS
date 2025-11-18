using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Services.Interfaces
{
    public interface IProfessionalReferenceService
    {
        Task<ApiResponseModel<CrudResult>> AddProfessionalReference(List<ProfessionalReferenceRequestDto> professionalReference);
        Task<ApiResponseModel<CrudResult>> DeleteProfessionalReference(long id);
        Task<ApiResponseModel<CrudResult>> UpdateProfessionalReference(ProfessionalReferenceRequestDto request);
        Task<ApiResponseModel<ProfessionalReferenceResponseDto>> GetProfessionalReference(long id);
    }
}