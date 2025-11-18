using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class EmployeeByManagerResponse
    {
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public DateOnly? NextAppraisalDate { get; set; }
        public DateOnly? LastReviewDate { get; set; }
        public long PlanId { get; set; }
        public string? Email { get; set; }
        public long? EmployeeId { get; set; }
        public DateOnly? JoiningDate { get; set; }
        public DateOnly? ReviewDate { get; set; }
        public bool? IsReviewed { get; set; }
        
    }
}
