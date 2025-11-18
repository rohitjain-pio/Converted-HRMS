using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Leave;


namespace HRMS.Infrastructure.Interface
{
    public interface ILeaveManagementRepository
    {
        Task<IEnumerable<LeaveTypeResponseDto?>> GetEmployeeLevesAsync();
        Task<IEnumerable<EmployeeLeaveResponseDto>> GetEmployeeLevesByIdAsync(long id);
        Task<bool> UpdateLeaveBalanceAsync(EmployeeLeave request);
        Task<AccrualUtilizedLeave?> GetEmployeeLeaveBalanceAsync(int employeeId, int leaveId);
        Task<int> ApplyLeaveAsync(EmployeeLeaveApplyRequestDto request, decimal updatedBalance, string createdBy);
        Task<GetAppliedLeavesTotalRecordsDto> GetFilteredAppliedLeavesAsync(SearchRequestDto<AppliedLeaveSearchRequestDto> request);
        Task<AccrualsUtilizedListResponseDto> GetAccrualsUtilizedByIdAsync(int id, SearchRequestDto<AccrualLeaveSearchRequestDto> requestDto);
        Task<LeaveCalendarResonseDto> GetMonthlyLeaveCalendarAsync(Roles roleId, LeaveCalendarSearchRequestDto request);
        Task<EmpLeaveBalanceListResponseDto> GetLeaveBalanceByIdAsync(int id);
        Task<LeaveHistoryTotalRecordsResponseDto> GetLeaveHistoryByEmployeeIdAsync(long employeeId, SearchRequestDto<LeaveHistoryFilterDto> request);

        Task<EmployeeLeaveDetailResponseDto?> GetEmpLeaveDetailByIdAsync(int id);
        Task<GetAllLeaveBalanceResponseDto?> GetLeaveBalanceAsync(long employeeId, int leaveId);
        Task<int> MonthlyUpdateLeaveBalance(LeaveEnum leaveType, float credit, float carryOverLimit, int carryOverMonth, DateOnly selectedDate, bool? testing = false);
        Task<bool> IsReportingManagerExistAsync(long id);
        Task<bool> ApproveOrRejectLeaveAndInsertAccrualAsync(LeaveApprovalDto request, string modifiedBy);
        Task<Dictionary<string, int>> GetEmployeeCodeIdMapping();
        Task<int> InsertEmployeeLeavesAsync(List<EmployeeLeave> leaveList);
        Task<LeaveRequestListResponseDto> GetEmployeeLeaveRequestAsync(Roles roleId, int? SessionUserId, SearchRequestDto<GetLeaveRequestSearchRequestDto> requestDto);
        Task<int> GetAcceptedSwapsCountAsync(long employeeId, int year);
        Task<int> ApplySwapHolidayAsync(CompOffAndSwapHolidayDetail request);
        Task<CompOffAndSwapHolidayListResponseDto?> GetCompOffAndSwapHolidayDetailsAsync(Roles roles, long? sessionUserId, SearchRequestDto<CompOffAndSwapHolidaySearchRequestDto> requestDto);
        Task<int> ApplyCompOffAsync(CompOffAndSwapHolidayDetail CompOffReq);
        Task<bool> ApproveOrRejectCompOffAsync(CompOffAndSwapHolidayDetail request);
        Task<bool> ApproveOrRejectSwapAsync(CompOffAndSwapHolidayDetail compOffAndSwapHoliday);
        Task<IEnumerable<CompOffAndSwapResponseDto?>> GetAllAdjustedLeaveByEmployeeAsync(long employeeId);
        Task<IEnumerable<SwapHolidayDto>> GetAcceptedSwapHolidaysAsync(long employeeId);
        Task<int?> CompOffExpire();
    }
}
