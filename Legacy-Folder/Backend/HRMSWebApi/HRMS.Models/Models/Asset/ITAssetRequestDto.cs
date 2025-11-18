using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Asset
{
    public class ITAssetRequestDto
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
        public DateOnly PurchaseDate { get; set; }
        public DateOnly? WarrantyExpires { get; set; }
        public string? Specification { get; set; }
        public string? Comments { get; set; }
        public long? EmployeeId { get; set; }
        public string? Note { get; set; }
        public bool? isAllocated { get; set; } = null;
        // Attachments
        public IFormFile? ProductFileOriginalName { get; set; }
        public IFormFile? SignatureFileOriginalName { get; set; }
    }
}
