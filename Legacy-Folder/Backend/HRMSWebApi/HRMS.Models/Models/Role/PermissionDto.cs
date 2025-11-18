namespace HRMS.Models.Models.Role
{
    public class PermissionDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = null!;
        public bool IsActive { get; set; }
        public string PermissionValue { get; set; } = null!;
    }
}
