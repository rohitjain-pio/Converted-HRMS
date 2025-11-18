using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Grievance
{
    public class EmployeeGrievanceCreateDto
    {
        public long EmployeeId { get; set; }
        public int GrievanceTypeId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public IFormFile? Attachment { get; set; }
        // public byte Level { get; set; }   // 1 = L1, 2 = L2, 3 = L3
    }
}
