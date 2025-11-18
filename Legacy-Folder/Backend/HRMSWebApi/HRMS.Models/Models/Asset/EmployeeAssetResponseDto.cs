namespace HRMS.Models.Models.Asset
{
    public class EmployeeAssetResponseDto
    {
        public long Id { get; set; }
        public long AssetID { get; set; }
        public bool isActive { get; set; }
        public string AssetName { get; set; }// Asset Type
        public string AssetNumber { get; set; } //Serial number
        public string Brand { get; set; } //Manufacturer
        public string Model { get; set; } //Model
        public string Custodian { get; set; } //EmpId->EmpName and ITAsset ->Email
        public DateTime LastUpdate { get; set; } //ModifiedOn






    }
}
