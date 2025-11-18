namespace HRMS.Domain.Entities
{
    public class UserGroupMapping : BaseEntity
    {
        public  EmployeeData? EmployeeId { get; set; }
        public  Group GroupId { get; set; }        
    }
}
