using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class ITAsset : BaseEntity
    {
        public string? DeviceName { get; set; }
        public string? DeviceCode { get; set; }
        public string? SerialNumber { get; set; }
        public string? InvoiceNumber { get; set; }
        public string? Manufacturer { get; set; }
        public string? Model { get; set; }
        public AssetType AssetType { get; set; }
        public AssetStatus Status { get; set; }
        public Enums.AssetCondition AssetCondition { get; set; } = Enums.AssetCondition.Ok;
        public BranchLocation? Branch { get; set; }
        public DateOnly PurchaseDate { get; set; }
        public DateOnly? WarrantyExpires { get; set; }
        public string? Specification { get; set; }
        public string? Comments { get; set; }

        // properties for files
        public string? ProductFileOriginalName { get; set; }
        public string? ProductFileName { get; set; }
        public string? SignatureFileOriginalName { get; set; }
        public string? SignatureFileName { get; set; }
    }
}
