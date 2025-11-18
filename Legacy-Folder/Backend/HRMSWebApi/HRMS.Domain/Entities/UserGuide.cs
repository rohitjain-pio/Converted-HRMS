using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class UserGuide : BaseEntity
    {
        public long MenuId { get; set; }
        public int? RoleId { get; set; }
        public required string Content { get; set; }
        public required UserGuideStatus Status { get; set; }
        public required string Title { get; set; }

      
    }
}