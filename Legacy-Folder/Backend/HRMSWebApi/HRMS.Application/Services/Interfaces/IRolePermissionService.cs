using HRMS.Models;
using HRMS.Models.Models.Role;
using HRMS.Models.Models.RolePermission;

namespace HRMS.Application.Services.Interfaces
{
    public interface IRolePermissionService
    {
        Task<ApiResponseModel<RoleSearchResponseDto>> GetRoles(SearchRequestDto<RoleRequestSearchDto> requestDto);
        Task<ApiResponseModel<ModulePermissionsResponseDto>> GetModulePermissionsByRole(int roleId);

        Task<ApiResponseModel<bool>> SaveRolePermissions(RolePermissionRequestDto model);
        Task<ApiResponseModel<List<ModuleDto>>> GetPermissionList();
        Task<ApiResponseModel<IEnumerable<RolesListResponseDto>>> GetRolesList();
    }
}
