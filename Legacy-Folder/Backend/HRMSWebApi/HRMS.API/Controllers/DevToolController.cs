using HRMS.API.Athorization;
using HRMS.Domain.Contants;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Application.Services;
using System.Net;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.Log;
using Microsoft.AspNetCore.Authorization;
using HRMS.Application.Clients.EmailQueue;
using HRMS.Application.Clients.Interfaces;
using HRMS.Models.Models.DevTools;
using Quartz;
using HRMS.Domain.Enums;



namespace HRMS.API.Controllers
{
    [Route("api/DevTool")]
    [ApiController]
    //[HasPermission(Permissions.ReadLogs)]
    public class DevToolController(IDevToolService _devToolService, ISchedulerFactory _schedulerFactory) : ControllerBase
    {

        /// <summary>
        /// Retrieves a paginated list of logs.
        /// </summary>
        /// <response code="200">Returns the paginated list of logs successfully.</response>
        [HttpPost]
        [Route("GetLogs")]
        [ProducesResponseType(typeof(ApiResponseModel<LogsListDto>), 200)]
        public async Task<IActionResult> GetLogs(SearchRequestDto<LogSearchRequestDto> requestDto)
        {
            var response = await _devToolService.GetAllLogs(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Retrieves the list of all available crons.
        /// </summary>
        /// <response code="200">Returns the paginated list of logs successfully.</response>
        [HttpPost]
        [Route("GetCrons")]
        [ProducesResponseType(typeof(ApiResponseModel<List<CronResponseDto>>), 200)]
        public async Task<IActionResult> GetCrons()
        {
            var response = new ApiResponseModel<List<CronResponseDto>>(200, "", new List<CronResponseDto>
                {
                    new CronResponseDto()
                    {
                        Id = 1,
                        Name = "Fetch Time Doctor Time Sheet Stats"
                    },
                    new CronResponseDto()
                    {
                        Id = 2,
                        Name = "Accrual Leaves"
                    }
                });
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Retrieves a paginated list of cron logs.
        /// </summary>
        /// <response code="200">Returns the paginated list of logs successfully.</response>
        [HttpPost]
        [Route("GetCronLogs")]
        [ProducesResponseType(typeof(ApiResponseModel<CronLogListDto>), 200)]
        public async Task<IActionResult> GetCronLogs(SearchRequestDto<CronLogSearchRequestDto> requestDto)
        {
            var response = await _devToolService.GetCronLogs(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves a paginated list of cron logs.
        /// </summary>
        /// <response code="200">Returns the paginated list of logs successfully.</response>
        [HttpPost]
        [Route("RunCron")]
        [ProducesResponseType(typeof(ApiResponseModel<string>), 200)]
        public async Task<IActionResult> RunCron(RunCronRequestDto requestDto)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            JobKey? jobKey;
            JobDataMap? dataMap;
            switch (requestDto.Type) {
                case CronType.FetchTimeDoctorTimeSheetStats: {
                        jobKey = new JobKey(QuartzConstants.FetchTimeDoctorTimeSheetJobKey);
                        if (!requestDto.Data.TryGetValue("forDate", out dynamic? forDate))
                            return BadRequest("forDate is required");

                        dataMap = new JobDataMap {
                            { "fetchForDate", forDate },
                        };
                        break;
                    }
                case CronType.MonthlyLeaveCreditAccrual:
                    {
                        jobKey = new JobKey(QuartzConstants.MonthlyCreditLeaveBalanceJobKey);
                        if (!requestDto.Data.TryGetValue("forMonth", out dynamic? forMonth) || 
                            //!requestDto.Data.TryGetValue("elapseLeaves", out dynamic? elapseLeaves) ||
                            !requestDto.Data.TryGetValue("forYear", out dynamic? forYear))
                            return BadRequest("elapseLeaves, forMonth and forYear is required");

                        dataMap = new JobDataMap {
                            //{ "elapseLeaves", elapseLeaves},
                            { "forMonth", forMonth },
                            { "forYear", forYear }
                        };
                        break;
                    }
                default: {
                    return NotFound(ErrorMessage.JobNotFound);
                }
            }
            if (!(await scheduler.CheckExists(jobKey)))
                return NotFound(ErrorMessage.JobNotFound);

            dataMap.Add("RequestId", HttpContext.TraceIdentifier);
            await scheduler.TriggerJob(jobKey, dataMap);
            return Ok(SuccessMessage.JobTriggered);
        }
    }
}
