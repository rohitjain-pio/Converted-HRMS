namespace HRMS.Domain.Entities
{
    public class DocumentType :BaseEntity
    {
        public string Name { get; set; }
        public int IdProofFor { get; set; }
        public bool IsExpiryDateRequired { get; set; }
    }
}
