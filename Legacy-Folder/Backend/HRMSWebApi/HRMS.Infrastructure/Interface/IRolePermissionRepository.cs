using HRMS.Models;
using HRMS.Domain.Entities;
using HRMS.Models.Models.Role;
namespace HRMS.Infrastructure.Interface
{
    public interface IRolePermissionRepository
    {
        Task<RoleSearchResponseDto> GetRoles(SearchRequestDto<RoleRequestSearchDto> roleRequestSearchDto);
        Task<IEnumerable<ModulePermissionDto>> GetModulePermissionByRole(int roleId);
        Task<int> SaveRolePermission(int roleId, IEnumerable<int> permissionIdList);
        Task<int> UpdateRoleName(int roleId, string roleName);
        Task<IEnumerable<ModuleDto?>> GetPermissionList();
        Task<int> CreateRoleName(Role role);
        Task<IEnumerable<RolesListResponseDto?>> GetRoles();
    }
}
