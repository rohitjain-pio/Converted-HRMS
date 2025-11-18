using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Employees
{
    public class ITClearanceResponseDTO
    {
        
        public int ResignationId { get; set; }
        public bool AccessRevoked { get; set; }
        public bool AssetReturned { get; set; }      
        public AssetCondition AssetCondition { get; set; }    
        public string AttachmentUrl { get; set; }
        public string Note { get; set; }
        public bool ITClearanceCertification { get; set; }
        
    }
}
