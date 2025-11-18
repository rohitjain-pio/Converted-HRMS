using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
    public class EmployeeITAssetResponseDto
    {
        public long AssetId { get; set; }
        public string SerialNumber { get; set; } = string.Empty;

        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public AssetType AssetType { get; set; }
        public BranchLocation? Branch { get; set; }
        public string AssignedBy { get; set; } = string.Empty;
        public DateOnly AssignedOn { get; set; }
        public AssetStatus AssetStatus { get; set; }
        public AssetCondition AssetCondition { get; set; }
        public DateOnly? ReturnDate { get; set; }
  
    }
}
