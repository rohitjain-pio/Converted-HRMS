using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Clients.Interfaces
{
    public interface IDownTwonClient
    {
        Task<DowntownResponse<DepartmentData>> GetDepartmentListAsync();
        Task<DowntownResponse<TeamData>> GetTeamListAsync();
        Task<DowntownResponse< HolidayData>> GetHolidayListAsync();
        Task<DowntownResponse<UpcomingHolidayData>> GetUpcomingHolidayListAsync();
        Task<DowntownResponse<DowntownEmployeeStatusData>> GetEmployeeStatusListAsync();

        Task<DowntownResponse<DowntownEmployeeData>> GetEmployeeDataListAsync();

    }
}
