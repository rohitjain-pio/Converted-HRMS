using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.CompanyPolicy
{
    public class CompanyPolicyFileDto
    {
        public required string FileName { get; set; }
        public required string FileOriginalName { get; set; }
    }
}