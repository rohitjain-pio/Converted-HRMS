using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.AdminExitEmployee;
using HRMS.Models.Models.Employees;

namespace HRMS.Infrastructure.Interface
{
    public interface IAdminExitEmployeeRepository
    {



        Task<ExitEmployeeListResponseDTO> GetAllResignationsAsync(SearchRequestDto<ResignationSearchRequestDto> requestDto);
        Task<AdminExitEmployeeResponseDto?> GetResignationByIdAsync(int resignationId);
        Task<String?> AdminRejectResignationAsync(AdminRejectionRequestDto requestDto, ResignationHistory resignationHistory);
        Task<String?> AdminRejectEarlyReleaseAsync(AdminRejectionRequestDto requestDto, ResignationHistory resignationHistory);
        Task<string> AdminAcceptResignationAsync(Resignation resigantioRequestDto, ResignationHistory resignationHistory);
        Task<String?> AdminAcceptEarlyReleaseAsync(AcceptEarlyReleaseRequestDto requestDto, ResignationHistory resignationHistory);
        Task<String> UpdateLastWorkingDayAsync(UpdateLastWorkingDayRequestDto requestDto);
        Task<HRClearance?> GetHRClearanceByResignationIdAsync(int resignationId);
        Task<DepartmentClearance?> GetDepartmentClearanceByResignationIdAsync(int resignationId);
        Task<bool> UpsertDepartmentClearanceAsync(DepartmentClearance departmentClearance);
        Task<bool> UpsertHRClearanceAsync(HRClearance hrClearance);

        Task<ITClearance?> GetITClearanceByResignationIdAsync(int resignationId);
        Task<bool> AddUpdateITClearanceAsync(ITClearance iTClearance);
        Task<AccountClearance?> GetAccountClearanceByResignationIdAsync(int resignationId);
        Task<bool> AddUpdateAccountClearanceAsync(AccountClearance accountClearance);

    }
}