namespace HRMS.Models.Models.Role
{
    public class ModulePermissionsResponseDto
    {
        public long RoleId { get; set; }
        public string? RoleName { get; set; }
        public List<ModuleDto> Modules { get; set; } = new List<ModuleDto>();
    }
}
