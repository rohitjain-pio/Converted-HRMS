using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Services.Interfaces
{
    public interface IKPIService
    {
        Task<ApiResponseModel<CrudResult>> AddGoal(GoalRequestDto requestDto);
        Task<ApiResponseModel<CrudResult>> DeleteGoalById(long goalId);
        Task<ApiResponseModel<KPIGoals>> GetById(long goalId);
        Task<ApiResponseModel<GetEmpListResponseDto>> GetEmployeesKPI(SearchRequestDto<GetEmpByManagerRequestDto> requestDto);
        Task<ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>> GetEmployeesByManager();
        Task<ApiResponseModel<KPIGoalsSearchResponseDto>> GetGoalList(SearchRequestDto<KPIGoalRequestDto> requestDto);
        Task<ApiResponseModel<CrudResult>> UpdateGoalAsync(GoalRequestDto request);
        Task<ApiResponseModel<IEnumerable<GetSelfRatingResponseDto>>> GetEmployeeSelfRating(long? PlanId, long? EmployeeId);
        Task<ApiResponseModel<CrudResult>> UpdateEmployeeSelfRating(UpdateEmployeeSelfRatingRequestDto requestDto);
        Task<ApiResponseModel<CrudResult>> UpdateEmployeeRatingByManager(ManagerRatingUpdateRequestDto requestDto);
        Task<ApiResponseModel<CrudResult>> SubmitKPIPlanByEmployee(long planId);
        Task<ApiResponseModel<CrudResult>> AssignGoalByManager(AssignGoalByManagerRequestDto requestDto);
        Task<ApiResponseModel<CrudResult>> SubmitKPIPlanByManager(long planId);
        Task<ApiResponseModel<IEnumerable<ManagerRatingHistoryByGoalResponseDto>>> GetManagerRatingHistoryByGoal(GetRatingHistoryRequestDto requestDto);
        Task<ApiResponseModel<IEnumerable<GetEmployeeRatingByManagerResponseDto>>> GetEmployeeRatingByManager(long EmployeeId);
    }
}