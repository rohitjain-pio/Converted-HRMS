using HRMS.API.Job;
using HRMS.API.Middlewares;
using HRMS.Application;
using HRMS.Application.Clients.EmailQueue;
using HRMS.Domain;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Infrastructure;
using Microsoft.Extensions.Hosting;
using OfficeOpenXml;
using Quartz;
using Serilog;
using Serilog.Extensions.Logging;
using System.Configuration;

namespace HRMS.API.Extensions
{
    public static class HostingExtensions
    {
        public static WebApplication ConfigureServices(this WebApplicationBuilder builder, AppSettings configuration)
        {
            builder.Services.AddInfrastructuresService(configuration);
            builder.Services.AddApplicationService();
            builder.Services.AddWebAPIService(configuration);
            builder.Services.Configure<FilePathOptions>(builder.Configuration.GetSection("PhysicalPathLocation"));
            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtConfig"));
            builder.Services.Configure<AppConfigOptions>(builder.Configuration.GetSection("AppConfig"));
            builder.Services.Configure<List<UserCredentials>>(builder.Configuration.GetSection("Authentication:UserCredentials"));
            builder.Services.Configure<JobTypeOptions>(builder.Configuration.GetSection("JobTypeDurations"));
            builder.Services.Configure<EmailSMTPSettings>(builder.Configuration.GetSection("EmailSMTPSettings"));
            builder.Services.Configure<LeavesAccrualOptions>(builder.Configuration.GetSection("LeavesAccrual"));


            builder.Services.AddJWTService(builder.Configuration.GetSection("JwtConfig").Get<JwtOptions>());
            builder.Services.Configure<SystemEmailConfig>(builder.Configuration.GetSection("SystemEmailConfig"));
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;




            Log.Logger = new LoggerConfiguration().ReadFrom.Configuration(builder.Configuration).CreateLogger();
            Microsoft.Extensions.Logging.ILogger sharedLogger = new SerilogLoggerProvider(Log.Logger).CreateLogger(nameof(Serilog));
            builder.Services.AddSingleton(sharedLogger); // microsoft ILogger
            builder.Services.AddSingleton(Log.Logger); // serilog ILogger
            builder.Services.AddLogging();

            builder.Services.AddQuartz(q => {               
                q.UseMicrosoftDependencyInjectionJobFactory();              
                var saveNotificationJob = new JobKey(QuartzConstants.SaveNotificationJobKey);              
                q.AddJob<SaveEmailNotificationJob>(opts => opts.WithIdentity(saveNotificationJob));
                q.AddTrigger(opts => opts
                        .ForJob(saveNotificationJob)
                        .WithIdentity(QuartzConstants.SaveNotificationJobIdentity)
                        .WithCronSchedule(builder.Configuration["NotificationJob:SaveNotificationJob:CronSchedule"]));

                var sendEmailNotificationJob = new JobKey(QuartzConstants.SendEmailNotificationJobKey);
                q.AddJob<SendEmailNotificationJob>(opts => opts.WithIdentity(sendEmailNotificationJob));
                q.AddTrigger(opts => opts
                        .ForJob(sendEmailNotificationJob)
                        .WithIdentity(QuartzConstants.SendEmailNotificationJobIdentity)
                        .WithCronSchedule(builder.Configuration["NotificationJob:SentNotificationJob:CronSchedule"]));

                var fetchTimeDoctorTimeSheetJob = new JobKey(QuartzConstants.FetchTimeDoctorTimeSheetJobKey);
                q.AddJob<FetchTimeDoctorTimeSheetJob>(opts => opts.WithIdentity(fetchTimeDoctorTimeSheetJob));
                q.AddTrigger(opts => opts
                        .ForJob(fetchTimeDoctorTimeSheetJob)
                        .WithIdentity(QuartzConstants.FetchTimeDoctorTimeSheetJobIdentity)
                        .WithCronSchedule(builder.Configuration["OtherJobs:FetchTimeDoctorTimeSheetJob:CronSchedule"]));

                var monthlyCreditLeaveBalanceJob = new JobKey(QuartzConstants.MonthlyCreditLeaveBalanceJobKey);
                q.AddJob<MonthlyCreditLeaveBalanceJob>(opts => opts.WithIdentity(monthlyCreditLeaveBalanceJob));
                q.AddTrigger(opts => opts
                        .ForJob(monthlyCreditLeaveBalanceJob)
                        .WithIdentity(QuartzConstants.MonthlyCreditLeaveBalanceJobIdentity)
                        .WithCronSchedule(builder.Configuration["OtherJobs:MonthlyCreditLeaveBalanceJob:CronSchedule"]));

                var GrievanceLevelUpdateJob = new JobKey(QuartzConstants.GrievanceLevelUpdateJobKey);
                q.AddJob<GrievanceLevelUpdateJob>(opts => opts.WithIdentity(GrievanceLevelUpdateJob));
                q.AddTrigger(opts => opts
                        .ForJob(GrievanceLevelUpdateJob)
                        .WithIdentity(QuartzConstants.GrievanceLevelUpdateJobIdentity)
                        .WithCronSchedule(builder.Configuration["Grievance:GrievanceLevelUpdateJob:CronSchedule"]));

                var CompOffExpire = new JobKey(QuartzConstants.CompOffExpireJobKey);
                q.AddJob<CompOffExpireJob>(opts => opts.WithIdentity(CompOffExpire));
                q.AddTrigger(opts => opts
                        .ForJob(CompOffExpire)
                        .WithIdentity(QuartzConstants.CompOffExpireJobIdentity)
                        .WithCronSchedule(builder.Configuration["CompOff:CompOffExpire:CronSchedule"]));

            });


            builder.Services.AddHostedService<QueuedEmailSenderService>();
            builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);
            builder.Services.AddHttpContextAccessor();
            return builder.Build();
        }
        public static async Task<WebApplication> ConfigurePipelineAsync(this WebApplication app, AppSettings configuration)
        {
          
            app.UseSwagger();
            app.UseSwaggerUI(su =>
            {
                su.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                su.DisplayRequestDuration();
            });
            app.UseStaticFiles();
            app.UseCors("AllowSpecificOrigin");

            app.UseResponseCompression();

            app.UseResponseCompression();

            app.UseHttpsRedirection();

            app.UseMiddleware<ApiResponseMiddleware>();
            app.ConfigureExceptionHandler(Log.Logger, app.Environment);
            app.UseMiddleware<ApiKeyMiddleWare>();
            app.UseAuthentication();
            app.UseAuthorization();           
            app.MapControllers();
           
            return app;
        }
    }
}
