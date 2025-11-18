using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class KPIGoalRequestDto
    {
        public string? Title { get; set; } = null;
        public long? DepartmentId { get; set; } = null;
        public DateOnly? CreatedOnFrom { get; set; } = null;
        public DateOnly? CreatedOnTo { get; set; } = null;
        public string? CreatedBy { get; set; } = string.Empty;
    }
}
