using Azure;
using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [HasPermission(Permissions.ReadProfessionalReference)]
    [ApiController]
    public class ProfessionalReferenceController : ControllerBase
    {
        private readonly ProfationalReferenceValidation _profationalReferenceValidation;
        private readonly IProfessionalReferenceService _professionalReferenceService;

        public ProfessionalReferenceController(ProfationalReferenceValidation profationalReferenceValidation,
        IProfessionalReferenceService professionalReferenceService)
        {
            _profationalReferenceValidation = profationalReferenceValidation;
            _professionalReferenceService = professionalReferenceService;
        }
        /// <summary>
        ///Add professional reference
        /// </summary>
        /// <param name="professionalReferenceRequestDtos"></param>
        /// <response code="200">Professional reference is saved successfully</response>
        /// <response code="400">Professional reference not found</response>
        [HttpPost]
        [Route("AddProfessionalReference")]
        [HasPermission(Permissions.CreateProfessionalReference)]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        public async Task<IActionResult> AddProfessionalReference(List<ProfessionalReferenceRequestDto> professionalReferenceRequestDtos)
        {      
            if (professionalReferenceRequestDtos != null)
            {
                foreach (var professionalReference in professionalReferenceRequestDtos)
                {
                    var validationResult = await _profationalReferenceValidation.ValidateAsync(professionalReference);
                    if (!validationResult.IsValid)
                    {
                        var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                        return BadRequest(new ApiResponseModel<object>
                        (
                            (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                        ));
                    }
                }
                var response = await _professionalReferenceService.AddProfessionalReference(professionalReferenceRequestDtos);
                return StatusCode(response.StatusCode, response);
            }
            else
            {
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.NullProfessionalReference, null
                ));
            }
        }
        /// <summary>
        /// Delete professional reference
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">professional reference not found</response>  
        [HttpDelete]
        [Route("DeleteProfessionalReference/{id:long}")]
        [HasPermission(Permissions.DeleteProfessionalReference)]
        public async Task<IActionResult> DeleteProfessionalReference(long id)
        {
            var response = await _professionalReferenceService.DeleteProfessionalReference(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        ///Update professional reference
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Professional reference is updated successfully</response>
        /// <response code="400">Professional reference not found</response>
        /// <response code="404">Professional reference request is Invalid</response>

        [HttpPut]
        [Route("UpdateProfessionalReference")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditProfessionalReference)]
        public async Task<IActionResult> UpdateProfessionalReference(ProfessionalReferenceRequestDto request)
        {
            var validationResult = await _profationalReferenceValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _professionalReferenceService.UpdateProfessionalReference(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get professional reference by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns professional reference by id</response>
        /// <response code="404">professional reference not found</response>
        [HttpGet]
        [Route("GetProfessionalReference/{id:long}")]
        [HasPermission(Permissions.ViewProfessionalReference)]
        [ProducesResponseType(typeof(ApiResponseModel<ProfessionalReferenceResponseDto>), 200)]
        public async Task<IActionResult> GetProfessionalReference(long id)
        {
            var response = await _professionalReferenceService.GetProfessionalReference(id);
            return StatusCode(response.StatusCode, response);
        }
    }
}