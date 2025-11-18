using HRMS.Models;
using HRMS.Models.Models.Dashboard;

namespace HRMS.Application.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<ApiResponseModel<IEnumerable<BirthdayResponseDto>>> GetEmployeesBirthdayList();
        Task<ApiResponseModel<EmployeesCountResponseDto>> GetEmployeesCount(DashboardRequestDto request);
        Task<ApiResponseModel<IEnumerable<PublishedCompanyPolicyResponseDto>>> GetPublishedCompanyPolicies(DashboardRequestDto request);
        Task<ApiResponseModel<IEnumerable<WorkAnniversaryResponseDto>>> GetEmployeesWorkAnniversaryList();
        Task<ApiResponseModel<HolidayResponseDto>> GetHolidayList();
        Task<ApiResponseModel<HolidayResponseDto>> GetUpcomingHolidayList();
        Task<ApiResponseModel<List<UpComingEventResponseDto>>> GetUpComingEventsList();
    }
}
