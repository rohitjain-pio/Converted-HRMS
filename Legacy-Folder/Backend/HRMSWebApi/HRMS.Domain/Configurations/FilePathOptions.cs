using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Domain.Configurations
{
    public class FilePathOptions
    {
        public string PolicyDirectoryLocation { get; set; } = string.Empty;
        public string ProfileDirectoryLocation { get; set; } = string.Empty;
        public string EventDirectoryLocation { get; set; } = string.Empty;
        public string EventBannerDirectoryLocation { get; set; } = string.Empty;
    }
}
