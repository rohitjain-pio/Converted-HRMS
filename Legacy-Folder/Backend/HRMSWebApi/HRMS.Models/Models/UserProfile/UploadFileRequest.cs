using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.UserProfile
{
    public class UploadFileRequest
    {
        public int userId { get; set; }
        public IFormFile file { get; set; } = null!;
    }
}
