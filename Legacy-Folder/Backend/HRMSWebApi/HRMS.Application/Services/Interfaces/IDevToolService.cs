using HRMS.Models;

using HRMS.Models.Models.Log;
using HRMS.Models.Models.DevTools;
using HRMS.Domain.Entities;

namespace HRMS.Application.Services.Interfaces
{
    public interface IDevToolService
    {
        Task<ApiResponseModel<LogsListDto>> GetAllLogs(SearchRequestDto<LogSearchRequestDto> requestDto);
        Task<ApiResponseModel<CronLogListDto>> GetCronLogs(SearchRequestDto<CronLogSearchRequestDto> requestDto);
        Task<ApiResponseModel<CronLogResponseDto>> GetCronLogById(long id);
        Task<ApiResponseModel<long>> UpsertCronLog(CronLog cronDto);
    }
}
