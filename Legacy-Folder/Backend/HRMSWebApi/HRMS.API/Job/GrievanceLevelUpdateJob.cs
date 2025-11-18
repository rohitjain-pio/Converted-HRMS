using HRMS.Application.Services.Interfaces;
using HRMS.Domain;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using Microsoft.Extensions.Options;
using Quartz;

namespace HRMS.API.Job
{
    public class GrievanceLevelUpdateJob(IUnitOfWork unitOfWork, Serilog.ILogger logger) : IJob
    {
        public async Task Execute(IJobExecutionContext context)
        { 
            var traceId = Guid.NewGuid().ToString();
             

            try
            {
                  await unitOfWork.GrievanceRepository.EscalateGrievanceByCronAsync();
                logger.ForContext("RequestId", traceId).Information("Successfully ran for Grievance Level Update", nameof(GrievanceLevelUpdateJob));
            }
            catch (Exception e)
            {
                logger.ForContext("RequestId", traceId).Error(e, "{0}", e.Message);
            }
        }
    }
}
