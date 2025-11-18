using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Infrastructure.Interface;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.UserProfile;
using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Reflection.PortableExecutable;
using System.Text;
using System.Transactions;
using static Dapper.SqlMapper;
using static HRMS.Domain.Utility.LeaveBalanceHelper;

namespace HRMS.Infrastructure.Repositories
{
    public class EmploymentDetailRepository : IEmploymentDetailRepository
    {
        private readonly IConfiguration _configuration;
        public EmploymentDetailRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }
        public async Task<long> AddEmploymentDetailAsync(EmploymentDetail employmentDetail, EmployeeData employeeData)
        {

            var sqlPersonal = @"INSERT INTO [dbo].[EmployeeData]
           ([FirstName] ,[MiddleName] ,[LastName]  ,[CreatedBy] ,[CreatedOn]  ,[IsDeleted] ,[EmployeeCode] )
         VALUES
           (@FirstName ,@MiddleName ,@LastName ,@CreatedBy ,@CreatedOn ,0 ,@EmployeeCode
            ) SELECT SCOPE_IDENTITY() ";

            var sql = @"INSERT INTO [EmploymentDetail]
           ([EmployeeId] ,[Email] ,[JoiningDate] ,[BranchId] ,[EmploymentStatus] ,[LinkedInUrl] ,[DepartmentId]
           ,[BackgroundVerificationstatus] ,[CriminalVerification]   
           ,[TotalExperienceYear ]
           ,[TotalExperienceMonth]
           ,[RelevantExperienceYear]
           ,[RelevantExperienceMonth]
           ,[JobType]
           ,[ConfirmationDate]
           ,[ExtendedConfirmationDate]
           ,[isProbExtended]
           ,[ProbExtendedWeeks]
           ,[EmployeeStatus] 
           ,[ReportingMangerId]
           ,[TeamId]
           ,[DesignationId]
           ,[isConfirmed],[ProbationMonths] 
            ,[CreatedBy] ,[CreatedOn] ,[IsDeleted], [TimeDoctorUserId], [ImmediateManager]
           )
            VALUES
           (@EmployeeId ,@Email ,@JoiningDate ,@BranchId ,@EmploymentStatus ,@LinkedInUrl ,@DepartmentId
           ,@BackgroundVerificationstatus ,@CriminalVerification  
           ,@TotalExperienceYear
           ,@TotalExperienceMonth
           ,@RelevantExperienceYear
           ,@RelevantExperienceMonth
           ,@JobType
           ,@ConfirmationDate
           ,@ExtendedConfirmationDate
           ,@isProbExtended
           ,@ProbExtendedWeeks
           ,@EmployeeStatus 
           ,@ReportingMangerId
           ,@TeamId
           ,@DesignationId
           ,@isConfirmed,@ProbationMonths 
            ,@CreatedBy ,@CreatedOn,0, @TimeDoctorUserId, @ImmediateManager 
            )";
            var UserRoleMappingsql = @"INSERT INTO [dbo].[UserRoleMapping] ([RoleId] ,[EmployeeId] ,[CreatedBy] ,[CreatedOn] ,[IsDeleted])
          VALUES
          (@RoleId ,@EmployeeId ,@CreatedBy ,GETUTCDATE(),0)";


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transactionIns = connection.BeginTransaction())
                {
                    try
                    {
                        employeeData.EmployeeCode = employeeData.EmployeeCode.ToUpper();
                        var employeeId = await connection.ExecuteScalarAsync<long>(sqlPersonal, employeeData, transactionIns);
                        employmentDetail.EmployeeId = employeeId;
                        var roleRequest = new RoleRequest
                        {
                            EmployeeId = employeeId,
                            RoleId = (int)employmentDetail.RoleId,
                            CreatedBy = employmentDetail.CreatedBy
                        };

                        var employmentResult = await connection.ExecuteAsync(sql, employmentDetail, transactionIns);
                        var roleResult = await connection.ExecuteAsync(UserRoleMappingsql, roleRequest, transactionIns);

                        transactionIns.Commit();
                        return employeeId;
                    }
                    catch (Exception)
                    {
                        transactionIns.Rollback();
                    }
                }
                return 0;

            }
        }

        public async Task<bool> IsEmpCodeExist(string empCode)
        {
            var sqlCode = @"Select  top 1  EmployeeCode from  EmployeeData Where IsDeleted=0 AND EmployeeCode = @EmployeeCode";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                var employeeCode = await connection.ExecuteScalarAsync<string>(sqlCode, new
                {
                    EmployeeCode = empCode
                });
                if (!string.IsNullOrEmpty(employeeCode))
                {
                    return true;
                }
                return false;
            }
        }

        public async Task<bool> IsTimeDoctorUserIdExists(long employeeId, string timeDoctorUserId)
        {
            var sqlCode = @"SELECT COUNT(Id) FROM EmploymentDetail WHERE EmployeeId != @EmployeeId AND TimeDoctorUserId = @TimeDoctorUserId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync<long>(sqlCode, new
                {
                    EmployeeId = employeeId,
                    TimeDoctorUserId = timeDoctorUserId,
                });
                return result > 0;
            }
        }

        public async Task<int> AddIfNotExistsEmployeeOpeningLeaveBalance(long employeeId, OpeningLeaveBalanceDto leaveBalance)
        {
            var employmentSql = @"SELECT JobType FROM [dbo].[EmploymentDetail] WHERE EmployeeId = @EmployeeId AND isDeleted = 0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var jobType = await connection.ExecuteScalarAsync<int?>(employmentSql, new { EmployeeId = employeeId }, transaction);
                        bool isConfirmed = jobType.HasValue && jobType.Value == (int)JobType.Confirmed;

                        var sqlCode = @$"
                            IF NOT EXISTS (SELECT ID FROM EmployeeLeave WHERE EmployeeId = @EmployeeId) BEGIN 
                                INSERT INTO [dbo].[EmployeeLeave]
                                ([EmployeeId],[LeaveId],[OpeningBalance],[LeaveDate],[IsActive],[ModifiedOn],[ModifiedBy],[CreatedOn],[CreatedBy])
                                VALUES 
                                (@EmployeeId, @CasualLeaveId, @CasualLeave, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin'),
                                (@EmployeeId, @EarnedLeaveId, @EarnedLeave, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin'),
                                (@EmployeeId, @BreavementLeaveId, @BreavementLeave, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin'),

                                (@EmployeeId, @PaternityLeaveId, @PaternityLeave, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin'),
                                (@EmployeeId, @MaternityLeaveId, @MaternityLeave, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin'),

                                (@EmployeeId, @AdvanceLeaveId, @AdvanceLeave, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin'),
                                (@EmployeeId, @LeaveInBucketId, @LeaveInBucket, @CreatedDate, 0, NULL, NULL, @CreatedDate, 'admin');

                                SELECT @@ROWCOUNT;
                            END
                        ";

                        var createdDate = DateTime.UtcNow;

                        var result = await connection.ExecuteScalarAsync<int>(sqlCode, new
                        {
                            EmployeeId = employeeId,
                            CreatedDate = createdDate,
                            CasualLeave = leaveBalance.Casual,
                            EarnedLeave = leaveBalance.Earned,
                            BreavementLeave = leaveBalance.Breavement,
                            AdvanceLeave = 0,
                            LeaveInBucket = 0,
                            PaternityLeave = leaveBalance.Paternity,
                            MaternityLeave = leaveBalance.Maternity,

                            CasualLeaveId = (int)LeaveEnum.CL,
                            EarnedLeaveId = (int)LeaveEnum.EL,
                            BreavementLeaveId = (int)LeaveEnum.BL,
                            AdvanceLeaveId = (int)LeaveEnum.AL,
                            LeaveInBucketId = (int)LeaveEnum.LB,
                            PaternityLeaveId = (int)LeaveEnum.PL,
                            MaternityLeaveId = (int)LeaveEnum.ML
                        }, transaction);

                        var accrualCheckSql = @"
                    SELECT COUNT(*) FROM [dbo].[AccrualUtilizedLeave]
                    WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId
                ";

                        var insertAccrualSql = @"
                    INSERT INTO [dbo].[AccrualUtilizedLeave]
                    ([EmployeeId], [LeaveId], [Date], [Description], [Accrued], [UtilizedOrRejected], [ClosingBalance], [CreatedOn], [CreatedBy])
                    VALUES
                    (@EmployeeId, @LeaveId, @CreatedDate, 'Admin Updated', 0, NULL, @Accrued, @CreatedDate, 'admin')
                ";


                        var casualExists = await connection.ExecuteScalarAsync<int>(accrualCheckSql, new
                        {
                            EmployeeId = employeeId,
                            LeaveId = (int)LeaveEnum.CL
                        }, transaction);

                        if (casualExists == 0)
                        {
                            await connection.ExecuteAsync(insertAccrualSql, new
                            {
                                EmployeeId = employeeId,
                                LeaveId = (int)LeaveEnum.CL,
                                CreatedDate = createdDate,
                                Accrued = leaveBalance.Casual
                            }, transaction);
                        }


                        if (isConfirmed)
                        {
                            var earnedExists = await connection.ExecuteScalarAsync<int>(accrualCheckSql, new
                            {
                                EmployeeId = employeeId,
                                LeaveId = (int)LeaveEnum.EL
                            }, transaction);

                            if (earnedExists == 0)
                            {
                                await connection.ExecuteAsync(insertAccrualSql, new
                                {
                                    EmployeeId = employeeId,
                                    LeaveId = (int)LeaveEnum.EL,
                                    CreatedDate = createdDate,
                                    Accrued = leaveBalance.Earned
                                }, transaction);
                            }
                        }

                        transaction.Commit();
                        return result;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }



        public async Task<int> UpdateEmploymentDetailAsync(EmploymentDetail employmentDetail)
        {
            var sql = @"UPDATE [EmploymentDetail] SET
             [JoiningDate] =@JoiningDate ,[BranchId] =@BranchId ,[EmploymentStatus]=@EmploymentStatus ,[LinkedInUrl] =@LinkedInUrl,[DepartmentId]=@DepartmentId  
             ,[BackgroundVerificationstatus]=@BackgroundVerificationstatus ,[CriminalVerification] =@CriminalVerification,[EmployeeStatus]=@EmployeeStatus 
              ,[TotalExperienceYear ] = @TotalExperienceYear
              ,[TotalExperienceMonth] = @TotalExperienceMonth
              ,[RelevantExperienceYear] = @RelevantExperienceYear
              ,[RelevantExperienceMonth] = @RelevantExperienceMonth
              ,[JobType] = @JobType
              ,[ConfirmationDate] = @ConfirmationDate
              ,[ExtendedConfirmationDate] = @ExtendedConfirmationDate
              ,[isProbExtended] = @isProbExtended
              ,[ProbExtendedWeeks] = @ProbExtendedWeeks
              ,[isConfirmed] = @isConfirmed
              ,[ProbationMonths] = @ProbationMonths 
              ,[ModifiedBy]=@ModifiedBy ,[ModifiedOn] = @ModifiedOn
              ,[TeamId]=@TeamId 
              ,[DesignationId]=@DesignationId
              ,[ReportingMangerId]=@ReportingMangerId
              ,[TimeDoctorUserId]=@TimeDoctorUserId
              ,[ImmediateManager]=@ImmediateManager
              ,[IsReportingManager] = @IsReportingManager
              WHERE ID= @ID";
            var sqlUserMap = "UPDATE [UserRoleMapping] SET [RoleId]=@RoleId WHERE [EmployeeId] = @EmployeeId";

            var sqlEmpCode = "UPDATE [EmployeeData] SET [EmployeeCode]= @EmployeeCode WHERE [Id] = @EmployeeId";
            var sqlEmployeeLeave = @"UPDATE [EmployeeLeave]
                             SET [IsActive] = 1
                             WHERE [EmployeeId] = @EmployeeId AND [LeaveId] = 2";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, employmentDetail);
                var resultUserMap = await connection.ExecuteAsync(sqlUserMap, new { RoleId = employmentDetail.RoleId, EmployeeId = employmentDetail.EmployeeId });
                var resultEmp = await connection.ExecuteAsync(sqlEmpCode, new { EmployeeCode = employmentDetail.EmployeeCode, EmployeeId = employmentDetail.EmployeeId });
                var resultLeave = await connection.ExecuteAsync(sqlEmployeeLeave, new { EmployeeId = employmentDetail.EmployeeId });

                return result;
            }
        }

        public async Task<int> ArchiveUnarchiveEmploymentDetails(EmployeeArchiveRequestDto employeeArchiveRequestDto)
        {
            var sql = "UPDATE [PreviousEmployer] SET IsDeleted = @IsArchived WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = employeeArchiveRequestDto.Id, IsArchived = employeeArchiveRequestDto.IsArchived });
                return result;
            }
        }

        public async Task<EmploymentResponseDto?> GetEmplyementDetailByIdAsync(long id)
        {
            var sql = $@"
                SELECT 
                    ED.[Id],
                    E.[EmployeeCode], 
                    ED.[EmployeeId], 
                    ED.[Email], 
                    ED.[JoiningDate], 
                    ED.[TeamId], 
                    DE.[Designation], 
                    ED.[ReportingMangerId] as ReportingManagerId,  
                    ED.IsManualAttendance, 
                    CONCAT(M.FirstName, 
                        CASE WHEN M.MiddleName IS NOT NULL THEN ' ' + M.MiddleName ELSE '' END, 
                        ' ', M.LastName) AS ReportingManagerName,
                    ED.ImmediateManager,
                    CONCAT(IM.FirstName, 
                        CASE WHEN IM.MiddleName IS NOT NULL THEN ' ' + IM.MiddleName ELSE '' END, 
                        ' ', IM.LastName) AS ImmediateManagerName,
                    ED.[LinkedInUrl], 
                    ED.[DepartmentId], 
                    ED.[BackgroundVerificationstatus],
                    ED.[CriminalVerification], 
                    T.[TeamName], 
                    D.[Department] As DepartmentName, 
                    [BranchId],
                    Ed.EmployeeStatus,
                    UM.[RoleId] As RoleId,
                    [TotalExperienceYear], 
                    [TotalExperienceMonth], 
                    [RelevantExperienceYear], 
                    [RelevantExperienceMonth],
                    ED.[JobType], 
                    ED.[ConfirmationDate], 
                    ED.[ExtendedConfirmationDate], 
                    ED.[isProbExtended],
                    ED.[DesignationId],
                    ED.[ProbExtendedWeeks], 
                    ED.[isConfirmed], 
                    ED.[IsReportingManager],
                    ED.[ProbationMonths],
                    (
                        SELECT PR.Id, PR.PreviousEmployerId, PR.FullName, PR.Email, PR.ContactNumber, PR.Designation 
                        FROM [ProfessionalReference] PR
                        JOIN [PreviousEmployer] PE ON PR.PreviousEmployerId = PE.Id
                        WHERE PE.EmployeeId = ED.EmployeeId FOR JSON PATH 
                    ) AS [ProfessionalReferenceJson], 
                    ED.[TimeDoctorUserId]
                FROM [EmploymentDetail] ED 
                LEFT JOIN EmployeeData E on E.Id = ED.EmployeeId
                LEFT JOIN Team T on T.Id = ED.TeamId
                LEFT JOIN Department D on D.Id = ED.DepartmentId
                LEFT JOIN Designation DE on DE.Id = ED.DesignationId
                LEFT JOIN UserRoleMapping UM on UM.EmployeeId = ED.EmployeeId
                LEFT JOIN EmployeeData M ON ED.ReportingMangerId = M.Id
                LEFT JOIN EmployeeData IM ON ED.ImmediateManager = IM.Id
                WHERE ED.[EmployeeId] = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<EmploymentResponseDto>(sql, new { Id = id });
                return result;
            }
        }


        public async Task<IEnumerable<EmployerDocumentType>> GetEmployerDocumentTypeList(int documentFor)
        {
            var sql = "SELECT Id, DocumentName FROM EmployerDocumentType WHERE IsDeleted = 0 AND DocumentFor IN (@documentFor, @Both)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<EmployerDocumentType>(sql, new { documentFor, DocumentFor.Both });
                return result.ToList();
            }
        }

        public async Task<IEnumerable<EmployeeForTimeDoctorStatsDto>> GetEmployeesForTimeDoctorStats(DateOnly date)
        {
            var sql = @"
                SELECT ed.Id, ed.EmployeeId, ed.TimeDoctorUserId FROM EmploymentDetail ed
                JOIN EmployeeData e ON e.Id = ed.EmployeeId
                WHERE e.IsDeleted = 0 
                AND ed.TimeDoctorUserId IS NOT NULL 
                AND ed.IsManualAttendance = 0
                AND NOT EXISTS (SELECT a.Id FROM Attendance a WHERE a.EmployeeId = e.Id AND a.[Date] = @Date)
            ";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<EmployeeForTimeDoctorStatsDto>(sql, new { Date = date });
                return result.ToList();
            }
        }

        public async Task<int> SaveCurrentEmployerDocument(CurrentEmployerDocument currentEmployerDocument)
        {
            var sql = @"INSERT INTO [CurrentEmployerDocument] 
            ([EmployeeId], [EmployeeDocumentTypeId], [FileName], [FileOriginalName], 
            [CreatedBy], [CreatedOn], [IsDeleted])
            VALUES
            (@EmployeeId, @EmployeeDocumentTypeId, @FileName, @FileOriginalName, @CreatedBy, @CreatedOn, 0)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, currentEmployerDocument);
                return result;
            }
        }

        public async Task<EmploymentDetail?> GetByIdAsync(long id)
        {
            var sql = @"SELECT  [Id] ,[EmployeeId] ,[Email]  ,[JoiningDate] ,[TeamId] ,[ReportingMangerId] ,[EmploymentStatus] ,[LinkedInUrl]
              ,[DepartmentId] ,[BackgroundVerificationstatus] ,[CriminalVerification] ,[BranchId]
              ,[SecReportingManagerId] ,[TotalExperienceYear] ,[TotalExperienceMonth] ,[RelevantExperienceYear] ,[RelevantExperienceMonth]  ,[JobType]
              ,[ConfirmationDate] ,[ExtendedConfirmationDate] ,[isProbExtended] ,[ProbExtendedWeeks] ,[isConfirmed] ,[ProbationMonths] 
              FROM  [EmploymentDetail] WHERE ISNULL(IsDeleted,0) = 0 AND Id =  @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<EmploymentDetail>(sql, new { Id = id });
                return result;
            }
        }

        public Task<IReadOnlyList<EmploymentDetail>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<int> AddAsync(EmploymentDetail entity)
        {
            throw new NotImplementedException();
        }

        public Task<int> UpdateAsync(EmploymentDetail entity)
        {
            throw new NotImplementedException();
        }

        public async Task<int> DeleteAsync(EmploymentDetail entity)
        {
            var sql = @"UPDATE [EmploymentDetail] SET IsDeleted = 1, ExitDate = CAST(GETUTCDATE() AS DATE),[ModifiedBy] = @ModifiedBy ,[ModifiedOn] =@ModifiedOn  WHERE Id = @Id;
                        UPDATE [Employmeedata] SET IsDeleted = 1,status = @ExEmployee,[ModifiedBy] = @ModifiedBy ,[ModifiedOn] =@ModifiedOn  WHERE Id = @EmployeeId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { entity, EmployeeStatusType.ExEmployee });
                return result;
            }
        }
        public async Task<bool> IsEmailExists(string Email)
        {
            var sql = @"Select Email from EmploymentDetail WHERE ISNULL(IsDeleted,0) = 0  and Email = @Email";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<string>(sql, new { Email });
                if (result != null && result.Length > 0)
                {
                    return true;
                }
                return false;
            }
        }
        public async Task<int> ArchiveUnarchiveDepartment(DepartmentArchiveRequestDto departmentArchiveRequestDto)
        {
            var sql = "UPDATE [Department] SET IsDeleted = @IsArchived WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = departmentArchiveRequestDto.Id, IsArchived = departmentArchiveRequestDto.IsArchived });
                return result;
            }
        }
        public async Task<int> ArchiveUnarchiveTeam(ArchiveTeamRequestDto teamArchiveRequestDto)
        {
            var sql = "UPDATE [Team] SET IsDeleted = @IsArchived WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = teamArchiveRequestDto.Id, IsArchived = teamArchiveRequestDto.IsArchived });
                return result;
            }
        }
        public async Task<int> ArchiveUnarchiveDesignation(DesignationArchiveRequestDto designationArchiveRequestDto)
        {
            var sql = "UPDATE [Designation] SET IsDeleted = @IsArchived WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = designationArchiveRequestDto.Id, IsArchived = designationArchiveRequestDto.IsArchived });
                return result;
            }
        }
        public async Task<EmploymentDetailsForDwnTwn?> GetEmplyementDetailAsync(string Email)
        {
            var sql = $@"SELECT CONCAT(E.FirstName, CASE WHEN E.MiddleName IS NOT NULL THEN ' ' + E.MiddleName ELSE '' END, ' ', E.LastName) AS EmployeeFullName, DE.[Designation],
                        [TotalExperienceYear], [TotalExperienceMonth], [RelevantExperienceYear], [RelevantExperienceMonth],  
                        (
                            SELECT uq.QualificationId,uq.CollegeUniversity, uq.AggregatePercentage, uq.StartYear, uq.EndYear,  q.ShortName as QualificationName, uq.DegreeName
							FROM UserQualificationInfo UQ  
							INNER JOIN Qualification q  on uq.QualificationId = q.Id
							WHERE ISNULL(UQ.IsDeleted,0) = 0 and  UQ.EmployeeId = ED.EmployeeId 
							FOR JSON PATH 
                        ) AS [EducationalDetailJson],E.[FileName], 
						( 
							Select pd.id, pd.EmployerName,ISNULL(pd.Designation,'') as Designation,Convert( Date,pd.StartDate) as StartDate, Convert(date,pd.EndDate)  as EndDate
							from PreviousEmployer as pd WHERE Pd.EmployeeId = ED.EmployeeId 
							FOR JSON PATH 
						) AS PreviousEmployerDetailJson,Email  
                        FROM [EmploymentDetail] ED 
						Left JOIN EmployeeData as E on E.Id = ED.EmployeeId 
                        Left JOIN Designation as DE on DE.Id = ED.DesignationId
                        Left Join UserRoleMapping UM on UM.EmployeeId = ED.EmployeeId
                        WHERE Email = @Email
                        ";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<EmploymentDetailsForDwnTwn>(sql, new { Email = Email });
                return result;
            }
        }
    }
}
