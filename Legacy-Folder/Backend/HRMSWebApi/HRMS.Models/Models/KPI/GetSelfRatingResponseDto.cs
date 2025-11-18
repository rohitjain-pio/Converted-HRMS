using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class GetSelfRatingResponseDto
    {
        public string EmployeeCode { get; set; }
        public string? EmployeeName{ get; set; }
        public string? Email { get; set; }
        public long EmployeeId { get; set; }
        public long PlanId { get; set; }
        public DateOnly? ReviewDate { get; set; }
        public bool? IsReviewed { get; set;}
        public DateOnly? JoiningDate { get; set; }
        public DateOnly? LastAppraisal { get; set; }
        public DateOnly? NextAppraisal { get; set; }
        public List<GetSelfRatingListDto> Ratings { get; set; }
        
    }
}
