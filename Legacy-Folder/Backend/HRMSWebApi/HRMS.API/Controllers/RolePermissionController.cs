using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.Role;
using HRMS.Models.Models.RolePermission;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [HasPermission(Permissions.ReadRole)]
    public class RolePermissionController(IRolePermissionService rolePermissionService, RolePermissionRequestValidation validations) : ControllerBase
    {
        private readonly IRolePermissionService _rolePermissionService = rolePermissionService;
        private readonly RolePermissionRequestValidation _validations = validations;

        //GetRoles
        /// <summary>
        /// Get list of roles
        /// </summary>
        /// <param name="requestDto">**Request parameter**</param>
        /// <response code="200">Return list of  roles</response>
        [HttpPost]
        [Route("GetRoles")]
        [HasPermission(Permissions.ReadRole)]
        [ProducesResponseType(typeof(ApiResponseModel<RoleSearchResponseDto>), 200)]
        public async Task<IActionResult> GetRoles(SearchRequestDto<RoleRequestSearchDto> requestDto)
        {
            var response = await _rolePermissionService.GetRoles(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        ///Get module list with their permission list by role Id 
        /// </summary>
        /// <param name="roleId">**int**</param>
        /// <response code="200"> returns modulelist with their  permission list by role Id</response>
        /// <response code="404">Module permissions not found</response>

        [HttpGet]
        [Route("GetModulePermissionsByRole")]
        [HasPermission(Permissions.ViewRole)]
        [ProducesResponseType(typeof(ApiResponseModel<ModulePermissionsResponseDto>), 200)]
        public async Task<IActionResult> GetModulePermissionsByRole(int roleId)
        {
            if (roleId <= 0)
            {
                return BadRequest(new ApiResponseModel<ModulePermissionsResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.RoleRequired, null));
            }
            var response = await _rolePermissionService.GetModulePermissionsByRole(roleId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Save role permissions
        /// </summary>
        /// <param name="requestDto"></param>
        /// <response code="200">Role permissions is saved successfully</response>
        /// <response code="400">Error is saving role permissions</response>
        [HttpPost]
        [Route("SaveRolePermissions")]
        [HasPermission(Permissions.CreateRole)]
        [HasPermission(Permissions.EditRole)]
        [ProducesResponseType(typeof(ApiResponseModel<bool>), 200)]
        public async Task<IActionResult> SaveRolePermissions(RolePermissionRequestDto requestDto)
        {
            var validationResult = await _validations.ValidateAsync(requestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _rolePermissionService.SaveRolePermissions(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of permissions
        /// </summary>
        /// <response code="200">Return list of permission</response>
        [HttpGet("GetPermissionList")]
        [HasPermission(Permissions.ReadRole)]
        [ProducesResponseType(typeof(ApiResponseModel<List<ModuleDto>>), 200)]
        public async Task<IActionResult> GetPermissionList()
        {
            var response = await _rolePermissionService.GetPermissionList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of Roles for Dropdown
        /// </summary>
        /// <response code="200">Return list of Roles</response>
        [HttpGet]
        [Route("GetRolesList")]
        [HasPermission(Permissions.ReadRole)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<RolesListResponseDto>>), 200)]
        public async Task<IActionResult> GetRolesList()
        {
            var response = await _rolePermissionService.GetRolesList();
            return StatusCode(response.StatusCode, response);
        }

    }
}
