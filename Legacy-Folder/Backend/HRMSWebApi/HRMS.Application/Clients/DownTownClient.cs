using HRMS.Application.Clients.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Models.Models.Downtown;

namespace HRMS.Application.Clients
{
    public class DownTownClient(HttpClient httpClient) : BaseHttpClient(httpClient), IDownTwonClient
    {
        public async Task<DowntownResponse<DepartmentData>> GetDepartmentListAsync()
        {
            var response = await Get<DowntownResponse<DepartmentData>>(ClientType.DownTownClient, ApiEndPoints.DepartmentURI);
            return response;
        }

        public async Task<DowntownResponse<DowntownEmployeeData>> GetEmployeeDataListAsync()
        {
            var response = await Get<DowntownResponse<DowntownEmployeeData>>(ClientType.DownTownClient, ApiEndPoints.EmployeeDataURI);
            return response;
        }

        public async Task<DowntownResponse<DowntownEmployeeStatusData>> GetEmployeeStatusListAsync()
        {
            var response = await Get<DowntownResponse<DowntownEmployeeStatusData>>(ClientType.DownTownClient, ApiEndPoints.EmployeeStatusURI);
            return response;
        }

        public async Task<DowntownResponse<HolidayData>> GetHolidayListAsync()
        {
            var response = await Get<DowntownResponse<HolidayData>>(ClientType.DownTownClient, ApiEndPoints.HolidaysURI);
            return response;
        }

        public async Task<DowntownResponse<TeamData>> GetTeamListAsync()
        {
            var response = await Get<DowntownResponse<TeamData>>(ClientType.DownTownClient, ApiEndPoints.TeamsURI);
            return response;
        }

        public async Task<DowntownResponse<UpcomingHolidayData>> GetUpcomingHolidayListAsync()
        {
            var response = await Get<DowntownResponse<UpcomingHolidayData>>(ClientType.DownTownClient, ApiEndPoints.UpcomingHolidaysURI);
            return response;
        }
    }
}
