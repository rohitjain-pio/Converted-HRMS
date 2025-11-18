using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class CompOffRequestDto
    { 
        public long EmployeeId { get; set; }
        public DateOnly WorkingDate { get; set; }
       // public DateOnly? LeaveDate { get; set; }
        public string? Reason { get; set; }
        // public int Status { get; set; } 
        [JsonIgnore]
        public int RequestType { get; set; }
        public decimal? NumberOfDays { get; set; }

    }
}
