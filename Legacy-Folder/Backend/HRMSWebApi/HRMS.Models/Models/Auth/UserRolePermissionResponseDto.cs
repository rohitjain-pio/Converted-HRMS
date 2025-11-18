using HRMS.Models.Models.Role;

namespace HRMS.Models.Models.Auth
{
    public class UserRolePermissionResponseDto
    {
        public List<ModuleDto> Modules { get; set; } = new List<ModuleDto>();
    }
}
