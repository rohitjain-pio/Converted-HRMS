using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
    public class ITAssetsListResponseDto
    {
        public long Id { get; set; }
        public string DeviceName { get; set; }
        public string DeviceCode { get; set; }
        public string SerialNumber { get; set; }
        public string InvoiceNumber { get; set; }
        public string Manufacturer { get; set; }
        public string Model { get; set; }
        public AssetType AssetType { get; set; }
        public AssetStatus AssetStatus { get; set; }
        public AssetCondition AssetCondition { get; set; }
        public BranchLocation Branch { get; set; }
        public DateOnly? PurchaseDate { get; set; }
        public DateOnly? WarrantyExpires { get; set; }
        public string Comments { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Specification { get; set; }
        public string Custodian { get; set; }
        public string CustodianFullName { get; set; }
        public string AllocatedBy { get; set; }

       
    }
}
