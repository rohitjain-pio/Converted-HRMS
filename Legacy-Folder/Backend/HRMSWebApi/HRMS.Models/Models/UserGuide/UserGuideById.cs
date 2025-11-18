using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.UserGuide
{
    public class UserGuideById
    {

        public long Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public UserGuideStatus Status { get; set; }
        public long MenuId { get; set; }
        public int? RoleId { get; set; }
    }
}