using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Infrastructure.Interface
{

    public interface IKpiRepository
    {
        Task<int> AddGoalAsync(KPIGoals request);
        Task<int> DeleteGoalAsync(long goalId);
        Task<KPIGoals?> GetByIdAsync(long id);
        Task<KPIGoalsSearchResponseDto> GetGoalListAsync(SearchRequestDto<KPIGoalRequestDto> requestDto);
        Task<int> UpdateGoalAsync(KPIGoals goal);
        Task<KPIPlan?> GetKPIPlanByEmployeeIdAsync(long employeeId);
        Task<long> CreateKPIPlanAsync(KPIPlan kpiPlan);
        Task<int> AssignGoalToEmployeeAsync(KPIDetails detail);
        Task<GetEmpListResponseDto> GetEmployeesKPIAsync(Roles roleId, int? SessionUserId, SearchRequestDto<GetEmpByManagerRequestDto> requestDto);
        Task<IEnumerable<ReportingManagerResponseDto?>> GetEmployeesByManagerAsync(int? SessionUserId, Roles RoleId);
        Task<IEnumerable<GetSelfRatingResponseDto>> GetSelfRatingAsync(long? PlanId, long? EmployeeId);
        Task<int> UpdateSelfRatingAsync(KPIDetails kPIDetails, string quarter);
        Task<int> UpdateEmployeeRatingByManagerAsync(KPIDetails kPIDetails);
        Task<int> SubmitKPIPlanByEmployeeAsync(long planId);
        Task<KPIDetails?> GetKpiDetailAsync(long goalId, long planId);
        Task<int> UpdateKPIDetailsAsync(long planId, AssignGoalByManagerRequestDto requestDto);
        Task<IEnumerable<long>> GetAssignedEmployeeIdsAsync(long goalId);
        Task<int> RevokeGoalFromEmployeeAsync(KPIDetails detail);
        Task<int> SubmitKPIPlanByManagerAsync(long planId);
        Task<int> AddManagerRatingHistoryAsync(ManagerRatingHistory managerRatingHistory);
        Task<IEnumerable<ManagerRatingHistoryByGoalResponseDto>> GetManagerRatingHistoryByGoalAsync(GetRatingHistoryRequestDto requestDto);
        Task<IEnumerable<GetEmployeeRatingByManagerResponseDto>> GetEmployeeRatingByManagerAsync(long EmployeeId);

    }
}