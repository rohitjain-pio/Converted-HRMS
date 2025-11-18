using HRMS.Domain.Entities;
using HRMS.Models.Models.Dashboard;
using HRMS.Models.Models.Event;

namespace HRMS.Infrastructure.Interface
{
    public interface IDashboardRespository
    {
        Task<IEnumerable<EmployeeData?>> GetEmployeesBirthdayList();
        Task<EmployeesCountResponseDto> GetEmployeesCount(DashboardRequestDto request);
        Task<IEnumerable<PublishedCompanyPolicyResponseDto?>> GetPublishedCompanyPolicies(DashboardRequestDto request);
        Task<IEnumerable<WorkAnniversaryResponseDto>> GetEmployeeWorkAnniversaryList();
        Task<IEnumerable<UpComingEventResponseDto>> GetUpComingEventsListAsync();
    }
}
