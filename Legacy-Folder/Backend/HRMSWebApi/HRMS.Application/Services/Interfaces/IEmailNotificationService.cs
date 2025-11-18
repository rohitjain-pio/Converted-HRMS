using HRMS.Models.Models.Employees;

namespace HRMS.Application.Services.Interfaces
{
    public interface IEmailNotificationService
    {
        Task AddBirthdayEmailAsync();
        Task AddWorkAnniversaryEmailAsync();
        Task SendNotificationAsync();
        Task AddWelcomeEmailAsync(string email);
        Task AddResignationApprovedEmailAsync(long resignationId);
        Task GrievanceResolvedEmailAsync(string TicketNo);
        Task LeaveAppliedEmailAsync(long EmployeeId, int leaveId);
        Task LeaveApprovalEmailAsync(int AppliedLeaveId);
        Task LeaveRejectionEmailAsync(int AppliedLeaveId);
        Task ResignationSubmitted(long EmployeeId);
        Task ResignationRejected(long resignationId);
        Task EarlyReleaseRequested(long resignationId);
        Task EarlyReleaseApproved(long resignationId, bool IsEarlyRequestApproved);
        Task AccountClearance(int resignationId, bool IssueNoDueCertificate, bool FnFStatus);
        Task ITClearance(ITClearanceRequestDTO iTClearanceRequestDTO);
        Task GrievanceSubmittedEmailAsync(string TicketNo);
        Task NewRoleAddedAsync(string RoleName, DateTime CreatedOn);
        Task UpdatedPolicy(string PolicyName, bool IsEdit);
        Task KPIComplete(long planId);
        Task FeedbackSubmittedEmailAsync(long feedbackId);
        Task FeedbackStatusChangedEmailAsync(long feedbackId);  
        
        

        
        
    }
}
