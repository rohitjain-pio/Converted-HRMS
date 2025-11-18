using System.Collections.Generic;
using System.Threading.Tasks;
using Azure;
using Azure.Core;
using HRMS.API.Athorization;
using HRMS.Application.Services;
using HRMS.Domain.Contants;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.Attendance;
using HRMS.Models.Models.Attendance.JobTriggerRequest;
using HRMS.Models.Models.AttendanceConfiguration;
using HRMS.Models.Models.EmployeeReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quartz;

namespace HRMS.API.Controllers
{
    [ApiController]
    [Route("api/Attendance")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly IAttendanceService _attendanceService;
        public AttendanceController(IAttendanceService attendanceService, ISchedulerFactory schedulerFactory)
        {
            _attendanceService = attendanceService;
            _schedulerFactory = schedulerFactory;
        }
        /// <summary>
        /// Create Employee Attendance
        /// </summary>
        /// <param name="attendanceRow"></param>
        /// <param name="employeeId"></param>
        /// <response code="200">Return 200 for  successfully Creation</response>
        /// <response code="400">Return 400 if Error in saving employee attendance</response>
        
        [HttpPost]
        [Route( "AddAttendance/{employeeId:long}")]
        [HasPermission(Permissions.CreateAttendence)]
        public async Task<IActionResult> AddAttendance(long employeeId,[FromBody] AttendanceRequestDto attendanceRow)
        {
            var response = await _attendanceService.AddAttendanceAsync(employeeId, attendanceRow);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get the Attendance Details of an Employee (with filters and pagination)
        /// </summary>
        /// <param name="dateFrom">Start date filter</param>
        /// <param name="employeeId">Login user Employee Id</param>
        /// <param name="dateTo">End date filter</param>
        /// <param name="pageIndex">Page index</param>
        /// <param name="pageSize">Page size</param>
        /// <response code="200">Return list of employees Attendance Data for current week</response>
        
        [HttpGet]
        [Route("GetAttendance/{employeeId:long}")]
        [HasPermission(Permissions.ReadAttendance)]
        public async Task<IActionResult> GetAttendance(long employeeId,string? dateFrom, string? dateTo, int pageIndex = 0, int pageSize = 7)
        {
            var response = await _attendanceService.GetAttendanceByEmployeeIdAsync(employeeId, dateFrom, dateTo, pageIndex, pageSize);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update Employee Attendance
        /// </summary>
        /// <param name="attendanceRow"></param>
        /// <param name="employeeId"></param>
        /// <param name="attendanceId"></param>
        /// <response code="200">Return 200 for  successfully Updation</response>
        /// <response code="400">Return 400 if Error in updating employee attendance</response>
        [HttpPut]
        [Route("UpdateAttendance/{employeeId:long}/{attendanceId}")]
        [HasPermission(Permissions.CreateAttendence)]
        public async Task<IActionResult> UpdateAttendance(long employeeId,long attendanceId, [FromBody] AttendanceRequestDto attendanceRow)
        {
            var response = await _attendanceService.UpdateAttendanceAsync(employeeId, attendanceRow, attendanceId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update attendance configuration for an employee
        /// </summary>
        /// <param name="employeeId">The employee ID whose configuration is to be updated</param>
        /// <returns>Status of the update operation</returns>
        [HttpPut]
        [Route("UpdateConfig")]
        [HasPermission(Permissions.ReadAttendanceConfiguration)]
        public async Task<IActionResult> UpdateConfig(long employeeId)
        {
            var response = await _attendanceService.UpdateConfigAsync(employeeId);
            return StatusCode(response.StatusCode, response);
        }
    
        /// <summary>
        /// Get paginated and filtered attendance configuration records
        /// </summary>
        /// <param name="requestDto">this contain search filters for name and pagination</param>
        ///<returns>Return list of All employees for configuration of attenedance </returns>
        [HttpPost]
        [Route("GetAttendanceConfigList")]
        [HasPermission(Permissions.ReadAttendanceConfiguration)]
        public async Task<IActionResult> GetAttendanceConfigList([FromBody] SearchRequestDto<AttendanceConfigSearchRequestDto> requestDto)
        {
            var response = await _attendanceService.GetAttendanceConfigListAsync(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        
        /// <summary>
        /// Get paginated and filtered employee attendance  records
        /// </summary>
        /// <param name="requestDto">This contain search filters for date , pagination,name and employee Codes</param>
        ///<returns>Return list of employees Attendance Report </returns>
        [HttpPost]
        [Route("GetEmployeeReport")]
        [HasPermission(Permissions.ReadAttendanceEmployeeReport)]
        public async Task<IActionResult> GetEmployeeReport([FromBody] SearchRequestDto<EmployeeReportSearchRequestDto> requestDto)
        {
            var response = await _attendanceService.GetEmployeeReport(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Excel of paginated and filtered employee attendance  records
        /// </summary>
        /// <param name="requestDto">This contain search filters for date , pagination,name and employee Codes</param>
        ///<returns>Return Excel of list of employees Attendance Report </returns>
        [HttpPost]
        [Route("ExportEmployeeReportExcel")]
        [HasPermission(Permissions.ReadAttendanceEmployeeReport)]
        public async Task<IActionResult> ExportEmployeeReportExcel([FromBody] SearchRequestDto<EmployeeReportSearchRequestDto> requestDto)
        {
            var response = await _attendanceService.GetAttendanceReportInExcel(requestDto);
            var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var fileName = $"EmployeeReport_{timestamp}.xlsx";

            return File(response, contentType, fileName);
        }

        /// <summary>
        /// Get employee code and service based on filter (employee code or name)
        /// </summary>
        [HttpGet]
        [Route("GetEmployeeCodeAndNameList")]
        // [HasPermission(Permissions.ViewAttendance)]
        public async Task<IActionResult> GetEmployeeCodeAndNameList(string? employeeCode, string? employeeName,bool exEmployee=false)
        {
            var response = await _attendanceService.GetEmployeeCodeAndNameListAsync(employeeCode, employeeName, exEmployee);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Trigger time doctor time sheet stats job
        /// </summary>
        [HttpPost]
        [Route("TriggerFetchTimeSheetSummaryStats")]
        [HasPermission(Permissions.CreateAttendence)]
        public async Task<IActionResult> TriggerFetchTimeSheetSummaryStats([FromBody] TimeSheetSummaryJobTriggerRequestDto dto)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKey = new JobKey(QuartzConstants.FetchTimeDoctorTimeSheetJobKey);

            if (await scheduler.CheckExists(jobKey))
            {
                var dataMap = new JobDataMap
                {
                    { "fetchForDate", dto.ForDate },
                };
                await scheduler.TriggerJob(jobKey, dataMap);
                return Ok(SuccessMessage.JobTriggered);
            }

            return NotFound(ErrorMessage.JobNotFound);
        }
    }
}
