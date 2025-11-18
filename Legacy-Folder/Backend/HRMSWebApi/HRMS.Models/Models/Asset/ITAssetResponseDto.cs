using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
    public class ITAssetResponseDto
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
        public BranchLocation Branch { get; set; }
        public AssetCondition AssetCondition { get; set; }
        public DateOnly? PurchaseDate { get; set; }
        public DateOnly? WarrantyExpires { get; set; }
        public string Comments { get; set; }
        public DateTime ModifiedOn { get; set; }
        public string Specification { get; set; }
        public CustodianDto? Custodian { get; set; }

         //properties for file info
        public string? ProductFileOriginalName { get; set; }
        public string? ProductFileName { get; set; }
        public string? SignatureFileOriginalName { get; set; }
        public string? SignatureFileName { get; set; }


    }

}
 