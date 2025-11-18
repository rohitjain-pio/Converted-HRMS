namespace HRMS.Domain.Entities
{
    public class CompanyPolicyHistory
    {
        public long Id { get; set; }
        public long PolicyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FileName { get; set; }
        public string FileOriginalName { get; set; }
        public string Description { get; set; }
        public long DocumentCategoryId { get; set; }
        public DateTime EffectiveDate { get; set; }
        public int VersionNo { get; set; }
        public long StatusId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public bool Accessibility { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;       
    }
}
