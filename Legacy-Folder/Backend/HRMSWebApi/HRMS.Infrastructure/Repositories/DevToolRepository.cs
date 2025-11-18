using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Models;
using HRMS.Domain.Utility;
using HRMS.Models.Models.Log;
using HRMS.Models.Models.DevTools;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class DevToolRepository : IDevToolRepository
    {
        private readonly IConfiguration _configuration;
        public DevToolRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }
        public async Task<LogsListDto> GetAllLogsAsync(SearchRequestDto<LogSearchRequestDto> requestDto)
        {
            using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            connection.Open();
            var param = new
            {
                Id = requestDto.Filters.Id,
                Message = requestDto.Filters.Message,
                RequestId = requestDto.Filters.RequestId,
                Level = requestDto.Filters.Level,
                DateFrom = requestDto.Filters.DateFrom,
                DateTo = requestDto.Filters.DateTo,
                PageNumber = Math.Max(requestDto.StartIndex, 1),
                PageSize = Math.Max(requestDto.PageSize, 1),
                SortColumnName = string.IsNullOrWhiteSpace(requestDto.SortColumnName) ? "1" : requestDto.SortColumnName,
                SortColumnDirection = string.Equals(requestDto.SortDirection.ToLower(), "desc") ? "DESC" : "ASC"
            };
            var result = new LogsListDto();
            using var multi = await connection.QueryMultipleAsync("[GetLogs]", param, commandType: CommandType.StoredProcedure);
                result.TotalRecords = await multi.ReadSingleOrDefaultAsync<int>();
                result.LogsList = (await multi.ReadAsync<LogResponseDto>()).ToList();
            return result;
        }
        public async Task<long> CreateCronLog(CronLog cronDto)
        {
            using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            connection.Open();
            if (cronDto.Id > 0)
            {
                const string sql = @"UPDATE CronJobLog SET CompletedAt = @CompletedAt WHERE Id = @Id";
                await connection.ExecuteAsync(sql, cronDto);
                return cronDto.Id;
            }
            else
            {
                const string sql = @"INSERT INTO CronJobLog (TypeId, RequestId, StartedAt, CompletedAt, Payload, CreatedBy, CreatedOn) VALUES 
                                (@TypeId, @RequestId, @StartedAt, @CompletedAt, @Payload, @CreatedBy, @CreatedOn); 
                                    SELECT SCOPE_IDENTITY()";
                return await connection.ExecuteScalarAsync<int>(sql, cronDto);
            }
        }
            public async Task<CronLogListDto> GetCronLogs(SearchRequestDto<CronLogSearchRequestDto> requestDto)
        {
            using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            connection.Open();
            var param = new
            {
                Id = requestDto.Filters.Id,
                DateFrom = requestDto.Filters.DateFrom,
                DateTo = requestDto.Filters.DateTo,
                TypeId = requestDto.Filters.TypeId,
                PageNumber = Math.Max(requestDto.StartIndex, 1),
                PageSize = Math.Max(requestDto.PageSize, 1),
                SortColumnName = string.IsNullOrWhiteSpace(requestDto.SortColumnName) ? "1" : requestDto.SortColumnName,
                SortColumnDirection = string.Equals(requestDto.SortDirection.ToLower(), "desc") ? "DESC" : "ASC"
            };
            var result = new CronLogListDto();
            using var multi = await connection.QueryMultipleAsync("[GetCronJobLogs]", param, commandType: CommandType.StoredProcedure);
            result.TotalRecords = await multi.ReadSingleOrDefaultAsync<int>();
            result.CronLogsList = (await multi.ReadAsync<CronLogResponseDto>()).ToList();
            return result;
        }
    }
}