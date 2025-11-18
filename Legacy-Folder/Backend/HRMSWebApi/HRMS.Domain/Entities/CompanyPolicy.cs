namespace HRMS.Domain.Entities
{
    public class CompanyPolicy :BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string FileName { get; set; }
        public string FileOriginalName { get; set; }
        public long DocumentCategoryId { get; set; } 
        public DateTime? EffectiveDate { get; set; }
        public int VersionNo { get; set; } 
        public long StatusId { get; set; } 
        public bool Accessibility { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string Description { get; set; }
        
    }
}
