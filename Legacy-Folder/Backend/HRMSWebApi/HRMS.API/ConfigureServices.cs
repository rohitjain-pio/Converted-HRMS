using FluentValidation;
using HRMS.API.Athorization;
using HRMS.API.Extensions;
using HRMS.API.Job;
using HRMS.API.Validations;
using HRMS.Application.Clients;
using HRMS.Domain;
using Microsoft.AspNetCore.Authorization;
using System.Reflection;

namespace HRMS.API
{
    public static class ConfigureServices
    {
        public static IServiceCollection AddWebAPIService(this IServiceCollection services, AppSettings configuration)
        {
            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            services.AddScoped<CompanyPolicyRequestValidation>();
            services.AddScoped<EmployeeGroupRequestValidation>();
            services.AddScoped<LoginRequestValidation>();
            services.AddScoped<NomineeRequestValidation>();
            services.AddScoped<PersonalDetailRequestValidation>();
            services.AddScoped<RolePermissionRequestValidation>();
            services.AddScoped<UploadFileRequestValidation>();
            services.AddScoped<UserDocumentRequestValidation>();
            services.AddScoped<EventRequestValidation>();
            services.AddAuthentication();
            services.AddAuthorization();
            services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
            services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

            // Extension classes
            services.AddHealthChecks();
            services.AddCompressionCustom();
            services.AddCorsCustom(configuration);
            services.AddSwaggerCustom();
            services.AddHttpContextAccessor();
            services.AddHttpClient<GraphApiClient>("GraphApiClient", config =>
            {
                config.BaseAddress = new Uri($"{configuration.HttpClientsUrl.GraphApiUrl}");
                config.Timeout = TimeSpan.FromSeconds(60);
            });
            services.AddHttpClient<DownTownClient>("DownTownClient", config =>
            {
                config.BaseAddress = new Uri($"{configuration.HttpClientsUrl.DownTownApiUrl}");
                config.DefaultRequestHeaders.Add("apitoken", configuration.HttpClientsUrl.DownTownApiToken);
                config.Timeout = TimeSpan.FromSeconds(60);
            });

            services.AddSingleton<BlobStorageClient>();
            services.AddSingleton<TimeDoctorClient>();
            services.AddSingleton<AESPasswordEncryption>();
            services.AddHttpClient<EmailNotificationClient>("EmailNotificationClient", config =>
            {
                config.BaseAddress = new Uri($"{configuration.HttpClientsUrl.EmailNotificationApiUrl}");
                config.DefaultRequestHeaders.Add("apitoken", configuration.HttpClientsUrl.EmailNotificationApiToken);
                config.Timeout = TimeSpan.FromSeconds(60);
            });
            services.AddHttpClient<FetchTimeDoctorTimeSheetJob>("TimeDoctorStatsClient", config =>
            {
                config.BaseAddress = new Uri($"{configuration.HttpClientsUrl.TimeDoctorTimeSheetSummaryStatsUrl}");
                config.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("JWT", configuration.HttpClientsUrl.TimeDoctorApiToken);
            });
            services.AddHttpClient<TimeDoctorClient>("TimeDoctorClient", config =>
            {
                config.BaseAddress = new Uri($"{configuration.HttpClientsUrl.TimeDoctorTimeSheetUsersUrl}");
                config.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("JWT", configuration.HttpClientsUrl.TimeDoctorApiToken);
            });
             services.AddSingleton<IAuthorizationMiddlewareResultHandler, CustomAuthorizationMiddlewareResultHandler>();

            return services;
        }
    }
}
