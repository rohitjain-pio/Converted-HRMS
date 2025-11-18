using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Domain.Utility;
using HRMS.Models.Models.Employees;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.AdminExitEmployee;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class AdminExitEmployeeRepository : IAdminExitEmployeeRepository
    {

        private readonly IConfiguration _configuration;
        public AdminExitEmployeeRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<ExitEmployeeListResponseDTO> GetAllResignationsAsync(SearchRequestDto<ResignationSearchRequestDto> requestDto)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@PageNumber", requestDto.StartIndex);
            parameters.Add("@PageSize", requestDto.PageSize);
            parameters.Add("@EmployeeName", requestDto.Filters.EmployeeName);
            parameters.Add("@ResignationStatus", requestDto.Filters.ResignationStatus);
            parameters.Add("@LastWorkingDayFrom", requestDto.Filters.LastWorkingDayFrom?.ToString("yyyy-MM-dd"));
            parameters.Add("@LastWorkingDayTo", requestDto.Filters.LastWorkingDayTo?.ToString("yyyy-MM-dd"));
            parameters.Add("@SortColumnName", requestDto.SortColumnName);
            parameters.Add("@SortColumnDirection", requestDto.SortDirection);

            parameters.Add("@ResignationDate", requestDto.Filters.ResignationDate?.ToString("yyyy-MM-dd"));
            parameters.Add("@BranchId", requestDto.Filters.BranchId);
            parameters.Add("@DepartmentId", requestDto.Filters.DepartmentId);
            parameters.Add("@EmployeeCode", requestDto.Filters.EmployeeCode);
            parameters.Add("@EmployeeStatus", requestDto.Filters.EmployeeStatus);
            parameters.Add("@ItNoDue", requestDto.Filters.ItNoDue);
            parameters.Add("@AccountsNoDue", requestDto.Filters.AccountsNoDue);


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var result = await connection.QueryMultipleAsync("[dbo].[GetExitEmployeesListWithDetail]", parameters, commandType: CommandType.StoredProcedure);

                return new ExitEmployeeListResponseDTO
                {
                    TotalRecords = await result.ReadSingleOrDefaultAsync<int>(),
                    ExitEmployeeList = await result.ReadAsync<AdminExitEmployeeResponseDto>(),
                };

            }

        }

        public async Task<AdminExitEmployeeResponseDto?> GetResignationByIdAsync(int resignationId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ResignationId", resignationId);
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryMultipleAsync("[dbo].[GetExitEmployeesListWithDetail]", parameters, commandType: CommandType.StoredProcedure);
                await result.ReadSingleOrDefaultAsync<int>();
                IEnumerable<AdminExitEmployeeResponseDto> res = await result.ReadAsync<AdminExitEmployeeResponseDto>();
                return res.FirstOrDefault();


            }

        }

        public async Task<string> AdminAcceptResignationAsync(Resignation resigantioRequestDto, ResignationHistory resignationHistory)
        {
            var updateResignationSql = @"
                UPDATE dbo.Resignation
                SET Status = @ResignationStatus,
                 IsActive=1
                WHERE Id = @ResignationId";
            var employeeIdSql = @"Select EmployeeId from Resignation where Id=@ResignationId";
            var updateEmploymentDetailSql = @"Update dbo.EmploymentDetail Set EmployeeStatus=@EmployeeStatus Where EmployeeId=@EmployeeId";
            var insertResignationHistorySql = @"
                INSERT INTO dbo.ResignationHistory (ResignationId, CreatedOn, CreatedBy, ResignationStatus)
                VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus)";




            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var employeeId = await connection.QueryFirstOrDefaultAsync<int?>(employeeIdSql, new { ResignationId = resigantioRequestDto.Id }, transaction);
                        await connection.ExecuteAsync(updateResignationSql, new { ResignationId = resigantioRequestDto.Id, ResignationStatus = resigantioRequestDto.ResignationStatus }, transaction);
                        await connection.ExecuteAsync(updateEmploymentDetailSql, new { EmployeeId = employeeId, EmployeeStatus = EmployeeStatus.OnNotice }, transaction);

                        var resignation = new { ResignationId = resigantioRequestDto.Id, ResignationStatus = (int)resigantioRequestDto.ResignationStatus };
                        await connection.ExecuteAsync(updateResignationSql, resignation, transaction);

                        await connection.ExecuteAsync(insertResignationHistorySql, resignationHistory, transaction);
                        transaction.Commit();

                        return "Resignation accepted and status updated successfully.";
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InvalidOperationException("An error occurred while accepting the resignation.", ex);
                    }
                }
            }
        }



        public async Task<string?> AdminAcceptEarlyReleaseAsync(AcceptEarlyReleaseRequestDto requestDto, ResignationHistory resignationHistory)
        {
            var checkResignationSql = @"
           SELECT IsActive, Status FROM dbo.Resignation  WHERE Id = @ResignationId";


            var updateResignationSql = @"
                    UPDATE dbo.Resignation
                    SET EarlyReleaseDate = @EarlyReleaseDate, EarlyReleaseStatus = @EarlyReleaseStatus
                    WHERE Id = @ResignationId";

            var insertResignationHistorySql = @"
           INSERT INTO dbo.ResignationHistory (ResignationId, CreatedOn, CreatedBy, ResignationStatus)
      VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus)";


            var resignation = new { ResignationId = requestDto.ResignationId, EarlyReleaseDate = requestDto.EarlyReleaseDate, EarlyReleaseStatus = EarlyReleaseStatus.Accepted };
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var checkRespones = await connection.QueryFirstOrDefaultAsync(checkResignationSql, new { ResignationId = requestDto.ResignationId }, transaction);
                        if (!checkRespones?.IsActive ||
                            (ResignationStatus)(byte)checkRespones?.Status != ResignationStatus.Accepted)
                        {
                            return null;
                        }

                        await connection.ExecuteAsync(updateResignationSql, resignation, transaction);
                        await connection.ExecuteAsync(insertResignationHistorySql, resignationHistory, transaction);
                        transaction.Commit();

                        return "Early release request accepted";

                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InvalidOperationException("Early release request rejected.", ex);

                    }
                }
            }
        }



        public async Task<string?> AdminRejectResignationAsync(AdminRejectionRequestDto requestDto, ResignationHistory resignationHistory)
        {

            if (!await CheckResignationExistsAsync(requestDto.ResignationId))
            {
                return null;
            }
            var updateResignationSql = @"
                UPDATE dbo.Resignation
                SET Status = @ResignationStatus,
                RejectResignationReason = @RejectResignationReason,
                IsActive = 0
                WHERE Id = @ResignationId";

            var insertResignationHistorySql = @"
                  INSERT INTO dbo.ResignationHistory (ResignationId, CreatedOn, CreatedBy, ResignationStatus, EarlyReleaseStatus)
                  VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus, @EarlyReleaseStatus)";



            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        await connection.ExecuteAsync(updateResignationSql, new { ResignationId = requestDto.ResignationId, RejectResignationReason = requestDto.RejectReason, ResignationStatus = ResignationStatus.Cancelled }, transaction);
                        await connection.ExecuteAsync(insertResignationHistorySql, resignationHistory, transaction);
                        transaction.Commit();

                        return "Resignation Rejected.";
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InvalidOperationException("An error occurred while rejecting the resignation.", ex);

                    }
                }
            }
        }


        public async Task<string?> AdminRejectEarlyReleaseAsync(AdminRejectionRequestDto requestDto, ResignationHistory resignationHistory)
        {
            if (!await CheckResignationExistsAsync(requestDto.ResignationId))
            {
                return null;
            }

            var getResignationStatusSql = @"
        SELECT Status
        FROM dbo.Resignation
        WHERE Id = @ResignationId";

            var updateResignationSql = @"
        UPDATE dbo.Resignation
        SET RejectEarlyReleaseReason = @RejectEarlyReleaseReason,
            EarlyReleaseStatus = @EarlyReleaseStatus
        WHERE Id = @ResignationId";

            var insertResignationHistorySql = @"
        INSERT INTO dbo.ResignationHistory (ResignationId, CreatedOn, CreatedBy, ResignationStatus, EarlyReleaseStatus)
        VALUES (@ResignationId, @CreatedOn, @CreatedBy, @ResignationStatus, @EarlyReleaseStatus)";

            var resignation = new { ResignationId = requestDto.ResignationId, RejectEarlyReleaseReason = requestDto.RejectReason, EarlyReleaseStatus = EarlyReleaseStatus.Rejected };

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        ResignationStatus? resignationStatus = await connection.ExecuteScalarAsync<ResignationStatus?>(getResignationStatusSql, new { ResignationId = requestDto.ResignationId }, transaction);
                        if (resignationStatus == null)
                        {
                            return null;
                        }
                        await connection.ExecuteAsync(updateResignationSql, resignation, transaction);
                        resignationHistory.ResignationStatus = resignationStatus.Value;
                        await connection.ExecuteAsync(insertResignationHistorySql, resignationHistory, transaction);
                        transaction.Commit();
                        return "Early release request rejected";
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InvalidOperationException("Exception while executing SQL queries.", ex);
                    }
                }
            }
        }


        public async Task<String> UpdateLastWorkingDayAsync(UpdateLastWorkingDayRequestDto requestDto)
        {
            var updateResignationSql = @"
                UPDATE dbo.Resignation
                SET LastWorkingDay = @LastWorkingDay
                WHERE Id = @ResignationId";

            var resignationParams = new
            {
                ResignationId = requestDto.ResignationId,
                LastWorkingDay = requestDto.LastWorkingDay,
            };

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        await connection.ExecuteAsync(updateResignationSql, resignationParams, transaction);
                        transaction.Commit();
                        return "Updated last working day successfully";
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InvalidOperationException("An error occurred while updating the last working day.", ex);

                    }
                }
            }
        }

        public async Task<bool> CheckResignationExistsAsync(int resignationId)
        {
            var sql = @"
                SELECT COUNT(1)
                FROM dbo.Resignation
                WHERE Id = @ResignationId AND IsActive = 1";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(sql, new { ResignationId = resignationId });
                return count > 0;
            }
        }

        public async Task<ITClearance?> GetITClearanceByResignationIdAsync(int resignationId)
        {
            var sql = @"
                    SELECT
                ResignationId,
                AccessRevoked,
                AssetReturned,
                AssetCondition,
                AttachmentUrl,
                Note,
                ITClearanceCertification
            FROM
                dbo.ITClearance
            WHERE
                ResignationId = @ResignationId"; ;


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<ITClearance>(sql, new { ResignationId = resignationId });
                return result;
            }
        }

        public async Task<bool> AddUpdateITClearanceAsync(ITClearance iTClearance)
        {
            var checkResignationSql = "SELECT * FROM dbo.Resignation WHERE Id = @ResignationId AND IsActive = 1";
            var checkClearanceSql = "SELECT COUNT(1) FROM dbo.ITClearance WHERE ResignationId = @ResignationId";

            var insertSql = @"
                INSERT INTO dbo.ITClearance
                (ResignationId, AccessRevoked, AssetReturned, AssetCondition, AttachmentUrl, Note, 
                ITClearanceCertification, ModifiedBy, CreatedBy, CreatedOn)
                VALUES
                (@ResignationId, @AccessRevoked, @AssetReturned, @AssetCondition, @AttachmentUrl, @Note, 
                @ITClearanceCertification, @ModifiedBy, @CreatedBy, @CreatedOn)";

            var updateSql = @"
                UPDATE dbo.ITClearance
                SET AccessRevoked = @AccessRevoked,
                    AssetReturned = @AssetReturned,
                    AssetCondition = @AssetCondition,
                    Note = @Note,
                    ITClearanceCertification = @ITClearanceCertification,
                    ModifiedBy =  @ModifiedBy, 
                    ModifiedOn = GETUTCDATE()";
            if (!string.IsNullOrEmpty(iTClearance.AttachmentUrl) && !string.IsNullOrEmpty(iTClearance.FileOriginalName))
            {
                updateSql += ",[AttachmentUrl]=@AttachmentUrl,[FileOriginalName]=@FileOriginalName";
            }
            updateSql += "\nWHERE ResignationId = @ResignationId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var resignationExists = await connection.QuerySingleOrDefaultAsync<Resignation>(checkResignationSql, new { iTClearance.ResignationId });
                if (resignationExists == null)
                    return false;

                var clearanceExists = await connection.ExecuteScalarAsync<bool>(checkClearanceSql, new { iTClearance.ResignationId });

                if (clearanceExists)
                {
                    await connection.ExecuteAsync(updateSql, iTClearance);
                }
                else
                {
                    await connection.ExecuteAsync(insertSql, iTClearance);
                }

                if (iTClearance.ITClearanceCertification)
                {
                    var updateEDSql = @"
                UPDATE dbo.EmploymentDetail
                SET EmployeeStatus = @EmployeeStatus 
                WHERE  EmployeeId = @EmployeeId";

                    await connection.ExecuteAsync(updateEDSql, new { resignationExists.EmployeeId, EmployeeStatus = EmployeeStatus.FnFPending });
                }
                return true;
            }
        }

        public async Task<AccountClearance?> GetAccountClearanceByResignationIdAsync(int resignationId)
        {
            var sql = @"
            SELECT
                
                ResignationId,
                FnFStatus,
                FnFAmount,
                IssueNoDueCertificate,
                Note,
                AccountAttachment
            FROM
                dbo.AccountClearance
            WHERE
                ResignationId = @ResignationId";



            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<AccountClearance>(sql, new { ResignationId = resignationId });
                return result;
            }
        }

        public async Task<bool> AddUpdateAccountClearanceAsync(AccountClearance accountClearance)
        {
            var checkResignationSql = "SELECT * FROM dbo.Resignation WHERE Id = @ResignationId AND IsActive = 1";
            var checkClearanceSql = "SELECT COUNT(1) FROM dbo.AccountClearance WHERE ResignationId = @ResignationId";

            var insertSql = @"
                INSERT INTO dbo.AccountClearance
                (ResignationId, FnFStatus, FnFAmount, IssueNoDueCertificate, Note, 
                AccountAttachment,FileOriginalName, CreatedBy, CreatedOn)
                VALUES
                (@ResignationId, @FnFStatus, @FnFAmount, @IssueNoDueCertificate, @Note, 
                @AccountAttachment,@FileOriginalName, @CreatedBy, @CreatedOn)";

            var updateSql = @"
                UPDATE dbo.AccountClearance
                SET FnFStatus = @FnFStatus,
                    FnFAmount = @FnFAmount,
                    IssueNoDueCertificate = @IssueNoDueCertificate,
                    Note = @Note,
                    AccountAttachment = @AccountAttachment,
                    ModifiedBy = 'Admin', 
                    ModifiedOn = GETUTCDATE() 
                WHERE ResignationId = @ResignationId";

            var updateResignationSql = @"
                UPDATE dbo.Resignation
                SET Status = @ResignationStatus,
                 IsActive = 0
                WHERE Id = @ResignationId";

            var updateEDSql = @"
                    UPDATE dbo.EmploymentDetail
                    SET EmployeeStatus = @EmployeeStatus 
                    WHERE  EmployeeId = @EmployeeId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var resignationExists = await connection.QuerySingleOrDefaultAsync<Resignation>(checkResignationSql, new { accountClearance.ResignationId });
                if (resignationExists == null)
                    return false;

                var clearanceExists = await connection.ExecuteScalarAsync<bool>(checkClearanceSql, new { accountClearance.ResignationId });

                if (clearanceExists)
                {
                    await connection.ExecuteAsync(updateSql, accountClearance);
                }
                else
                {
                    await connection.ExecuteAsync(insertSql, accountClearance);
                }
                if (accountClearance.FnFStatus == true)
                {
                    await connection.ExecuteAsync(updateResignationSql, new { ResignationStatus = ResignationStatus.Completed, ResignationId = accountClearance.ResignationId });
                    await connection.ExecuteAsync(updateEDSql, new { resignationExists.EmployeeId, EmployeeStatus = EmployeeStatus.ExEmployee });
                }

                return true;
            }
        }


        public async Task<HRClearance?> GetHRClearanceByResignationIdAsync(int resignationId)
        {
            var sql = @"
        SELECT 
            ResignationId,
            AdvanceBonusRecoveryAmount,
            ServiceAgreementDetails,
            CurrentEL,
            NumberOfBuyOutDays,
            ExitInterviewStatus,
            ExitInterviewDetails,
            Attachment
        FROM 
            dbo.HRClearance
        WHERE 
            ResignationId = @ResignationId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<HRClearance>(sql, new { ResignationId = resignationId });
                return result;
            }
        }


        public async Task<DepartmentClearance?> GetDepartmentClearanceByResignationIdAsync(int resignationId)
        {
            var sql = @"
          SELECT 
            ResignationId,
            KTStatus,
            KTNotes,
            Attachment,
            KTUsers   
        FROM 
            dbo.DepartmentClearance
        WHERE 
            ResignationId = @ResignationId";


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<DepartmentClearance>(sql, new { ResignationId = resignationId });
                return result;
            }
        }

        public async Task<bool> UpsertDepartmentClearanceAsync(DepartmentClearance departmentClearance)
        {
            var checkResignationSql = "SELECT COUNT(1) FROM dbo.Resignation WHERE Id = @ResignationId AND IsActive = 1";
            var checkClearanceSql = "SELECT COUNT(1) FROM dbo.DepartmentClearance WHERE ResignationId = @ResignationId";

            var insertSql = @"
        INSERT INTO dbo.DepartmentClearance
        (ResignationId, KTStatus, KTNotes, Attachment,FileOriginalName, KTUsers, CreatedBy, CreatedOn)
        VALUES
        (@ResignationId, @KTStatus, @KTNotes, @Attachment,@FileOriginalName, @KTUsers, @CreatedBy, @CreatedOn)";

            var updateSql = @"
        UPDATE dbo.DepartmentClearance
        SET KTStatus = @KTStatus,
            KTNotes = @KTNotes,
            KTUsers = @KTUsers,
            ModifiedBy = @CreatedBy,
            ModifiedOn = @CreatedOn";
            if (!string.IsNullOrEmpty(departmentClearance.Attachment) && !string.IsNullOrEmpty(departmentClearance.FileOriginalName))
            {
                updateSql += ",[Attachment]=@Attachment,[FileOriginalName]=@FileOriginalName";
            }
            updateSql += "\nWHERE ResignationId = @ResignationId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var resignationExists = await connection.ExecuteScalarAsync<bool>(checkResignationSql, new { departmentClearance.ResignationId });
                if (!resignationExists)
                    return false;

                var clearanceExists = await connection.ExecuteScalarAsync<bool>(checkClearanceSql, new { departmentClearance.ResignationId });

                if (clearanceExists)
                {
                    await connection.ExecuteAsync(updateSql, departmentClearance);
                }
                else
                {
                    await connection.ExecuteAsync(insertSql, departmentClearance);
                }

                return true;
            }
        }

        public async Task<bool> UpsertHRClearanceAsync(HRClearance hrClearance)
        {
            var checkResignationSql = "SELECT COUNT(1) FROM dbo.Resignation WHERE Id = @ResignationId AND IsActive = 1";
            var checkClearanceSql = "SELECT COUNT(1) FROM dbo.HRClearance WHERE ResignationId = @ResignationId";

            var insertSql = @"
        INSERT INTO dbo.HRClearance
        (ResignationId, AdvanceBonusRecoveryAmount, ServiceAgreementDetails, CurrentEL, NumberOfBuyOutDays,
        ExitInterviewStatus, ExitInterviewDetails, Attachment,FileOriginalName, CreatedBy, CreatedOn)
        VALUES
        (@ResignationId, @AdvanceBonusRecoveryAmount, @ServiceAgreementDetails, @CurrentEL, @NumberOfBuyOutDays,
        @ExitInterviewStatus, @ExitInterviewDetails, @Attachment,@FileOriginalName, @CreatedBy, @CreatedOn)";

            var updateSql = @"
        UPDATE dbo.HRClearance
        SET AdvanceBonusRecoveryAmount = @AdvanceBonusRecoveryAmount,
            ServiceAgreementDetails = @ServiceAgreementDetails,
            CurrentEL = @CurrentEL,
            NumberOfBuyOutDays = @NumberOfBuyOutDays,
            ExitInterviewStatus = @ExitInterviewStatus,
            ExitInterviewDetails = @ExitInterviewDetails,
            ModifiedBy = @CreatedBy,
            ModifiedOn = @CreatedOn";

            if (!string.IsNullOrEmpty(hrClearance.Attachment) && !string.IsNullOrEmpty(hrClearance.FileOriginalName))
            {
                updateSql += ",[Attachment]=@Attachment,[FileOriginalName]=@FileOriginalName";
            }
            updateSql += "\nWHERE ResignationId = @ResignationId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var resignationExists = await connection.ExecuteScalarAsync<bool>(checkResignationSql, new { hrClearance.ResignationId });
                if (!resignationExists)
                {
                    return false;
                }

                var clearanceExists = await connection.ExecuteScalarAsync<bool>(checkClearanceSql, new { hrClearance.ResignationId });

                if (clearanceExists)
                {
                    await connection.ExecuteAsync(updateSql, hrClearance);
                }
                else
                {
                    await connection.ExecuteAsync(insertSql, hrClearance);
                }

                return true;
            }
        }

    }
}


