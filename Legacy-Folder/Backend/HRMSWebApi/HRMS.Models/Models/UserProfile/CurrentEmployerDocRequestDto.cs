using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.UserProfile
{
    public class CurrentEmployerDocRequestDto
    {
        public long EmployeeId { get; set; }
        public int EmployeeDocumentTypeId { get; set; }
        public IFormFile? File { get; set; }
    }
}
