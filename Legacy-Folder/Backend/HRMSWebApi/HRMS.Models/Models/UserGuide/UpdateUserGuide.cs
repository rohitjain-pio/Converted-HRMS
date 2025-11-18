using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.UserGuide
{
    public class UpdateUserGuide
    {
        public long Id { get; set; }
        public string? Content { get; set; }
        public UserGuideStatus? Status { get; set; }
        public int? RoleId { get; set; }
        public string? Title { get; set; }
    }
}