namespace HRMS.Models.Models.CompanyPolicy
{
    public class UserCompanyPolicyTrackResponseDto
    {
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CompanyPolicyName { get; set; } = string.Empty;
        public DateTime ViewedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
    }
}