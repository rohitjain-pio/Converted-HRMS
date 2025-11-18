using HRMS.Models.Models.Role;

namespace HRMS.Models.Models.Auth
{
    public class LoginResponseDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string RoleId { get; set; } = null!;
        public string RoleName { get; set; } = null!;
        public string AuthToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public List<MenuResponseDto> Menus { get; set; } = new();
        public UserRolePermissionResponseDto ModulePermissions { get; set; } = new();
        public bool IsReportingManager { get; set; }

    }    
}
