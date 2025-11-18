using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class DepartmentClearance : BaseEntity
    {

        public int ResignationId { get; set; }
        public KTStatus KTStatus { get; set; }
        public string KTNotes { get; set; }
        public string Attachment { get; set; }
        public string KTUsers { get; set; }
        public string FileOriginalName { get; set; }

    }
}
