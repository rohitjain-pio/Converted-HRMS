namespace HRMS.Domain.Entities
{
    public class UserRoleMapping : BaseEntity
    {
        public virtual Role RoleId { get; set; }
        public virtual EmployeeData EmployeeId { get; set; }
    }
}
