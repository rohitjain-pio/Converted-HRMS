using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Employees
{
    public class DepartmentClearanceRequestDto
    {
        public long EmployeeId { get; set; }
        public int ResignationId { get; set; }
        public KTStatus KTStatus { get; set; }
        public string KTNotes { get; set; }
        public IFormFile? Attachment { get; set; }
        public List<int> KTUsers { get; set; }
    }
}
