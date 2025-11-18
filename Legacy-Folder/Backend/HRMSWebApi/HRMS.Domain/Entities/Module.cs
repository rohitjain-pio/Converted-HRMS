namespace HRMS.Domain.Entities
{
    public class Module : BaseEntity
    {

        public string ModuleName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        
    }
}
