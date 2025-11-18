using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class LeaveTypeResponseDto
    {
        public long? Id { get; set; }
        public string? Title { get; set; }
        public string? ShortName { get; set; }
        public long? OpeningBalance { get; set; }
    }
}
