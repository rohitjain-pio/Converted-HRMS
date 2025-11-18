using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using Microsoft.Extensions.Options;
using Quartz;
using System.Diagnostics;
using System.Text.Json;
using static HRMS.Domain.Utility.LeaveBalanceHelper;

namespace HRMS.API.Job
{
    public class MonthlyCreditLeaveBalanceJob(IUnitOfWork unitOfWork, IOptions<LeavesAccrualOptions> _options, IDevToolService devToolService, Serilog.ILogger logger) : IJob
    {
        public readonly LeavesAccrualOptions options = _options.Value;
        public async Task Execute(IJobExecutionContext context)
        {
            bool elapseLeaves = false;
            int selectedMonth = DateTime.UtcNow.Month;
            int selectedYear = DateTime.UtcNow.Year;
            var traceId = Guid.NewGuid().ToString();

            DateOnly selectedDate = DateOnly.FromDateTime(DateTime.UtcNow);
            selectedDate = new DateOnly(selectedDate.Year, selectedDate.Month, 1);

            try
            {
                var dataMap = context.MergedJobDataMap;
                var cronLogId = await devToolService.UpsertCronLog(new CronLog()
                {
                    RequestId = traceId,
                    TypeId = CronType.MonthlyLeaveCreditAccrual,
                    Payload = JsonSerializer.Serialize(dataMap.WrappedMap.Where(x => !x.Key.Equals("requestid", StringComparison.CurrentCultureIgnoreCase))),
                    CreatedBy = "admin",
                    CreatedOn = DateTime.UtcNow,
                    StartedAt = DateTime.UtcNow,
                    CompletedAt = null
                });

                //if (dataMap.Keys.Contains("elapseLeaves"))
                //{
                //    elapseLeaves = bool.Parse(dataMap["elapseLeaves"]?.ToString() ?? "false");
                //}

                if (dataMap.Keys.Contains("forMonth"))
                {
                    selectedMonth = int.Parse(dataMap["forMonth"]?.ToString() ?? selectedMonth.ToString());
                    selectedDate = new DateOnly(selectedDate.Year, selectedMonth, selectedDate.Day);
                }

                if (dataMap.Keys.Contains("forYear"))
                {
                    selectedYear = int.Parse(dataMap["forYear"]?.ToString() ?? selectedYear.ToString());
                    selectedDate = new DateOnly(selectedYear, selectedDate.Month, selectedDate.Day);
                }

                var updatedCLRows = await unitOfWork.LeaveManagementRepository.MonthlyUpdateLeaveBalance(
                    LeaveEnum.CL,
                    options.Casual.MonthlyCredit,
                    options.Casual.YearlyCarryOverLimit,
                    elapseLeaves ? selectedDate.Month : options.CarryOverMonth,
                    selectedDate,         
                    options.Testing);

                var updatedELRows = await unitOfWork.LeaveManagementRepository.MonthlyUpdateLeaveBalance(
                    LeaveEnum.EL,
                    options.Earned.MonthlyCredit,
                    options.Earned.YearlyCarryOverLimit,
                    elapseLeaves ? selectedDate.Month : options.CarryOverMonth,
                    selectedDate,  
                    options.Testing);

                await devToolService.UpsertCronLog(new CronLog { Id = cronLogId.Result, CompletedAt = DateTime.UtcNow });
                logger.ForContext("RequestId", traceId).Information("Successfully ran {0}, CL updated for {1} Users, EL updated for {2} Users", nameof(MonthlyCreditLeaveBalanceJob), updatedCLRows, updatedELRows);
            }
            catch (Exception e)
            {
                logger.ForContext("RequestId", traceId).Error(e, "{0}", e.Message);
            }
        }
    }
}
