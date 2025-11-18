using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Asset
{
  public class ITAssetSearchRequestDto
  {

    public string? DeviceName { get; set; }
    public string? DeviceCode { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public AssetStatus? AssetStatus { get; set; }
    public AssetType? AssetType { get; set; }
    public BranchLocation? Branch { get; set; }
     public string? EmployeeCodes { get; set; }
    
   
  }
}
