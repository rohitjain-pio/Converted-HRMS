using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
    public class ITAssetHistoryResponseDto
    {
        public string EmployeeName { get; set; }
        public string Custodian { get; set; } //EmployeeEmail
        public AssetStatus AssetStatus { get; set; }
        public AssetCondition AssetCondition { get; set; }
        public string? Note { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateOnly? IssueDate { get; set; }
        public DateOnly? ReturnDate { get; set; }
        
  
    }
}
