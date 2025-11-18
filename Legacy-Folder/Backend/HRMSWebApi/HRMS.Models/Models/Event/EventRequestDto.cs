using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace HRMS.Models.Models.Event
{
    public class EventRequestDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Venue { get; set; } = string.Empty;
        public long EmpGroupId { get; set; }
        public long EventCategoryId { get; set; }
        public string? EventUrl1 { get; set; } 
        public string? EventUrl2 { get; set; }
        public string? EventUrl3 { get; set; } 
        public int StatusId { get; set; }   
        public IFormFile? BannerFileContent { get; set; } 
        public IFormFile? FileContent { get; set; } 
        public string ?EventFeedbackSurveyLink { get; set; }
    }
}