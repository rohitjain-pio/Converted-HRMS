namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicyResponseDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;        
        public int VersionNo { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public string Description { get; set; } 
        public bool Accessibility { get; set; } 
        public DateTime EffectiveDate { get; set; }
        public long StatusId { get; set; } 
        public string FileName { get; set; } 
        public string FileOriginalName { get; set; }
        public string Status { get; set; }
        public int DocumentCategoryId { get; set; }
    
    }
}
