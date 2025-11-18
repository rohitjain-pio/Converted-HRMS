using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Domain.Entities;

namespace HRMS.Application.Services.Interfaces
{
    public interface INotificationTemplateService
    {
        Task<ApiResponseModel<CrudResult>> AddEmailTemplate(EmailTemplateUpdateRequestDto request);
        Task<ApiResponseModel<EmailTemplateSearchResponseDto>> FilterEmailTemplates(SearchRequestDto<EmailTemplateSearchRequestDto> requestDto);
        Task<ApiResponseModel<NotificationTemplate>> GetEmailTemplateById(long id);
        Task<ApiResponseModel<List<EmailTemplateDto>>> GetEmailTemplateNameList();
        Task<ApiResponseModel<CrudResult>> UpdateEmailTemplate(EmailTemplateUpdateRequestDto request);
        Task<ApiResponseModel<CrudResult>> ToggleEmailTemplateStatus(long id);
        Task<ApiResponseModel<NotificationTemplate?>> GetDefaultEmailTemplate(EmailTemplateTypes type);
        Task<ApiResponseModel<CrudResult>> DeleteTemplateAsync(long id);
    }
}
