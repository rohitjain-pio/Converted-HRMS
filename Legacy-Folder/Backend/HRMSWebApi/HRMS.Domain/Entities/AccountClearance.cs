namespace HRMS.Domain.Entities
{
    public class AccountClearance:BaseEntity
    {
        public int ResignationId { get; set; }
        public bool? FnFStatus { get; set; }
        public decimal? FnFAmount { get; set; }
        public bool? IssueNoDueCertificate { get; set; }
        public string Note { get; set; }
        public string AccountAttachment { get; set; }
        public string FileOriginalName { get; set; }
    }



}
