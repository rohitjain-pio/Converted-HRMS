using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.UserGuide
{
    public class UserGuideResponseDto
    {
        public long Id { get; set; }
        public required string MenuName { get; set; }
        public int? RoleId { get; set; }
        public required string Content { get; set; }
        public UserGuideStatus Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public required string ModifiedBy { get; set; }
        public string? Title { get; set; }
    }
}