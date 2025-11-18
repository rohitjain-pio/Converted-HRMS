namespace HRMS.Domain.Entities
{
    public class ITClearance :BaseEntity
    {
    
        public int ResignationId { get; set; }
        public bool AccessRevoked { get; set; }
        public bool AssetReturned { get; set; }
        public string AssetCondition { get; set; }
        public string AttachmentUrl { get; set; }
        public string Note { get; set; }
        public bool ITClearanceCertification { get; set; }
        public string FileOriginalName { get; set; }

    }


}
