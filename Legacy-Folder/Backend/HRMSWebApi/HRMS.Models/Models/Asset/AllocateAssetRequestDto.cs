using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
    public class AllocateAssetRequestDto
    {

        public long EmployeeId { get; set; }
        public long Id { get; set; }
        public string? Note { get; set; } = string.Empty;
        public AssetStatus AssetStatus { get; set; }
        public AssetCondition AssetCondition { get; set; }


    }
}
