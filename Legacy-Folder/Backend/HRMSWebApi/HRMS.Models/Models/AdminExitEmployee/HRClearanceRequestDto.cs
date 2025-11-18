using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Employees
{
    public class HRClearanceRequestDto
    {
        public long EmployeeId { get; set; }
        public int ResignationId { get; set; }
        public decimal AdvanceBonusRecoveryAmount { get; set; }
        public string ServiceAgreementDetails { get; set; }
        public decimal CurrentEL { get; set; }
        public int NumberOfBuyOutDays { get; set; }
        public bool ExitInterviewStatus { get; set; }
        public string ExitInterviewDetails { get; set; }
        public IFormFile? Attachment { get; set; }
      
    }
}
