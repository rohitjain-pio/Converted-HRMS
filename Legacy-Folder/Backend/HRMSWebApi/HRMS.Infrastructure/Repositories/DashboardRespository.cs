using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using HRMS.Models.Models.Dashboard;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;
using Dapper;
using HRMS.Domain.Utility;
using HRMS.Domain.Enums;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class DashboardRespository : IDashboardRespository
    {
        private readonly IConfiguration _configuration;
        public DashboardRespository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<IEnumerable<EmployeeData?>> GetEmployeesBirthdayList()
        {
            var sql = @"Declare @startOfWeek Date= DATEADD(DAY,1 - DATEPART(WEEKDAY,GETUTCDATE()),GETUTCDATE());
                        Declare @endofWeek Date =DATEADD(DAY,7-DATEPART(WEEKDAY, GETUTCDATE()),GETUTCDATE());
 
                        select id,Firstname,MiddleName, LastName,DOB,FileName,FileOriginalName
                        FROM EmployeeData
                        WHERE DATEADD(YEAR, YEAR(GETUTCDATE()) -YEAR(DOB),DOB) BETWEEN @startOfWeek AND @endofWeek
                        OR DATEADD(YEAR, YEAR(GETUTCDATE()) -YEAR(DOB)+1,DOB) BETWEEN @startOfWeek AND  @endofWeek
                       ORDER BY MONTH(DOB), DAY(DOB)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<EmployeeData?>(sql);
                return result;
            }
        }
        
        public async Task<EmployeesCountResponseDto> GetEmployeesCount(DashboardRequestDto request)
        {
            var query = new StringBuilder("SELECT COUNT(1) AS ActiveEmployeeCount FROM [EmployeeData] ED WITH (NOLOCK) INNER JOIN EmploymentDetail E ON ED.Id = E.EmployeeId  WHERE ED.IsDeleted = 0 AND E.EmployeeStatus = @Active; ");

            query.Append(@"SELECT COUNT(1) AS NewEmployeeCount FROM EmployeeData ED WITH (NOLOCK)
                        INNER JOIN EmploymentDetail EDT WITH (NOLOCK) ON ED.Id = EDT.EmployeeId
                        WHERE ED.IsDeleted = 0 AND EDT.EmployeeStatus = @Active");
            if (request.Days > 0)
            {
                query.Append(" AND EDT.JoiningDate >= DATEADD(DAY,-@Days,GETUTCDATE())");
            }
            else if (request.From.HasValue && request.To.HasValue)
            {
                query.Append(" AND EDT.JoiningDate BETWEEN @From and @To");
            }

            query.Append(@";SELECT COUNT(1) AS ExitOrgEmployeeCount FROM EmployeeData ED WITH (NOLOCK) 
                            INNER JOIN EmploymentDetail EDT WITH (NOLOCK) ON ED.Id = EDT.EmployeeId
                            WHERE  EDT.EmployeeStatus = @ExEmployee OR EDT.EmployeeStatus = @Inactive");
            //--------Need to change when we use exit date
            //if (request.Days > 0)
            //{
            //    query.Append(" AND EDT.ExitDate >= DATEADD(DAY,-@Days,GETUTCDATE())");
            //}
            //else if (request.From.HasValue && request.To.HasValue)
            //{
            //    query.Append(" AND EDT.ExitDate BETWEEN @From and @To");
            //}

            EmployeesCountResponseDto employeesCountResponseDto = new ();
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                var cmd = new CommandDefinition(query.ToString(),new { request.Days, request.From, request.To, EmployeeStatusType.ExEmployee, EmployeeStatusType.Inactive, EmployeeStatusType.Active });
                using(var multi = await connection.QueryMultipleAsync(cmd))
                {
                    employeesCountResponseDto.ActiveEmployeeCount = await multi.ReadFirstOrDefaultAsync<long>();
                    employeesCountResponseDto.NewEmployeeCount = await multi.ReadFirstOrDefaultAsync<long>();
                    employeesCountResponseDto.ExitOrgEmployeeCount = await multi.ReadFirstOrDefaultAsync<long>();
                } 
            }    
            return employeesCountResponseDto;   
        }

        public async Task<IEnumerable<PublishedCompanyPolicyResponseDto?>> GetPublishedCompanyPolicies(DashboardRequestDto request)
        {
            var query = new StringBuilder("SELECT ID,NAME,EFFECTIVEDATE UpdatedOn FROM [CompanyPolicy] WHERE IsDeleted=0 and StatusId = 2");
            if (request.Days >0)
            {
                query.Append(" AND CAST(EFFECTIVEDATE AS DATE) >= DATEADD(DAY,-@Days,GETUTCDATE())");
            }
            else if(request.From.HasValue && request.To.HasValue)
            {
                query.Append(" AND CAST(EFFECTIVEDATE AS DATE) >=@From and CAST(EFFECTIVEDATE AS DATE)<=@To");
            }
            query.Append(" Order by EFFECTIVEDATE DESC");
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<PublishedCompanyPolicyResponseDto?>
                    (query.ToString(),new { request.Days, request.From, request.To });
                return result;
            }
        }

        public async Task<IEnumerable<WorkAnniversaryResponseDto>> GetEmployeeWorkAnniversaryList()
        {
            var sql = @"Declare @startOfWeek Date= DATEADD(DAY,1 - DATEPART(WEEKDAY,GETUTCDATE()),GETUTCDATE());
                        Declare @endofWeek Date =DATEADD(DAY,7-DATEPART(WEEKDAY, GETUTCDATE()),GETUTCDATE());

                        select e.id,Firstname,MiddleName, LastName,ed.JoiningDate,FileName as ProfilePicPath
                       from EmployeeData e
                        join EmploymentDetail ed on e.Id = ed.EmployeeId 
                        where e.IsDeleted = 0 and (ed.JoiningDate is not null And DATEADD(YEAR, YEAR(GETUTCDATE()) -YEAR(ed.JoiningDate),ed.JoiningDate) BETWEEN @startOfWeek AND @endofWeek
                        OR DATEADD(YEAR, YEAR(GETUTCDATE()) -YEAR(ed.JoiningDate)+1,ed.JoiningDate) BETWEEN @startOfWeek AND  @endofWeek)
                        AND ed.JoiningDate < DATEADD(YEAR, -1, @endOfWeek)
                        ORDER BY MONTH(ed.JoiningDate), DAY(ed.JoiningDate)"; 
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<WorkAnniversaryResponseDto?>(sql);
                return result!;
            }
        }
        public async Task<IEnumerable<UpComingEventResponseDto>> GetUpComingEventsListAsync()
        {
            var sql = @"SELECT TOP(3) E.Id,
                                E.Title as EventName,
                                E.StartDate,                             
                                E.Venue,
                                S.StatusValue AS Status,                              
                                E.BannerFileName                             
                                FROM dbo.Events E                       
                        INNER JOIN [dbo].[Status] S ON E.StatusId = S.Id
                        Where E.StartDate > GETUTCDATE() AND S.StatusValue = 'Upcoming' and E.IsDeleted = 0 Order by StartDate asc;";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<UpComingEventResponseDto>(sql); 
                return result;
            }
        }
    }
}
