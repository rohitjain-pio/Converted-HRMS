namespace HRMS.Domain.Entities
{
    public class HRClearance : BaseEntity
    {

        public int ResignationId { get; set; }
        public decimal AdvanceBonusRecoveryAmount { get; set; }
        public string ServiceAgreementDetails { get; set; }
        public decimal CurrentEL { get; set; }
        public int NumberOfBuyOutDays { get; set; }
        public bool ExitInterviewStatus { get; set; }
        public string ExitInterviewDetails { get; set; }
        public string Attachment { get; set; }
        public string FileOriginalName { get; set; }

    }
}

