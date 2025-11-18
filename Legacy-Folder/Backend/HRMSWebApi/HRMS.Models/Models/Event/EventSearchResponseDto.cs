using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Event
{
    public class EventSearchResponseDto
    {
        public EventSearchResponseDto()
        {
            EventList = new List<EventlistResponseDto>();
        }
        public IEnumerable<EventlistResponseDto> EventList { get; set; }
        public int TotalRecords { get; set; }
    }
}