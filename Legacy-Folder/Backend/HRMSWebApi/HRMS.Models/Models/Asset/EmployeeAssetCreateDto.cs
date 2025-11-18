namespace HRMS.Models.Models.Asset
{
    public class EmployeeAssetCreateDto
    {

        public long EmployeeId { get; set; }
        public long AssetId { get; set; }
        public DateOnly AssignedOn { get; set; }
        public bool IsActive { get; set; } = false;      

    }
}
