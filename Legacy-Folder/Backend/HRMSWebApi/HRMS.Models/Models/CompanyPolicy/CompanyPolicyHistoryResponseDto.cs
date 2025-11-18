namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicyHistoryResponseDto
    {
        public string Description { get; set; }
        public int VersionNo { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string FileName { get; set; }
        public string FileOriginalName { get; set; }

    }
       
}
