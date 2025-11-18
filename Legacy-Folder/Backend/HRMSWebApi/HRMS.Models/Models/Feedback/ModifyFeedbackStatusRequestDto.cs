using Microsoft.AspNetCore.Http;

namespace HRMS.Application
{
    public class ModifyFeedbackStatusRequestDto
    {
        public long Id { get; set; }
        public byte TicketStatus { get; set; }
        public string? AdminComment { get; set; }
    }
}