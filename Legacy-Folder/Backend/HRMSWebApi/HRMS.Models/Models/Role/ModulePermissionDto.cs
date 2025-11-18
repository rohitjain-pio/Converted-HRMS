namespace HRMS.Models.Models.Role
{
    public class ModulePermissionDto
    {
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int ModuleId { get; set; }
        public string? ModuleName { get; set; } = null!;
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = null!;
        public bool IsActive { get; set; }
        public string PermissionValue { get; set; } = null!;
    }
}
