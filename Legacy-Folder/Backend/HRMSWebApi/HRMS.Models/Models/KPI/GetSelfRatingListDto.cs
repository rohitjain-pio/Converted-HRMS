using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class GetSelfRatingListDto
    {
        public long GoalId { get; set; }
        public decimal? Q1_Rating { get; set; }
        public decimal? Q2_Rating { get; set; }
        public decimal? Q3_Rating { get; set; }
        public decimal? Q4_Rating { get; set; }
        public string? Q1_Note { get; set; }
        public string? Q2_Note { get; set; }
        public string? Q3_Note { get; set; }
        public string? Q4_Note { get; set; }
        public decimal? ManagerRating { get; set; }
        public string? ManagerNote { get; set; }
        public string GoalTitle { get; set; }
        public string? TargetExpected { get; set; }
        public bool? Status { get; set; }  
        public string? AllowedQuarter { get; set; }
    }
}
