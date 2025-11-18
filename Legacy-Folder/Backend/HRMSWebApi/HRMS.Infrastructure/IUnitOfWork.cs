using HRMS.Infrastructure.Interface;


namespace HRMS.Infrastructure
{
    public interface IUnitOfWork
    {
        ICompanyPolicyRepository CompanyPolicyRepository { get; }
        IEmployeeGroupRepository EmployeeGroupRepository { get; }
        IAttendanceRepository AttendanceRepository { get; }
        IRolePermissionRepository RolePermissionRepository { get; }
        IAuthRepository AuthRepository { get; }
        IUserProfileRepository UserProfileRepository { get; }
        IEventRepository EventRepository { get; }
        INotificationTemplateRepository NotificationTemplateRepository { get; }
        IEmploymentDetailRepository EmploymentDetailRepository { get; }
        INomineeRepository NomineeRepository { get; }
        IEducationalDetailRepository EducationalDetailRepository { get; }
        ICertificateRepository CertificateRepository { get; }
        ISurveyRepository SurveyRepository { get; }
        IPreviousEmployerRepository PreviousEmployerRepository { get; }
        IProfessionalReferenceRepository ProfessionalReferenceRepository { get; }

        IEmailNotificationRepository EmailNotificationRepository { get; }
        IExitEmployeeRepository ExitEmployeeRepository { get; }
        IAdminExitEmployeeRepository AdminExitEmployeeRepository { get; }
        ILeaveManagementRepository LeaveManagementRepository { get; }
        IAssetManagementRepository AssetManagementRepository { get; }
        IGrievanceRepository GrievanceRepository { get; }
        IKpiRepository KPIRepository { get; }
        IDevToolRepository DevToolRepository { get; }
        IUserGuideRepository UserGuideRepository { get; }
        IFeedbackRepository FeedbackRepository { get; }
    }
}
