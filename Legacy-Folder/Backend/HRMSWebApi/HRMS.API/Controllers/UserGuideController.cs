using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserGuide;
using iText.Commons.Utils;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers
{
    [Route("api/UserGuide")]
    [ApiController]

    public class UserGuideController : ControllerBase
    {
        private readonly IUserGuideService _userGuideService;
        public UserGuideController(IUserGuideService userGuideService)
        {
            _userGuideService = userGuideService;
        }
        /// <summary>
        /// Retrieves a paginated list of UserGuide entries with optional filtering and sorting.
        /// </summary>
        /// <param name="searchRequest">The search parameters including filters, pagination, and sorting options.</param>
        /// <returns>
        /// A <see cref="UserGuideResponseListDto"/> containing the filtered UserGuide entries and the total record count.
        /// </returns>
        /// <response code="200">Successfully retrieved the list of UserGuide entries. The list may be empty if no matching records are found.</response>
        /// <response code="400">Invalid request parameters.</response>
        /// <response code="500">An unexpected error occurred while processing the request.</response>
        /// 
        [HttpPost]
        [Route("GetAllUserGuide")]
        [ProducesResponseType(typeof(ApiResponseModel<UserGuideResponseListDto>), 200)]
        public async Task<IActionResult> GetAllUserGuide([FromBody] SearchRequestDto<GetAllUserGuideRequestDto> searchRequest)
        {
            var response = await _userGuideService.GetAllUserGuideAsync(searchRequest);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Retrieves all active menu items.
        /// </summary>
        /// <remarks>
        /// Returns a list of menus where IsDeleted is false.
        /// </remarks>
        /// <response code="200">Returns the list of menu items successfully (can be empty if no menus found).</response>
        /// <response code="500">If an unexpected error occurs while processing the request.</response>
        [HttpGet]
        [Route("GetAllMenu")]
        // [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<MenuResponseDto>>), 200)]
        public async Task<IActionResult> GetAllMenu()
        {
            var resp = await _userGuideService.GetAllMenuName();
            return StatusCode(resp.StatusCode, resp);
        }


        /// <summary>
        /// Adds a new UserGuide entry.
        /// </summary>
        /// <param name="createDto">The UserGuide creation data transfer object.</param>
        /// <returns>
        /// Returns an HTTP status code along with the operation result indicating
        /// whether the creation was successful or if there were any errors.
        /// </returns>
        /// <response code="200">UserGuide created successfully.</response>
        /// <response code="400">Invalid input data or missing required fields.</response>
        [HttpPost]
        [Route("AddUserGuide")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 201)]
        public async Task<IActionResult> AddUserGuide([FromBody] AddUserGuide createDto)
        {
            var response = await _userGuideService.AddUserGuideAsync(createDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Updates an existing UserGuide entry based on the provided data.
        /// </summary>
        /// <param name="updateDto">The UserGuide data to update.</param>
        /// <returns>
        /// Returns an HTTP status code indicating the result of the update operation.
        ///  - 200 OK: Update successful.
        ///  - 400 Bad Request: Invalid data or validation failure.
        ///  - 500 Internal Server Error: Server error during update.
        /// </returns>
        [HttpPost]
        [Route("UpdateUserGuide")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 201)]
        public async Task<IActionResult> UpdateUserGuide([FromBody] UpdateUserGuide updateDto)
        {
            var response = await _userGuideService.UpdateUserGuideAsync(updateDto);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Retrieves a UserGuide entry by MenuId where Status is active and not deleted.
        /// </summary>
        /// <param name="MenuId">The MenuId of the UserGuide to retrieve.</param>
        /// <returns>
        /// Returns an ApiResponseModel containing the UserGuide details if found.
        /// - 200 OK: Successfully retrieved UserGuide or empty result if not found.
        /// </returns>
        [HttpGet]
        [Route("GetUserGuideByMenuId/{MenuId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<UserGuideByMenuIdDto>), 200)]
        public async Task<IActionResult> GetUserGuideByMenuId(long MenuId)
        {
            var response = await _userGuideService.GetUserGuideByMenuId(MenuId);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Deletes a UserGuide entry by its unique identifier.
        /// </summary>
        /// <param name="UserGuideId">The ID of the UserGuide to delete.</param>
        /// <returns>
        /// Returns a response indicating the result of the delete operation:
        /// - 200 OK: Successfully marked the UserGuide as deleted.
        /// - 400 Bad Request: If the UserGuideId is invalid.
        /// - 404 Not Found: If the UserGuide does not exist or is already deleted.
        /// </returns>
        /// <response code="200">UserGuide deleted successfully.</response>
        /// <response code="400">Invalid UserGuideId provided.</response>
        /// <response code="404">UserGuide not found.</response>
        /// <response code="500">An unexpected error occurred on the server.</response>
        [HttpPost]
        [Route("DeleteUserGuideById")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        public async Task<IActionResult> DeleteUserGuideById(long UserGuideId)
        {
            var response = await _userGuideService.DeleteUserGuideById(UserGuideId);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Retrieves a UserGuide entry by Id where Status is active and not deleted.
        /// </summary>
        /// <param name="Id">The Id of the UserGuide to retrieve.</param>
        /// <returns>
        /// Returns an ApiResponseModel containing the UserGuide details if found.
        /// - 200 OK: Successfully retrieved UserGuide or empty result if not found.
        /// </returns>
        [HttpGet]
        [Route("GetUserGuideById/{Id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<UserGuideById>), 200)]
        public async Task<IActionResult> GetUserGuideById(long Id)
        {
            var response = await _userGuideService.GetUserGuideById(Id);
            return StatusCode(response.StatusCode, response);
        }

    }
}
