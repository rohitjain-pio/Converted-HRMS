using HRMS.API.Athorization;
using HRMS.Application;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }
        /// <summary>
        /// <response code="200">Added Feedback successfully</response>
        /// <response code="400">Invalid request</response>
        /// </summary>
        [HttpPost]
        [Route("AddFeedback")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.CreateSupport)]
        public async Task<IActionResult> AddFeedback([FromForm] FeedbackRequestDto requestDto)
        {
            var response = await _feedbackService.AddFeedback(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// <response code="200">Feedback retrieved successfully</response>
        /// <response code="400">Invalid request</response>
        /// <response code="404">Feedback not found</response>
        /// </summary>
        [HttpGet]
        [Route("GetFeedbackById/{id}")]
        [ProducesResponseType(typeof(ApiResponseModel<FeedbackResponseDto>), 200)]
        [HasPermission(Permissions.ReadSupport)]
        public async Task<IActionResult> GetFeedbackById(long id)
        {
            var response = await _feedbackService.GetFeedbackById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// List of Feedback
        /// </summary>
        /// <response code="200">Return list of Feedback</response> 
        [HttpPost]
        [Route("GetFeedbackList")]
        [ProducesResponseType(typeof(ApiResponseModel<FeedbackListResponseDto>), 200)]
        [HasPermission(Permissions.ReadAllSupport)]
        public async Task<IActionResult> GetFeedbackList(SearchRequestDto<FeedbackSearchRequestDto> searchRequestDto)
        {
            var response = await _feedbackService.GetFeedbackList(searchRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// List of Feedback for a specific employee
        /// </summary>
        /// <response code="200">Return list of Feedback for the employee</response>
        /// <response code="404">No feedback found for the employee</response>
        /// <response code="400">Invalid user session</response>
        [HttpPost]
        [Route("GetFeedbackByEmployee")]
        [ProducesResponseType(typeof(ApiResponseModel<FeedbackByEmployeeListResponseDto>), 200)]
        [HasPermission(Permissions.ReadSupport)]
        public async Task<IActionResult> GetFeedbackByEmployee([FromBody] SearchRequestDto<FeedbackSearchRequestDto> searchRequestDto)
        {
            var response = await _feedbackService.GetFeedbackByEmployee(searchRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// <response code="200">Feedback status modified successfully</response>
        /// <response code="400">Invalid request</response>
        /// <response code="404">Feedback not found</response>
        /// </summary>
        [HttpPost]
        [Route("ModifyFeedbackStatus")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditSupport)]
        public async Task<IActionResult> ModifyFeedbackStatus([FromBody] ModifyFeedbackStatusRequestDto requestDto)
        {
            var response = await _feedbackService.ModifyFeedbackStatus(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        
    }
}
