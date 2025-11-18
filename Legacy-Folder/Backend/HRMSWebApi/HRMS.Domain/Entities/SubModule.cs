using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS.Domain.Entities
{
    public class SubModule
    {
        [Column(TypeName = "varchar(250)")]
        public string SubModuleName { get; set; } = string.Empty;
        public virtual Module ModuleId { get; set; }
        public bool Read { get; set; }
        public bool Create { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
        public bool View { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
