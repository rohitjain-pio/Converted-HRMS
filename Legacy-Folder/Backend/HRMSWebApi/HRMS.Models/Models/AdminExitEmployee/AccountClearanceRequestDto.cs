using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Employees
{
    public class AccountClearanceRequestDto
    {
        public long EmployeeId { get; set; }
        public int ResignationId { get; set; }
        public bool FnFStatus { get; set; }
        public decimal FnFAmount { get; set; }
        public bool IssueNoDueCertificate { get; set; } = false;
        public string? Note { get; set; }
        public IFormFile? AccountAttachment { get; set; }
       
    }

}
