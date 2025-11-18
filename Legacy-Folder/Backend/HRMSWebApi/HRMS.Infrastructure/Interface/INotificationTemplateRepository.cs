using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Domain.Enums;

namespace HRMS.Infrastructure.Interface
{
    public interface INotificationTemplateRepository : IGenericRepository<NotificationTemplate>
    {
        Task<EmailTemplateSearchResponseDto> FilterEmailTemplatesAsync(SearchRequestDto<EmailTemplateSearchRequestDto> requestDto);
        Task ChangeEmailTemplateStatus(long id, EmailTemplateStatus status);
        Task<NotificationTemplate?> GetDefaultEmailTemplateAsync(EmailTemplateTypes type);
        Task<bool> IsAnotherTemplateActive(EmailTemplateTypes type, long currentId);
        Task<NotificationTemplate?> GetNotificationTemplateByType(EmailTemplateTypes type);
        Task<bool>DeleteTemplateAsync(long id);
    }
}
