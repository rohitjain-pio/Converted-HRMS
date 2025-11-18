using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Employees
{
    public class ITClearanceRequestDTO
    {
        public long EmployeeId { get; set; }
        public int ResignationId { get; set; }
        public bool AccessRevoked { get; set; }
        public bool AssetReturned { get; set; }      
        public int AssetCondition { get; set; }    
        public IFormFile? AttachmentUrl { get; set; }
        public string Note { get; set; }
        public bool ITClearanceCertification { get; set; } = false;
        
    }
}
