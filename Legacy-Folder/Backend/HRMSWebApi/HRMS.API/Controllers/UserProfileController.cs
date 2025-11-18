using FluentValidation;
using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;
namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [ApiController]
    [HasPermission(Permissions.ReadPersonalDetails)]
    public class UserProfileController(IUserProfileService userProfileService, PersonalDetailRequestValidation validations, UploadFileRequestValidation fileValidation,
                                       UserDocumentRequestValidation documentValidation
                                       ) : ControllerBase

    {
        private readonly IUserProfileService _userProfileService = userProfileService;
        private readonly PersonalDetailRequestValidation _validations = validations;
        private readonly UploadFileRequestValidation _fileValidation = fileValidation;
        private readonly UserDocumentRequestValidation _documentValidation = documentValidation;

        
        /// <summary>
        /// Get personal details by Id
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns Personal Details</response>
        /// <response code="404">Personal details not found</response>
        [HttpGet]
        [Route("GetPersonalDetailsById/{id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<PersonalDetailsResponseDto>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetPersonalDetailsById(long id)
        {
            var response = await _userProfileService.GetPersonalDetailsById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get government document list
        /// </summary>
        /// <param name="idProofFor"></param>
        /// <response code="200">Returns government document list</response>
        /// <response code="404">government documents not found</response>

        [HttpGet]
        [Route("GovtDocumentList/{idProofFor:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<GovtDocumentResponseDto>>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GovtDocumentList(int idProofFor)
        {
            var response = await _userProfileService.GovtDocumentList(idProofFor);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get country list
        /// </summary>
        /// <response code="200">Returns country list</response>
        /// <response code="404">Country list not found</response>
        [HttpGet]
        [Route("GetCountryList")]
        [ProducesResponseType(typeof(ApiResponseModel<List<CountryResponseDto>>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetCountryList()
        {
            var response = await _userProfileService.GetCountryList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get state list by country id
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns state list</response>
        /// <response code="404">State list not found</response>
        [HttpGet]
        [Route("GetStateList/{id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<List<StateResponseDto>>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetStateListById(long id)
        {
            var response = await _userProfileService.GetStateListByCountryId(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update user profile image
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">User profile not found</response>
        /// <response code="500">Error in updating/removing file name in database</response>   
        /// <response code="400">Error in updating user profile</response>   
        [HttpPost]
        [Route("UploadUserProfileImage")]
        [HasPermission(Permissions.EditPersonalDetails)]
        public async Task<IActionResult> UploadUserProfileImage(UploadFileRequest request)
        {
            var validationResult = await _fileValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _userProfileService.UploadUserProfileImage(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Save Personal detail
        /// </summary>
        /// <param name="personalDetailsRequestDto"></param>
        /// <response code="200">Return 200 status for successfully save</response>
        /// <response code="409">Personal email already exists.</response>   
        /// <response code="400">Error in saving personal detail</response>   
        [HttpPost]
        [Route("AddPersonalDetail")]
        [HasPermission(Permissions.CreatePersonalDetails)]
        public async Task<IActionResult> AddPersonalDetail(PersonalDetailsRequestDto personalDetailsRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(personalDetailsRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _userProfileService.AddPersonalDetail(personalDetailsRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Remove profile image
        /// </summary>
        /// <param name="id"></param>
         /// <response code="200">Return 200 status for successfully removed</response>
        /// <response code="404">user not found.</response>   
        /// <response code="500">Error in deleting profile picture</response>   
        [HttpGet]
        [Route("RemoveProfilePicture/{id:long}")]
        [HasPermission(Permissions.DeletePersonalDetails)]
        public async Task<IActionResult> RemoveProfilePicture(long id)
        {
            var response = await _userProfileService.RemoveUserProfileImage(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update user profile image
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">User profile not found</response>
        /// <response code="404">No file is provided</response>
        /// <response code="500">Error in updating/removing file name in database</response>    
        [HttpPost]
        [Route("UpdateProfilePicture")]
        [HasPermission(Permissions.EditPersonalDetails)]
        public async Task<IActionResult> UpdateProfilePicture(UploadFileRequest request)
        {
            var response = await _userProfileService.UpdateProfilePicture(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get city list by state id
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns city list</response>
        /// <response code="404">City list not found</response>
        [HttpGet]
        [Route("GetCityList/{id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<List<CityResponseDto>>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetCityListById(long id)
        {
            var response = await _userProfileService.GetCityListByStateId(id);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Get user document list
        /// </summary>
        /// <param name="employeeId"></param>
        /// <response code="200">Returns user document list</response>
        /// <response code="404">user not found</response>
        [HttpGet]
        [Route("GetUserDocumentList/{employeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<List<UserDocumentResponseDto>>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetUserDocumentList(long employeeId)
        {
            var response = await _userProfileService.GetUserDocumentListAsync(employeeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get user document by id
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns user document</response>
        /// <response code="404">user not found</response>
        [HttpGet]
        [Route("GetUserDocumentById/{id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<UserDocumentResponseDto>), 200)]
        [HasPermission(Permissions.ViewPersonalDetails)]
        public async Task<IActionResult> GetUserDocumentById(long id)
        {
            var response = await _userProfileService.GetUserDocumentById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update user document
        /// </summary>
        /// <param name="userDocumentRequestDto"></param>
        /// <response code="200">Return 200 status for successfully save</response>
        /// <response code="409">Error in the document has been already upload</response>
        /// <response code="400">Error in the document type not found/no file</response>
        /// <response code="500">Error in saving document information in database</response>    
        [HttpPost]
        [Route("UploadUserDocument")]
        [HasPermission(Permissions.CreatePersonalDetails)]
        public async Task<IActionResult> UploadUserDocument([FromForm] UserDocumentRequestDto userDocumentRequestDto)
        {
            var validationResult = await _documentValidation.ValidateAsync(userDocumentRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _userProfileService.UploadUserDocument(userDocumentRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update user document
        /// </summary>
        /// <param name="userDocumentRequestDto"></param>
        /// <response code="200">Return 200 status for successfully save</response>
        /// <response code="409">Error in the document has been already upload</response>
        /// <response code="400">Error in the document type not found/no file</response>
        /// <response code="500">Error in saving document information in database</response>
        [HttpPost]
        [Route("UpdateUploadUserDocument")]
        [HasPermission(Permissions.EditPersonalDetails)]
        public async Task<IActionResult> UpdateUploadUserDocument([FromForm] UserDocumentRequestDto userDocumentRequestDto)
        {
            var validationResult = await _documentValidation.ValidateAsync(userDocumentRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _userProfileService.UpdateUploadUserDocument(userDocumentRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get URL of user document
        /// </summary>
        /// <response code="200">Returns user document Url</response>
        [HttpGet]
        [Route("GetUserDocumentUrl")]
        [HasPermission(Permissions.ViewPersonalDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<string?>), 200)]
        public async Task<IActionResult> GetUserDocumentUrl(BlobDocumentContainerType containerType, string filename)
        {
            var response = await _userProfileService.GetUserDocumentSasUrl(containerType, filename);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get department list
        /// </summary>
        /// <response code="200">Returns department list</response>
        [HttpGet]
        [Route("GetDepartmentList")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<RelationshipResponseDto>>), 200)]
        [HasPermission(Permissions.ReadEmployees)]
        public async Task<IActionResult> GetDepartmentList()
        {
            var response = await _userProfileService.GetDepartmentList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// update personal detail
        /// </summary>
        /// <param name="personalDetailsRequestDto"></param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="400">Error in update request is empty/Invalid Employee Id/Address ID</response>
        /// <response code="409">Error in Personal email already exists</response>
        /// <response code="500">Error in updating personal detail in database</response>   
        [HttpPost]
        [Route("UpdatePersonalDetail")]
        [HasPermission(Permissions.EditPersonalDetails)]
        public async Task<IActionResult> UpdatePersonalDetail(PersonalDetailsRequestDto personalDetailsRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(personalDetailsRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _userProfileService.UpdatePersonalDetail(personalDetailsRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get universities
        /// </summary>
        /// <response code="200">Returns universities list</response>
        [HttpGet]
        [Route("GetUniversitiesList")]
        [ProducesResponseType(typeof(ApiResponseModel<List<UniversityResponseDto>>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetUniversitiesList()
        {
            var response = await _userProfileService.GetUniversitiesList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get personal profile details by Id
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns Personal Details</response>
        /// <response code="404">Personal details not found</response>
        [HttpGet]
        [Route("GetPersonalProfileByIdAsync/{id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<PersonalDetailsResponseDto>), 200)]
        [HasPermission(Permissions.ReadPersonalDetails)]
        public async Task<IActionResult> GetPersonalProfileByIdAsync(long id)
        {
            var response = await _userProfileService.GetPersonalProfileByIdAsync(id);
            return StatusCode(response.StatusCode, response);
        }


    }
}
