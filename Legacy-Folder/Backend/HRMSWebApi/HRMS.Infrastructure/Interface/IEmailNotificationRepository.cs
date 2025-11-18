
using HRMS.Domain.Enums;
using HRMS.Models.Models.EmailNotificationTemplate;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.Grievance;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models.Models.SystemNotification;

namespace HRMS.Infrastructure.Interface
{
    public interface IEmailNotificationRepository
    {
        Task<IEnumerable<BirthdayDto>> GetBithdayData();
        Task<IEnumerable<AnniversaryDto>> GetAnniversaryData();
        Task<EmailTemplateResponseDto?> GetNotificationTemplateByName(string name);
        Task<int> AddNotificationAsync(EmailNotification notification);
        Task<IEnumerable<EmailNotification>> GetNotificationAsync();
        Task<int> MarkAsSentAsync(long Id);
        Task<IEnumerable<WelcomeDto>> GetWelcomeData(string email);
        Task<IEnumerable<ResignationDto>> GetApprovedResignationsAsync(long resignationId);
        Task<AppliedLeaveDto> GetAppliedLeaveAsync(long employeeId, int leaveId);
        Task<IEnumerable<GrievanceDto>> GetGrievanceData(string TicketNo);
        Task<IEnumerable<GrievanceOwnerEmail>> GetGrievanceOwner(string TicketNo);
        Task<ApprovalLeaveDto> GetApprovalLeaveAsync(int appliedLeaveId);
        Task<RejectedLeaveDto> GetRejectedLeaveAsync(int appliedLeaveId);
        Task<ResignationDto> GetResignationAsync(long employeeId);
        Task<ResignationDto> GetResignationByIdAsync(long resignationId);
        Task<IEnumerable<EmailId>> GetAllEmailByRole(Roles role);
        Task<KPIEmail?> KPICompleteData(long planId);
        
       
        
    }
}
