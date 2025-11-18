namespace HRMS.Models.Models.Employees
{
    public class AccountClearanceResponseDTO
    {
        public int ResignationId { get; set; }
        public bool? FnFStatus { get; set; }            
        public decimal? FnFAmount { get; set; }          
        public bool? IssueNoDueCertificate { get; set; }
        public string Note { get; set; }
        public string AccountAttachment { get; set; }     
        
    }
}
