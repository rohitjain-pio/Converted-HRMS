namespace HRMS.Domain.Entities
{
    public class GrievanceOwner : BaseEntity
    {
        public long GrievanceTypeId { get; set; }
        public byte Level { get; set; }
        public long OwnerID { get; set; }
    }
}