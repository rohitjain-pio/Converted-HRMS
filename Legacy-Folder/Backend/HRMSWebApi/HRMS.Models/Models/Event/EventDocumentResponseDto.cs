using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Event
{
    public class EventDocumentResponseDto
    {
        public long Id { get; set; }
        public long EventId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;  
        public DateTime CreatedOn { get; set; }
    }
}
