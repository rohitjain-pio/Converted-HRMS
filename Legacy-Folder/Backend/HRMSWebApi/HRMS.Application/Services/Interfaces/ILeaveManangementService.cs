using HRMS.Models;
using HRMS.Models.Models.Leave;
using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Http;
using HRMS.Models.Models.Downtown;

namespace HRMS.Application.Services.Interfaces
{
    public interface ILeaveManangementService
    {
        Task<ApiResponseModel<IEnumerable<LeaveTypeResponseDto>>> GetEmployeeLeavesList();
        Task<ApiResponseModel<IEnumerable<EmployeeLeaveResponseDto>>> GetEmployeeLeavesById(int id);
        Task<ApiResponseModel<CrudResult>> UpdateLeaveBalance(EmployeeLeaveRequestDto request);
        Task<ApiResponseModel<CrudResult>> ApplyLeaveAsync(EmployeeLeaveApplyRequestDto request);
        Task<ApiResponseModel<GetAppliedLeavesTotalRecordsDto>> GetFilteredAppliedLeavesList(SearchRequestDto<AppliedLeaveSearchRequestDto> request);

        Task<ApiResponseModel<AccrualsUtilizedListResponseDto>> GetAccrualsUtilizedById(int id, SearchRequestDto<AccrualLeaveSearchRequestDto> requestDto);
        Task<ApiResponseModel<LeaveCalendarResonseDto>> GetMonthlyLeaveCalendarAsync(LeaveCalendarSearchRequestDto request);
        Task<ApiResponseModel<EmpLeaveBalanceListResponseDto>> GetLeaveBalanceById(int id);
        Task<ApiResponseModel<LeaveHistoryTotalRecordsResponseDto>> GetLeaveHistoryByEmployeeIdAsync(long employeeId, SearchRequestDto<LeaveHistoryFilterDto> request);

        Task<ApiResponseModel<EmployeeLeaveDetailResponseDto>> GetEmpLeaveDetailById(int id);
        Task<ApiResponseModel<GetAllLeaveBalanceResponseDto>> GetLeaveBalanceByEmployeeAndLeaveId(GetAllLeaveBalanceRequestDto requestDto);
        Task<ApiResponseModel<bool?>> IsReportingManagerExist(int id);
        Task<ApiResponseModel<CrudResult>> ApproveOrRejectLeaveAsync(LeaveApprovalDto request);
        Task<ApiResponseModel<LeaveRequestListResponseDto>> GetEmployeeLeaveRequestById(SearchRequestDto<GetLeaveRequestSearchRequestDto> requestDto); Task<ApiResponseModel<CrudResult>> ImportEmployeeLeaveExcel(IFormFile leaveExcelFile, bool importConfirmed);
        Task<ApiResponseModel<CrudResult>> ApplySwapHolidayAsync(SwapHolidayApplyRequestDto request);
        Task<ApiResponseModel<CompOffAndSwapHolidayListResponseDto>> GetCompOffAndSwapHolidayDetailsById(SearchRequestDto<CompOffAndSwapHolidaySearchRequestDto> requestDto);
        Task<ApiResponseModel<CrudResult>> ApplyCompOffAsync(CompOffRequestDto request);
        Task<ApiResponseModel<CrudResult>> ApproveOrRejectCompOffSwapHoliday(CompOffAndSwapHolidayDetailRequestDto request);
        Task<ApiResponseModel<IEnumerable<CompOffAndSwapResponseDto>>>  GetAllAdjustedLeaveByEmployeeAsync(long employeeId);
        Task<ApiResponseModel<Holidays>> GetPersonalizedHolidayListAsync(long employeeId);
    }

}