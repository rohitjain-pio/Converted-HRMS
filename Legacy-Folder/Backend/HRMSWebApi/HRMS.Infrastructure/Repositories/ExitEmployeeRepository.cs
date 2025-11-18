using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using HRMS.Models.Models.UserProfile;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Domain.Utility;
using HRMS.Models.Models.Employees;
using HRMS.Domain.Enums;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class ExitEmployeeRepository : IExitEmployeeRepository
    {

        private readonly IConfiguration _configuration;
        public ExitEmployeeRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }
        public async Task<int> AddResignationAsync(Resignation resignation)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var sql = @"INSERT INTO [dbo].[Resignation](
                            [EmployeeId],[DepartmentId],[ReportingManagerId],[Reason],[LastWorkingDay],[Status],[IsActive],[CreatedBy],[CreatedOn], [EarlyReleaseStatus])
                       VALUES(@EmployeeId,@DepartmentId,@ReportingManagerId,@Reason,@LastWorkingDay,@ResignationStatus,@IsActive,@CreatedBy,@CreatedOn, @EarlyReleaseStatus);
                       Select Scope_Identity();";
                       
               
          
            var insertedId = await connection.ExecuteScalarAsync<int>(sql, resignation);

             var historySql = @"INSERT INTO [dbo].[ResignationHistory] ([ResignationId], [CreatedOn], [CreatedBy], [ResignationStatus])
                           VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus);";

             var historyParams = new
             {
               ResignationId = insertedId,
               CreatedOn = resignation.CreatedOn,
               CreatedBy = resignation.CreatedBy,
               ResignationStatus = resignation.ResignationStatus,
            };
  
             await connection.ExecuteAsync(historySql, historyParams);

                return insertedId;

                
            }
        }
        public async Task<ResignationResponseDto?> GetEmployeeDetailsForResignationAsync(long id)
        {
            var sql = @"SELECT e.Id,CONCAT(e.FirstName, ' ', e.LastName) As EmployeeName,ed.DepartmentId,d.Department,
                                       CONCAT(M.FirstName, 
                            CASE WHEN M.MiddleName IS NOT NULL THEN ' ' + M.MiddleName ELSE '' END, 
                            ' ', M.LastName) AS ReportingManagerName,ed.ReportingMangerId as ReportingManagerId, ed.JobType
                                        FROM  dbo.EmployeeData e 
                                       LEFT JOIN dbo.EmploymentDetail ed ON e.Id = ed.EmployeeId
                                       LEFT JOIN dbo.Department d ON ed.DepartmentId = d.Id
                                     LEFT JOIN   EmployeeData M ON ed.ReportingMangerId = M.Id
                                       WHERE e.Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<ResignationResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<ResignationResponseDto?> GetResignationByAsync(long id)
        {
            var sql = @"SELECT EmployeeId AS Id From Resignation  WHERE EmployeeId = @Id and IsActive = 1";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<ResignationResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<ResignationExistResponseDto?> GetResignationExistAsync(long id)
        {
            var sql = @"SELECT Top 1 R.IsActive,R.Status, R.EarlyReleaseStatus, R.EarlyReleaseDate, R.Id, R.EmployeeId,CONCAT(E.FirstName, CASE WHEN E.MiddleName IS NOT NULL THEN ' ' + E.MiddleName ELSE '' END, ' ', E.LastName) AS EmployeeName,
                        D.Department,
                        CONCAT(M.FirstName, 
                            CASE WHEN M.MiddleName IS NOT NULL THEN ' ' + M.MiddleName ELSE '' END, 
                            ' ', M.LastName) AS ReportingManager,
                         R.Reason,
                        R.LastWorkingDay,CONVERT(date,r.CreatedOn) as ResignationDate,
						R.RejectResignationReason, R.RejectEarlyReleaseReason
                        FROM 
                        Resignation R
                        JOIN 
                        EmployeeData E ON R.EmployeeId = E.Id
                        JOIN 
                        Department D ON R.DepartmentID = D.Id
                        LEFT JOIN 
                        EmployeeData M ON R.ReportingManagerId = M.Id
                        WHERE 
                        R.EmployeeId = @Id 
						Order by r.CreatedOn DESC";
                            

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<ResignationExistResponseDto>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<Resignation?> GetResignationByIdAsync(int resignationId)
        {
            var sql = "SELECT * FROM dbo.Resignation WHERE Id = @Id AND IsActive = 1";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var resignation = await connection.QueryFirstOrDefaultAsync<Resignation>(sql, new { Id = resignationId });
                return resignation;
            }
        }

        public async Task<bool> UpdateResignationAsync(Resignation resignation)
        {
            var updateSql = @"
        UPDATE dbo.Resignation
        SET Status = @Status,
            ModifiedBy = @ModifiedBy,
            ModifiedOn = @ModifiedOn,
            IsActive = 0
        WHERE Id = @Id";

            var historySql = @"
        INSERT INTO dbo.ResignationHistory (ResignationId, CreatedOn, CreatedBy, ResignationStatus)
        VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus)";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            var rowsAffected = await connection.ExecuteAsync(updateSql, new
            {
                Status = (byte)resignation.ResignationStatus,
                ModifiedBy = resignation.ModifiedBy,
                ModifiedOn = resignation.ModifiedOn,
                Id = resignation.Id
            }, transaction);

            if (rowsAffected == 0)
            {
                transaction.Rollback();
                return false;
            }

            await connection.ExecuteAsync(historySql, new
            {
                ResignationId = resignation.Id,
                CreatedOn = resignation.ModifiedOn ?? DateTime.UtcNow,
                CreatedBy = resignation.ModifiedBy,
                ResignationStatus = (byte)resignation.ResignationStatus
            }, transaction);

            var updateEDSql = @"
                UPDATE dbo.EmploymentDetail
                SET EmployeeStatus = @EmployeeStatus 
                WHERE  EmployeeId = @EmployeeId";

            await connection.ExecuteAsync(updateEDSql, new { resignation.EmployeeId, EmployeeStatus = EmployeeStatus.Active }, transaction);

            transaction.Commit();
            return true;
        }

        public async Task<bool> RequestEarlyReleaseAsync(EarlyReleaseRequestDto request, ResignationHistory historyDto)
        {
            var updateSql = @"
            UPDATE dbo.Resignation
            SET EarlyReleaseDate = @EarlyReleaseDate,
            EarlyReleaseStatus = @EarlyReleaseStatus
            WHERE Id = @ResignationId";

            var historySql = @"
            INSERT INTO dbo.ResignationHistory (ResignationId, CreatedOn, CreatedBy, ResignationStatus, EarlyReleaseStatus)
            VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus, @EarlyReleaseStatus)";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            var rowsAffected = await connection.ExecuteAsync(updateSql, new
            {
                EarlyReleaseDate = request.EarlyReleaseDate,
                EarlyReleaseStatus = request.EarlyReleaseStatus,
                ResignationId = request.ResignationId
            }, transaction);

            if (rowsAffected == 0)
            {
                transaction.Rollback();
                return false;
            }

            await connection.ExecuteAsync(historySql, historyDto, transaction);

            transaction.Commit();
            return true;
        }





        public async Task<IsResignationExistResponseDTO?> IsResignationExistAsync(long id)
        {
            var sql = @"Select TOP 1 Id as ResignationId,[Status] as ResignationStatus, * from [Resignation] Where EmployeeId = @id  Order by CreatedOn DESC";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<IsResignationExistResponseDTO>(sql, new { Id = id });
                if (result!=null && result.ResignationId > 0)
                {
                    return result;
                }
                return null;
            }
        }
    }
}
