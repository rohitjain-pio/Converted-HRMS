namespace HRMS.Models.Models.Downtown
{
    public class RoleRequest
    {
        public int RoleId { get; set; }
        public long EmployeeId { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public bool IsDeleted { get; set; }
    }
}
