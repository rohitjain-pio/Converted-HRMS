using HRMS.Application.Clients;
using HRMS.Application.Clients.EmailQueue;
using HRMS.Application.Clients.Interfaces;
using HRMS.Application.Mappings;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;


namespace HRMS.Application
{
    public static class ConfigureServices
    {
        public static IServiceCollection AddApplicationService(this IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            services.AddAutoMapper(typeof(MapProfile));
            services.AddScoped<ICompanyPolicyService, CompanyPolicyService>();
            services.AddScoped<IEmployeeGroupService, EmployeeGroupService>();
            services.AddScoped<IRolePermissionService, RolePermissionService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IRolePermissionService, RolePermissionService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IUserProfileService, UserProfileService>();
            services.AddScoped<IEventService, EventService>();
            services.AddScoped<INotificationTemplateService, NotificationTemplateService>();
            services.AddScoped<IEmploymentDetailService, EmploymentDetailService>();
            services.AddScoped<INomineeService, NomineeService>();
            services.AddScoped<IEducationalDetailService, EducationalDetailService>();
            services.AddScoped<ICertificateService, CertificateService>();
            services.AddScoped<ISurveyService, SurveyService>();
            services.AddScoped<IPreviousEmployerService, PreviousEmployerService>();
            services.AddScoped<IProfessionalReferenceService, ProfessionalReferenceService>();           
            services.AddScoped<IEmailNotificationService, EmailNotificationService>();
            services.AddScoped<IEmailSenderService, EmailSenderService>();
            services.AddScoped<IAttendanceService,AttendanceService>();
            services.AddScoped<IExitEmployeeService, ExitEmployeeService>(); 
            services.AddScoped<IAdminExitEmployeeService, AdminExitEmployeeService>();
            services.AddScoped<ILeaveManangementService,LeaveManagementService>();
            services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>(); // Singleton for background service compatibility
            services.AddSingleton<IEmailClient, EmailClientSmtpPooled>(); // change implementation of email client as needed
            services.AddScoped<IAssetManagementService,AssetManagementService>();
            services.AddScoped<IGrievanceService,GrievanceService>();
            services.AddScoped<IKPIService, KPIService>();
            services.AddScoped<IDevToolService, DevToolService>();
            services.AddScoped<IUserGuideService, UserGuideService>();
            services.AddScoped<IFeedbackService, FeedbackService>();

            return services;
        }
    }
}
