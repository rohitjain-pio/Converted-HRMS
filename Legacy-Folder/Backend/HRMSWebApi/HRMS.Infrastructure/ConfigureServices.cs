using HRMS.Domain;
using HRMS.Infrastructure.Interface;
using HRMS.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace HRMS.Infrastructure
{
    public static class ConfigureServices
    {
        public static IServiceCollection AddInfrastructuresService(this IServiceCollection services, AppSettings configuration)
        {

            // register services
            services.AddScoped<ICompanyPolicyRepository, CompanyPolicyRepository>();
            services.AddScoped<IEmployeeGroupRepository, EmployeeGroupRepository>();
            services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IUserProfileRepository, UserProfileRepository>();
            services.AddScoped<IDashboardRespository, DashboardRespository>();
            services.AddScoped<IEventRepository, EventRepository>();
            services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
            services.AddScoped<INomineeRepository, NomineeRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IEmploymentDetailRepository, EmploymentDetailRepository>();
            services.AddScoped<IEducationalDetailRepository, EducationalDetailRepository>();
            services.AddScoped<ICertificateRepository, CertificateRepository>();
            services.AddScoped<ISurveyRepository, SurveyRepository>();
            services.AddScoped<IPreviousEmployerRepository, PreviousEmployerRepository>();
            services.AddScoped<IProfessionalReferenceRepository, ProfessionalReferenceRepository>();           
                               
            services.AddScoped<IEmailNotificationRepository, EmailNotificationRepository>();            
            services.AddScoped<IAttendanceRepository, AttendanceRepository>(); 
            services.AddScoped<IExitEmployeeRepository, ExitEmployeeRepository>();   
            services.AddScoped<IAdminExitEmployeeRepository, AdminExitEmployeeRepository>();
            services.AddScoped<ILeaveManagementRepository, LeaveManagementRepository>();
            services.AddScoped<IAssetManagementRepository, AssetManagementRepository>();
            services.AddScoped<IGrievanceRepository, GrievanceRepository>();
            services.AddScoped<IKpiRepository,KPIRepository>();
            services.AddScoped<IDevToolRepository, DevToolRepository>();
            services.AddScoped<IUserGuideRepository, UserGuideRepository>();
            services.AddScoped<IFeedbackRepository, FeedbackRepository>();

            
            return services;
        }
    }
}
