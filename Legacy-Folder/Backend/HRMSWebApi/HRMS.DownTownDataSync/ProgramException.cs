using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Domain.Exceptions
{
    public static class ProgramException
    {
        public static UserFriendlyException AppsettingNotSetException()
            => new(ErrorCode.Internal, ErrorMessage.AppConfigurationMessage);
    }
}
