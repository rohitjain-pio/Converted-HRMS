using HRMS.API.Athorization;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers
{
    [Route("api/Dashboard")]
    [ApiController]
    [Produces("application/json")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }
        /// <summary>
        /// Get the birthday list for current week
        /// </summary>
        /// <response code="200">Return list of employees birthday for current week</response>
        [HttpGet]
        [Route("GetBirthdayList")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<BirthdayResponseDto>>), 200)]
        public async Task<IActionResult> GetBirthdayList()
        {
            var response = await _dashboardService.GetEmployeesBirthdayList();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get active, inactive and joined employees count
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return list of employees birthday for current week</response>
        [HttpPost]
        [Route("GetEmployeesCount")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeesCountResponseDto>), 200)]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        public async Task<IActionResult> GetEmployeesCount(DashboardRequestDto request)
        {
            var response = await _dashboardService.GetEmployeesCount(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of published company policies according to date range filter
        /// </summary>
        /// <param name="request">**Request Parameter**</param>
        /// <response code="200">Return list of published company policies</response>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<PublishedCompanyPolicyResponseDto>>), 200)]
        [Route("GetPublishedCompanyPolicies")]
        [HasPermission(Permissions.ReadCompanyPolicy)]
        public async Task<IActionResult> GetPublishedCompanyPolicies(DashboardRequestDto request)
        {
            var response = await _dashboardService.GetPublishedCompanyPolicies(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of work anniversary for current week
        /// </summary>
        /// <response code="200">Return list of work anniversary for current week</response>
        [HttpGet]
        [Route("GetWorkAnniversaryList")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<WorkAnniversaryResponseDto>>), 200)]
        public async Task<IActionResult> GetWorkAnniversaryList()
        {
            var response = await _dashboardService.GetEmployeesWorkAnniversaryList();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of all holidays for US and India
        /// </summary>
        /// <response code="200">Return list of all holidays for US and India</response>
        [HttpGet]
        [Route("GetHolidayList")]
        [ProducesResponseType(typeof(ApiResponseModel<HolidayResponseDto>), 200)]
        public async Task<IActionResult> GetHolidayList()
        {
            var response = await _dashboardService.GetHolidayList();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of upcoming two holidays for US and India
        /// </summary>
        /// <response code="200">Return list of upcoming two holidays for US and India</response>
        [HttpGet]
        [Route("GetUpcomingHolidayList")]
        [ProducesResponseType(typeof(ApiResponseModel<HolidayResponseDto>), 200)]
        public async Task<IActionResult> GetUpcomingHolidayList()
        {
            var response = await _dashboardService.GetUpcomingHolidayList();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of upcoming three events
        /// </summary>
        /// <response code="200">Return list of upcoming three events</response>
        [HttpGet]
        [Route("GetUpcomingEvents")]
        [ProducesResponseType(typeof(ApiResponseModel<UpComingEventResponseDto>), 200)]
        [HasPermission(Permissions.ReadEvents)]
        public async Task<IActionResult> GetUpComingEvents()
        {
            var response = await _dashboardService.GetUpComingEventsList();
          
            return StatusCode(response.StatusCode, response);
        }

    }
}
