using System.ComponentModel;

namespace HRMS.Domain.Enums
{
    public enum BlobDocumentContainerType
    {
        [Description("UserDocument")]
        UserDocumentContainer = 1,
        [Description("EmployerDocument")]
        EmployerDocumentContainer = 2,
    }
}
