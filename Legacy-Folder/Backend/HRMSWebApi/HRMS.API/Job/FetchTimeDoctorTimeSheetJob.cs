using Azure;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models.Models.Attendance.TimeDoctorStatsJob;
using Quartz;
using System.Net;
using System.Text.Json;
using System.Web;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMS.API.Job
{
    public class FetchTimeDoctorTimeSheetJob : IJob
    {
        public readonly IUnitOfWork unitOfWork;
        public readonly IAttendanceService attendanceService;
        public readonly HttpClient client;
        public readonly Serilog.ILogger logger;
        public readonly IDevToolService devToolService;
        public FetchTimeDoctorTimeSheetJob(IUnitOfWork _unitOfWork, IAttendanceService _attendanceService, HttpClient _client, Serilog.ILogger _logger, IDevToolService _devToolService)
        {
            unitOfWork = _unitOfWork;
            attendanceService = _attendanceService;
            client = _client;
            logger = _logger;
            devToolService = _devToolService;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            var builder = new UriBuilder(client.BaseAddress!.OriginalString);
            var query = HttpUtility.ParseQueryString(builder.Query);

            var dataMap = context.MergedJobDataMap;
            var traceId = Guid.NewGuid().ToString();
            var date = DateTime.Today.AddDays(-1);

            try { 
                if (dataMap.Keys.Contains("fetchForDate"))
                {
                    date = DateTime.Parse(dataMap["fetchForDate"].ToString());
                }
                if (dataMap.Keys.Contains("RequestId"))
                {
                    traceId = dataMap["RequestId"].ToString();
                }

                var cronLogId = await devToolService.UpsertCronLog(new CronLog()
                {
                    RequestId = traceId,
                    TypeId = CronType.FetchTimeDoctorTimeSheetStats,
                    Payload = JsonSerializer.Serialize(dataMap.WrappedMap.Where(x => !x.Key.Equals("requestid", StringComparison.CurrentCultureIgnoreCase))),
                    CreatedBy = "admin",
                    CreatedOn = DateTime.UtcNow,
                    StartedAt = DateTime.UtcNow,
                    CompletedAt = null
                });

                DateTime startOfDay = date.Date;
                DateTime endOfDay = date.Date.AddHours(23).AddMinutes(59).AddSeconds(59);

                var users = await unitOfWork.EmploymentDetailRepository.GetEmployeesForTimeDoctorStats(DateOnly.FromDateTime(date));
                if (users.Count() == 0) return;
                //var userTimeDoctorIds = string.Join(",",users.Select(user => user.TimeDoctorUserId).Distinct());

                query["company"] = "YfQJah6-uiOk6nqu";
                query["from"] = startOfDay.ToString("yyyy-MM-ddTHH:mm:ss");
                query["to"] = endOfDay.ToString("yyyy-MM-ddTHH:mm:ss");
                query["user"] = "all";
                query["fields"] = "start,end,userId,total";
                query["group-by"] = "userId";
                query["period"] = "days";
                query["sort"] = "date";
                query["limit"] = "2000";

                builder.Query = query.ToString(); 
                string finalUrl = builder.ToString();

                var response = await client.GetAsync(finalUrl);

            
                if (response.StatusCode != HttpStatusCode.OK)
                {
                    logger.ForContext("RequestId", traceId).Error("Failed to fetch timesheet data - Payload : {0}", JsonSerializer.Serialize(new
                    {
                        Response = response,
                        StartDate = startOfDay,
                        EndDate = endOfDay,
                    }));
                    return;
                }

                response.EnsureSuccessStatusCode();
                var responseBody = await response.Content.ReadAsStringAsync();
          
                var statsData = JsonSerializer.Deserialize<TimesheetSummaryStatsResponse>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                if (statsData == null) throw new Exception(ErrorMessage.FailedToParseTimeSheetSummaryResponse);
                int usersUpdated = 0;
                foreach(var user in users)
                {
                    TimesheetSummaryStatsItemResponse? stat = null;
                    foreach (var stats in statsData.Data)
                    {
                        stat = stats.Where(u => u.UserId == user.TimeDoctorUserId).FirstOrDefault();
                    }
                    if (stat == null) continue;
                    var timeSpan = TimeSpan.FromSeconds(stat.Total);
                    var totalHours = timeSpan.ToString(@"hh\:mm");
                    var audits = new List<AttendanceAudit>
                    {
                        new AttendanceAudit()
                        {
                            CreatedBy = "admin",
                            Action = "Time In",
                            Time = stat.Start.TimeOfDay.ToString(@"hh\:mm")
                        },
                        new AttendanceAudit()
                        {
                            CreatedBy = "admin",
                            Action = "Time Out",
                            Time = stat.End.TimeOfDay.ToString(@"hh\:mm")
                        }
                    };
                    await attendanceService.AddAttendanceTimeDoctorStatAsync(user.EmployeeId, new Attendance
                    {
                        AttendanceType = "TimeDoctor",
                        Date = stat.Date.First().ToLongDateString(), // .ToString("dddd")
                        StartTime = stat.Start.TimeOfDay,
                        EndTime = stat.End.TimeOfDay,
                        TotalHours = totalHours,
                        CreatedBy = "admin",
                        CreatedOn = DateTime.UtcNow,
                        Day = stat.Date.First().DayOfWeek.ToString(),
                        Audit = audits
                    });
                    usersUpdated++;
                }
                await devToolService.UpsertCronLog(new CronLog { Id = cronLogId.Result, CompletedAt = DateTime.UtcNow });
                logger.ForContext("RequestId", traceId).Information("Successfully ran {0}, {1} Users updated", nameof(FetchTimeDoctorTimeSheetJob), usersUpdated);
            } 
            catch (Exception e)
            {
                logger.ForContext("RequestId", traceId).Error(e, "{0}", e.Message);
            }
        }
    }
}
