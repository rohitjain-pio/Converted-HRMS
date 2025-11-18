using HRMS.Domain.Entities;
using System.Text.Json.Serialization;

namespace HRMS.Models.Models.Role
{
    public class ModuleDto
    {
       
        public int ModuleId { get; set; }
        public string? ModuleName { get; set; }
        public bool IsActive { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
        [JsonIgnore]
        public string? PermissionJson { get; set; }

    }
}
