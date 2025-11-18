using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class Resignation : BaseEntity
    {
        public long EmployeeId { get; set; }
        public long DepartmentId { get; set; }
        public string Reason { get; set; }
        public string RejectResignationReason { get; set; }
        public string RejectEarlyReleaseReason { get; set; }
        public DateOnly LastWorkingDay { get; set; }
        public long ReportingManagerId { get; set; }
        public JobType JobType { get; set; }
        public bool IsActive { get; set; } = true;
        public ResignationStatus ResignationStatus { get; set; } = ResignationStatus.Pending;
        public EarlyReleaseStatus EarlyReleaseStatus { get; set; }



    }
}

