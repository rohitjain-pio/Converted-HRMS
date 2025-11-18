using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
        public class ITAssetHistory : BaseEntity
        {
                public long AssetId { get; set; }
                public long EmployeeId { get; set; }
                public string? Note { get; set; }
                public AssetStatus Status { get; set; }
                public Enums.AssetCondition AssetCondition { get; set; } = Enums.AssetCondition.Ok;
                public DateOnly? IssueDate { get; set; }
                public DateOnly? ReturnDate { get; set; }
           
    
    }
}
