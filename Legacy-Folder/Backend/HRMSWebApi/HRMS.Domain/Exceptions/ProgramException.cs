using HRMS.Domain.Contants;
using HRMS.Domain.Enums;

namespace HRMS.Domain.Exceptions
{
    public static class ProgramException
    {
        public static UserFriendlyException AppsettingNotSetException()
            => new(ErrorCode.Internal, ErrorMessage.AppConfigurationMessage);
    }
}
