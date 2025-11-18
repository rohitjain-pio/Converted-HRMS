using HRMS.Domain.Entities;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.Log;
using HRMS.Models.Models.DevTools;

namespace HRMS.Infrastructure.Interface
{
    public interface IDevToolRepository
    {
        Task<LogsListDto> GetAllLogsAsync(SearchRequestDto<LogSearchRequestDto> requestDto);
        Task<long> CreateCronLog(CronLog cronDto);
        Task<CronLogListDto> GetCronLogs(SearchRequestDto<CronLogSearchRequestDto> requestDto);
    }
}
