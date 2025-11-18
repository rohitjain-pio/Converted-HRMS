namespace HRMS.Domain.Entities
{
    public class Qualification :BaseEntity
    {
        public string FullName { get; set; }=string.Empty;
        public string ShortName { get; set; } = string.Empty;
    }
}
