using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Event
{
    public class EventSearchRequestDto
    {
        public string EventName { get; set; } = default!;
        public int StatusId { get; set; } = default!;
    }
}