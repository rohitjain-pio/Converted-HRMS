using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HRMS.Models.Models.EmployeeReport
{
    public class EmployeeReportDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string BranchName { get; set; }
        public string DepartmentName { get; set; }
        public string TotalHour { get; set; }
        public Dictionary<string, string> WorkedHoursByDate { get; set; } = new Dictionary<string, string>(); // Key: date, Value: hour
        public string? EmployeeEmail { get; set; }
        public int? Branch { get; set; }
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Country { get; set; }
        public DateOnly? JoiningDate { get; set; }
        [JsonIgnore]
        public string WorkedHoursByDateJson { get; set; }
    }
}