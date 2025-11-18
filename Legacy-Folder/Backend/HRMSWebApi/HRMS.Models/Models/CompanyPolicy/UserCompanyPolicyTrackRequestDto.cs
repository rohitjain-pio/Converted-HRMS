namespace HRMS.Models.Models.CompanyPolicy
{
    public class UserCompanyPolicyTrackRequestDto
    {
        public long CompanyPolicyId { get; set; }
        public long EmployeeId { get; set; }
        public string FileName { get; set; } = string.Empty;
    }
}