using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Http;
namespace HRMS.Models.Models.Grievance
{
    public class UpdateGrievanceRemarksRequestDto
    {
        public long TicketId { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public IFormFile? Attachment { get; set; }
        public GrievanceStatus Status { get; set; } 
    }


}