using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
    public class ImportAssetExcelDto
    {
        public string? UserName { get; set; }
        public DateOnly AssignedOn { get; set; }
        public string DeviceName { get; set; }
        public string? DeviceCode { get; set; }
        public string? SerialNumber { get; set; }
        public string? InvoiceNumber { get; set; }
        public string? Manufacturer { get; set; }
        public string? Model { get; set; }
        public AssetType AssetType { get; set; }
        public AssetStatus Status { get; set; }
        public BranchLocation? Location { get; set; }
        public DateOnly PurchaseDate { get; set; }
        public DateTime? WarrantyExpires { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Processor { get; set; }
        public int? RAM { get; set; }
        public string? HDD1 { get; set; }
        public string? HDD2 { get; set; }
        public string? Comments { get; set; }
    }



}
