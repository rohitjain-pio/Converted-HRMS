using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicyRequestDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IFormFile? FileContent { get; set; }
        public long DocumentCategoryId { get; set; }
        public long StatusId { get; set; }
        public bool Accessibility { get; set; }
        public string? Description { get; set; }
        public bool EmailRequest { get; set; }
    }
}
