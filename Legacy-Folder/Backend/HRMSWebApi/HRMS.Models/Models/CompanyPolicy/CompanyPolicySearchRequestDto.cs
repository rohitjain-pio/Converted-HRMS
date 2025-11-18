namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicySearchRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public long DocumentCategoryId { get; set; }
        public long StatusId { get; set; }

    }
}
