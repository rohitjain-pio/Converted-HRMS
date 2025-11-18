using HRMS.Infrastructure.Interface;


namespace HRMS.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        public ICompanyPolicyRepository CompanyPolicyRepository { get; private set; }
        public IEmployeeGroupRepository EmployeeGroupRepository { get; private set; }
        public IRolePermissionRepository RolePermissionRepository { get; private set; }
        public IAuthRepository AuthRepository { get; private set; }
        public IUserProfileRepository UserProfileRepository { get; private set; }
        public IEventRepository EventRepository { get; private set; }
        public INotificationTemplateRepository NotificationTemplateRepository { get; private set; }
        public IEmploymentDetailRepository EmploymentDetailRepository { get; private set; }
        public INomineeRepository NomineeRepository { get; private set; }
        public IEducationalDetailRepository EducationalDetailRepository { get; private set; }
        public ICertificateRepository CertificateRepository { get; private set; }
        public ISurveyRepository SurveyRepository { get; private set; }
        public IPreviousEmployerRepository PreviousEmployerRepository { get; private set; }
        public IAttendanceRepository AttendanceRepository { get; private set; }
        public IProfessionalReferenceRepository ProfessionalReferenceRepository { get; private set; }      
        public IEmailNotificationRepository EmailNotificationRepository { get; private set; }
        public IExitEmployeeRepository ExitEmployeeRepository { get; private set; }
        public IAdminExitEmployeeRepository AdminExitEmployeeRepository { get; }
        public ILeaveManagementRepository LeaveManagementRepository { get; }
        public IAssetManagementRepository AssetManagementRepository { get; }
        public IGrievanceRepository GrievanceRepository { get; }
        public IKpiRepository KPIRepository { get; private set; }
        public IDevToolRepository DevToolRepository { get; }
        public IUserGuideRepository UserGuideRepository { get; }
        public IFeedbackRepository FeedbackRepository { get; }

        public UnitOfWork(ICompanyPolicyRepository CompanyPolicyRepository,
            IEmployeeGroupRepository EmployeeGroupRepository,
            IAuthRepository AuthRepository,
            IRolePermissionRepository RolePermissionRepository,
            IUserProfileRepository UserProfileRepository,
            IEventRepository EventRepository,
            INotificationTemplateRepository notificationTemplateRepository,
            INomineeRepository nomineeRepository,
            IEmploymentDetailRepository employmentDetailRepository,
            IEducationalDetailRepository educationalDetailRepository,
            ICertificateRepository certificateRepository,
            ISurveyRepository surveyRepository,
            IPreviousEmployerRepository previousEmployerRepository,
            IProfessionalReferenceRepository ProfessionalReferenceRepository,
            IEmailNotificationRepository emailNotificationRepository,
            IExitEmployeeRepository ExitEmployeeRepository,
            IAdminExitEmployeeRepository AdminExitEmployeeRepository,
            IAttendanceRepository AttendanceRepository,
            ILeaveManagementRepository LeaveManagementRepository,
            IAssetManagementRepository AssetManagementRepository,
            IGrievanceRepository GrievanceRepository,
            IKpiRepository KPIRepository,
            IDevToolRepository DevToolRepository,
            IUserGuideRepository UserGuideRepository
            ,
            IFeedbackRepository FeedbackRepository
            )
        {
            this.CompanyPolicyRepository = CompanyPolicyRepository;
            this.AttendanceRepository = AttendanceRepository;
            this.EmployeeGroupRepository = EmployeeGroupRepository;
            this.AuthRepository = AuthRepository;
            this.RolePermissionRepository = RolePermissionRepository;
            this.UserProfileRepository = UserProfileRepository;
            this.EventRepository = EventRepository;
            this.NotificationTemplateRepository = notificationTemplateRepository;
            this.NomineeRepository = nomineeRepository;
            this.EmploymentDetailRepository = employmentDetailRepository;
            this.EducationalDetailRepository = educationalDetailRepository;
            this.CertificateRepository = certificateRepository;
            this.SurveyRepository = surveyRepository;
            this.PreviousEmployerRepository = previousEmployerRepository;
            this.ProfessionalReferenceRepository = ProfessionalReferenceRepository;

            this.EmailNotificationRepository = emailNotificationRepository;
            this.ExitEmployeeRepository = ExitEmployeeRepository;
            this.AdminExitEmployeeRepository = AdminExitEmployeeRepository;
            this.LeaveManagementRepository = LeaveManagementRepository;
            this.AssetManagementRepository = AssetManagementRepository;
            this.GrievanceRepository = GrievanceRepository;
            this.KPIRepository = KPIRepository;
            this.DevToolRepository = DevToolRepository;
            this.UserGuideRepository = UserGuideRepository;
            this.FeedbackRepository = FeedbackRepository;
        }
    }
}
