using System.Net;
using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.Event;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers
{
    
    [ApiController]
    [Route("api/Event")]
    [HasPermission(Permissions.ReadEvents)]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly EventRequestValidation _validations;

        public EventController(IEventService eventService, EventRequestValidation validations)
        {
            _eventService = eventService;
            _validations = validations;
        }

        /// <summary>
        /// Get list of events
        /// </summary>
        /// <param name="requestDto">**Request parameter**</param>
        /// <response code="200">Return list of events</response>
        [ProducesResponseType(typeof(ApiResponseModel<EventSearchResponseDto>), 200)]
        [HttpPost]
        [Route("GetEvents")]
        [HasPermission(Permissions.ReadEvents)]
        public async Task<IActionResult> GetEvents(SearchRequestDto<EventSearchRequestDto> requestDto)
        {
            var response = await _eventService.GetEvents(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get event by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns event</response>
        /// <response code="404">event not found</response>
        [ProducesResponseType(typeof(ApiResponseModel<EventResponseDto>), 200)]
        [HttpGet]
        [Route("{id:long}")]
        [HasPermission(Permissions.ViewEvents)]
        public async Task<IActionResult> GetEventById(long id)
        {
            var response = await _eventService.GetEventById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete event
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">event not found</response>     
        [HttpDelete]
        [Route("{id:long}")]
        [HasPermission(Permissions.DeleteEvents)]
        public async Task<IActionResult> Delete(long id)
        {
            var response = await _eventService.Delete(id);
            return StatusCode(response.StatusCode, response);
        }
        
        /// <summary>
        /// Delete event document
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">event document not found</response>     
        [HttpDelete]
        [Route("DeleteEventDocument/{id:long}")]
        [HasPermission(Permissions.DeleteEvents)]
        public async Task<IActionResult> DeleteEventDocument(long id)
        {
            var response = await _eventService.DeleteEventDocument(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Save event
        /// </summary>
        /// <param name="eventRequestDto"></param>
        /// <response code="200">Event is saved successfully</response>
        /// <response code="400">Error in saving Event</response>
        [HttpPost]
        [Route("CreateEvent")]
        [HasPermission(Permissions.CreateEvents)]

        [ProducesResponseType(typeof(ApiResponseModel<EventResponseDto>), 200)]
        public async Task<IActionResult> Post([FromForm] EventRequestDto eventRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(eventRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _eventService.Add(eventRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update event
        /// </summary>
        /// <param name="eventRequestDto"></param>
        /// <response code="200">Event is update successfully</response>
        /// <response code="400">Error in updating Event</response>
        [HttpPost]
        [Route("UpdateEvent")]
        [HasPermission(Permissions.EditEvents)]
        [ProducesResponseType(typeof(ApiResponseModel<EventResponseDto>), 200)]
        public async Task<IActionResult> UpdateEvent([FromForm] EventRequestDto eventRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(eventRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _eventService.Update(eventRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of event categories
        /// </summary>
        /// <response code="200">Return list of event categories</response>
        /// <response code="404">event categories not found</response>     
        [HttpGet]
        [Route("GetEventCategoryList")]
        [HasPermission(Permissions.ReadEvents)]

        [ProducesResponseType(typeof(ApiResponseModel<List<EventCategoryResponseDto>>), 200)]
        public async Task<IActionResult> GetEventCategoryList()
        {
            var response = await _eventService.GetEventCategoryList();
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        [Route("UpdateEventStatus/{id:long}")]
        [HasPermission(Permissions.EditEvents)]
        public async Task<IActionResult> UpdateEventStatus([FromRoute] long id, [FromForm] int statusId)
        {
            var response = await _eventService.UpdateEventStatus(id, statusId);
            return StatusCode(response.StatusCode, response);
        }

    }
}