namespace HRMS.Domain.Entities
{
    public class Permission :BaseEntity
    {
        public string Name { get; set; }
        public int ModuleId { get; set; }
    }
}
