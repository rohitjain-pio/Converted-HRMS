namespace HRMS.Models.Models.RolePermission
{
    public class RolePermissionRequestDto
    {
        public int RoleId { get; set; }
        public string?  RoleName { get; set; }
        public bool IsRoleNameUpdate { get; set; }
        public bool IsRolePermissionUpdate { get; set; }
        public IEnumerable<int> PermissionList { get; set; } = new List<int>();
    }
}
