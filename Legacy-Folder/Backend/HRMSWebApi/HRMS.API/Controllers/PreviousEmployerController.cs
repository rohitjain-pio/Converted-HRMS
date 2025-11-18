using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [ApiController]
    [HasPermission(Permissions.ReadPreviousEmployer)]
    public class PreviousEmployerController : ControllerBase
    {
        private readonly PreviousEmployerRequestValidation _PreviousEmployerRequestValidation;
        private readonly PreviousEmployerDocValidation _PreviousEmployerDocValidation;
        private readonly IPreviousEmployerService _PreviousEmployerService;
        
        public PreviousEmployerController(PreviousEmployerDocValidation PreviousEmployerDocValidation,
        IPreviousEmployerService PreviousEmployerService,
        PreviousEmployerRequestValidation PreviousEmployerRequestValidation)
        {
            _PreviousEmployerDocValidation = PreviousEmployerDocValidation;
            _PreviousEmployerService = PreviousEmployerService;
            _PreviousEmployerRequestValidation = PreviousEmployerRequestValidation;
        }

        /// <summary>
        /// Save previous employer
        /// </summary>   
        /// <param name="request"></param>
        /// <response code="200">Previous employer is saved successfully</response>
        /// <response code="400">Error in saving previous employer</response>
        [HttpPost]
        [Route("AddPreviousEmployer")]
        [HasPermission(Permissions.CreatePreviousEmployer)]

        public async Task<IActionResult> AddPreviousEmployer(PreviousEmployerRequestDto request)
        {
            var validationResult = await _PreviousEmployerRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _PreviousEmployerService.AddPreviousEmployer(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of previous employer
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return list of previous employer</response>        
        [HttpPost]
        [Route("GetPreviousEmployerList")]
        [HasPermission(Permissions.ReadPreviousEmployer)]
        [ProducesResponseType(typeof(ApiResponseModel<PreviousEmployerSearchResponseDto>), 200)]
        public async Task<IActionResult> GetPreviousEmployerList(SearchRequestDto<PreviousEmployerSearchRequestDto> request)
        {
            var response = await _PreviousEmployerService.GetPreviousEmployerList(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete previous employer
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Previous employer not found</response>  
        [HttpDelete]
        [Route("DeletePreviousEmployer/{id:long}")]
        [HasPermission(Permissions.DeletePreviousEmployer)]
        public async Task<IActionResult> DeletePreviousEmployer(long id)
        {
            var response = await _PreviousEmployerService.DeletePreviousEmployer(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Upload employer document
        /// </summary>
        /// <param name="prevEmployerDocRequestDto">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully upload</response>       
        /// <response code="400">Error in upload employer document</response>  
        [HttpPost]
        [Route("UploadEmployerDocument")]
        [HasPermission(Permissions.CreatePreviousEmployer)]
        public async Task<IActionResult> UploadEmployerDocument([FromForm] PreviousEmployerDocRequestDto prevEmployerDocRequestDto)
        {
            var validationResult = await _PreviousEmployerDocValidation.ValidateAsync(prevEmployerDocRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _PreviousEmployerService.UploadPreviousEmployerDocument(prevEmployerDocRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Previous employer by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns previous employer</response>
        /// <response code="404">Previous employer not found</response>      
        [HttpGet]
        [Route("GetPreviousEmployerById/{id:long}")]
        [HasPermission(Permissions.ViewProfessionalReference)]
        [ProducesResponseType(typeof(ApiResponseModel<PreviousEmployerResponseDto>), 200)]
        public async Task<IActionResult> GetPreviousEmployerById(long id)
        {
            var response = await _PreviousEmployerService.GetPreviousEmployerById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update previous employer
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="400">Error in updating previous employer</response> 
        [HttpPut]
        [Route("UpdatePreviousEmployer")]
        [HasPermission(Permissions.EditPreviousEmployer)]
        public async Task<IActionResult> UpdatePreviousEmployer(PreviousEmployerRequestDto request)
        {
            var validationResult = await _PreviousEmployerRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _PreviousEmployerService.UpdatePreviousEmployer(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete previous employer document
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Previous employer document not found</response>  
        [HttpDelete]
        [Route("DeletePreviousEmployerDocument/{id:long}")]
        [HasPermission(Permissions.DeletePreviousEmployer)]
        public async Task<IActionResult> DeletePreviousEmployerDocument(long id)
        {
            var response = await _PreviousEmployerService.DeletePreviousEmployerDocument(id);
            return StatusCode(response.StatusCode, response);
        }
    }
}