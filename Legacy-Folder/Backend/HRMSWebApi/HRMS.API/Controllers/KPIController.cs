using HRMS.API.Athorization;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;


namespace HRMS.API.Controllers
{
    [Route("api/KPI")]
    [ApiController]
    public class KPIController : ControllerBase
    {
        private readonly IKPIService _kpiService;
        public KPIController(IKPIService kpiService)
        {
            _kpiService = kpiService;
        }

        /// <summary>
        /// <response code="200">Added Goalsuccessfully</response>
        /// <response code="400">Invalid request</response>
        /// </summary>
        [HttpPost]
        [Route("CreateGoal")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.CreateKPI)]
        public async Task<IActionResult> CreateGoal([FromBody] GoalRequestDto requestDto)
        {
            var response = await _kpiService.AddGoal(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// <response code="200">GetGoalById</response>
        /// Get goal by Id
        /// <response code="400">Invalid request</response>
        /// </summary>
        [HttpGet]
        [Route("GetGoalById/{goalId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<KPIGoals>), 200)]
        [HasPermission(Permissions.ReadKPI)]
        public async Task<IActionResult> GetGoalById(long goalId)
        {
            var response = await _kpiService.GetById(goalId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// <response code="200">Updated Goal successfully</response>
        /// <response code="400">Invalid request</response>
        /// </summary>
        [HttpPost]
        [Route("UpdateGoal")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> UpdateGoal([FromBody] GoalRequestDto request)
        {
            var response = await _kpiService.UpdateGoalAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Goal List
        /// </summary>
        /// <response code="200">Returns Goal List </response>
        [HttpPost]
        [Route("GetGoalList")]
        [ProducesResponseType(typeof(ApiResponseModel<KPIGoalsSearchResponseDto>), 200)]
        [HasPermission(Permissions.ReadKPIGoals)]
        public async Task<IActionResult> GetGoalList(SearchRequestDto<KPIGoalRequestDto> requestDto)
        {
            var response = await _kpiService.GetGoalList(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete a Goal by ID
        /// </summary>
        /// <param name="goalId">The ID of the goal to delete</param>
        /// <response code="200">Returns status of deletion</response>
        [HttpPost]
        [Route("DeleteGoal/{goalId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.DeleteKPI)]
        public async Task<IActionResult> DeleteGoal(long goalId)
        {
            var response = await _kpiService.DeleteGoalById(goalId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Return List of EmployeesKPI 
        /// </summary>
        /// <param name="requestDto">"Id of reporting manager"</param>
        /// <response code="200">Returns List all employees with KPI (Manager Dashboard)</response>
        [HttpPost]
        [Route("GetEmployeesKPI")]
        [ProducesResponseType(typeof(ApiResponseModel<GetEmpListResponseDto>), 200)]
        [HasPermission(Permissions.ReadKPIDashBoard)]
        public async Task<IActionResult> GetEmployeesKPI(SearchRequestDto<GetEmpByManagerRequestDto> requestDto)
        {
            var response = await _kpiService.GetEmployeesKPI(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Return List of Employees by Manager 
        /// </summary>
        /// <response code="200">Returns List all employees by Manager</response>
        [HttpGet]
        [Route("GetEmployeesByManager")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>), 200)]
        [HasPermission(Permissions.ReadKPI)]
        public async Task<IActionResult> GetEmployeesByManager()
        {
            var response = await _kpiService.GetEmployeesByManager();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Return Employee Self Rating By GoalId and PLanId
        /// </summary>
        /// <response code="200">Returns list of Employee self rating </response>
        [HttpGet]
        [Route("GetEmployeeSelfRating")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<GetSelfRatingResponseDto>>), 200)]
        [HasPermission(Permissions.ReadKPI)]
        public async Task<IActionResult> GetEmployeeSelfRating(long? PlanId, long? EmployeeId)
        {
            var response = await _kpiService.GetEmployeeSelfRating(PlanId, EmployeeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update Employee Self Rating 
        /// </summary>
        /// <response code="200">Returns 200 If Updated succesfully </response>
        [HttpPost]
        [Route("UpdateEmployeeSelfRating")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<CrudResult>>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> UpdateEmployeeSelfRating(UpdateEmployeeSelfRatingRequestDto requestDto)
        {
            var response = await _kpiService.UpdateEmployeeSelfRating(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update Manager Rating 
        /// </summary>
        /// <response code="200">Returns 200 If Updated succesfully </response>
        [HttpPost]
        [Route("UpdateEmployeeRatingByManager")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<CrudResult>>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> UpdateEmployeeRatingByManager(ManagerRatingUpdateRequestDto requestDto)
        {
            var response = await _kpiService.UpdateEmployeeRatingByManager(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Submit KPI Plan by Employee
        /// </summary>
        /// <response code="200">Returns 200 If Submitted response Sucessfully </response>
        [HttpPost]
        [Route("SubmitKPIPlanByEmployee/{planId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> SubmitKPIPlanByEmployee(long planId)
        {
            var response = await _kpiService.SubmitKPIPlanByEmployee(planId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update Target ,Allowed Goals and Assign Goal
        /// </summary>
        /// <response code="200">Returns 200 If updated successfully </response>
        [HttpPost]
        [Route("AssignGoalByManager")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> AssignGoalByManager(AssignGoalByManagerRequestDto requestDto)
        {
            var response = await _kpiService.AssignGoalByManager(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Submit KPI Plan by Manager
        /// </summary>
        /// <response code="200">Returns 200 If Submitted response Successfully</response>
        [HttpPost]
        [Route("SubmitKPIPlanByManager/{planId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> SubmitKPIPlanByManager(long planId)
        {
            var response = await _kpiService.SubmitKPIPlanByManager(planId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Manager Rating History By Goal
        /// </summary>
        /// <response code="200">Returns 200 If Submitted response Successfully</response>
        [HttpPost]
        [Route("GetManagerRatingHistoryByGoal")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<ManagerRatingHistoryByGoalResponseDto>>), 200)]
        [HasPermission(Permissions.EditKPI)]
        public async Task<IActionResult> GetManagerRatingHistoryByGoal(GetRatingHistoryRequestDto requestDto)
        {
            var response = await _kpiService.GetManagerRatingHistoryByGoal(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Returns Employee Ratings by Manager for all KPI Plans by EmployeeId
        /// </summary>
        /// <response code="200">Returns list of Employee ratings grouped by KPI plans</response>
        [HttpGet]
        [Route("GetEmployeeRatingByManager/{EmployeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<GetEmployeeRatingByManagerResponseDto>>), 200)]
        [HasPermission(Permissions.ReadKPI)]
        public async Task<IActionResult> GetEmployeeRatingByManager(long EmployeeId)
        {
            var response = await _kpiService.GetEmployeeRatingByManager(EmployeeId);
            return StatusCode(response.StatusCode, response);
        }


    }
}
