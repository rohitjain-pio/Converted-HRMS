using HRMS.Domain.Enums;

namespace HRMS.Models.Models.DevTools
{
    public class RunCronRequestDto
    {
        public CronType Type { get; set; }
        public Dictionary<string, dynamic> Data { get; set; }
    }
}
