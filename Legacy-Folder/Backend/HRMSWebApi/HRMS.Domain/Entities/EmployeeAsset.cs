using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class EmployeeAsset : BaseEntity
    {
        public long EmployeeId { get; set; }
        public long AssetId { get; set; }
        public DateOnly AssignedOn { get; set; }
        public bool IsActive { get; set; }
      
        public Enums.AssetCondition AssetCondition { get; set; }
        public AssetStatus AssetStatus { get; set; }
        public DateOnly ReturnDate { get; set; }
        
          

    }

}
