using HRMS.Domain.Enums;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using HRMS.Models.Models.Employees;

namespace HRMS.Application.Services.Interfaces
{
    public interface IExitEmployeeService
    {
        Task<ApiResponseModel<CrudResult>> AddResignation(ResignationRequestDto request);
        Task<ApiResponseModel<ResignationResponseDto>> GetResignationById(int id);
        Task<ApiResponseModel<ResignationExistResponseDto>> GetResignationExitData(int id);
        Task<ApiResponseModel<CrudResult>> RevokeResignation(int resignationId);
        Task<ApiResponseModel<CrudResult>> RequestEarlyReleaseAsync(EarlyReleaseRequestDto request);
       
        Task<ApiResponseModel<IsResignationExistResponseDTO?>> IsResignationExist(int id);
    }
}
