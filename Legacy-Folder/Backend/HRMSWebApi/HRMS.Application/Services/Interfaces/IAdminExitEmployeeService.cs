using HRMS.Domain.Enums;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.AdminExitEmployee;

namespace HRMS.Application.Services.Interfaces
{
    public interface IAdminExitEmployeeService
    {
        Task<ApiResponseModel<ExitEmployeeListResponseDTO>> GetResignationList(SearchRequestDto<ResignationSearchRequestDto> requestDto);
        Task<ApiResponseModel<AdminExitEmployeeResponseDto>> GetResignationById(int id);
        Task<ApiResponseModel<string>> AdminRejectRequest(AdminRejectionRequestDto requestDto);


        Task<ApiResponseModel<String>> AdminAcceptResignation(int id);
        Task<ApiResponseModel<String>> AdminAcceptEarlyRelease(AcceptEarlyReleaseRequestDto requestDto);
        Task<ApiResponseModel<string>> UpdateLastWorkingDay(UpdateLastWorkingDayRequestDto requestDto);
        Task<ApiResponseModel<HRClearanceResponseDto>> GetHRClearanceByResignationId(int resignationId);
        Task<ApiResponseModel<DepartmentClearanceResponseDto>> GetDepartmentClearanceByResignationId(int resignationId);
        Task<ApiResponseModel<CrudResult>> UpsertDepartmentClearance(DepartmentClearanceRequestDto requestDto);
        Task<ApiResponseModel<CrudResult>> UpsertHRClearance(HRClearanceRequestDto requestDto);


        Task<ApiResponseModel<ITClearanceResponseDTO>> GetITClearanceDetailByResignationId(int resignationId);
        Task<ApiResponseModel<CrudResult>> AddUpdateITClearanceById(ITClearanceRequestDTO requestDTO);
        Task<ApiResponseModel<AccountClearanceResponseDTO>> GetAccountClearanceById(int resignationId);
        Task<ApiResponseModel<CrudResult>> AddUpdateAccountClearanceById(AccountClearanceRequestDto requestDto);


    }
}
