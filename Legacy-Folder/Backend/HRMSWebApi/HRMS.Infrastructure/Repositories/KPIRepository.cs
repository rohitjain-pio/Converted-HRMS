using System.Data;
using Microsoft.Data.SqlClient;
using System.IO.Pipelines;
using System.Reflection;
using System.Text;
using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.UserProfile;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks.Dataflow;

namespace HRMS.Infrastructure.Repositories
{
    public class KPIRepository : IKpiRepository
    {
        private readonly IConfiguration _configuration;
        public KPIRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<int> AddGoalAsync(KPIGoals request)
        {
            var sql = @"
                INSERT INTO [dbo].[KPIGoals]
                ([Title], [Description], [DepartmentId], [CreatedBy], [CreatedOn], [IsDeleted])
                VALUES (@Title, @Description, @DepartmentId, @CreatedBy, GETUTCDATE(), 0);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var insertedId = await connection.ExecuteScalarAsync<int>(sql, request);
                return insertedId;
            }
        }


        public async Task<int> DeleteGoalAsync(long goalId)
        {
            var sqlGoals = @"UPDATE KPIGoals SET IsDeleted = 1 WHERE Id = @goalId";
            var sqlDetails = @"UPDATE KPIDetails SET IsDeleted = 1 WHERE GoalId = @goalId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var affectedGoals = await connection.ExecuteAsync(sqlGoals, new { goalId }, transaction);
                        var affectedDetails = await connection.ExecuteAsync(sqlDetails, new { goalId }, transaction);

                        transaction.Commit();

                        return affectedGoals + affectedDetails;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }



        public async Task<KPIGoals?> GetByIdAsync(long id)
        {
            var sql = @"
                SELECT 
                    g.Id,
                    g.Title,
                    g.Description,
                    g.DepartmentId,
                    STRING_AGG(p.EmployeeId, ',') AS EmployeeIds
                FROM KPIGoals g
                LEFT JOIN KPIDetails d ON g.Id = d.GoalId AND d.IsDeleted = 0
                LEFT JOIN KPIPlan p ON d.PlanId = p.Id AND p.IsDeleted = 0
                WHERE g.Id = @id AND g.IsDeleted = 0
                GROUP BY g.Id, g.Title, g.Description, g.DepartmentId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<KPIGoals>(sql, new { Id = id });
                return result;
            }
        }


        public async Task<IEnumerable<(long Id, string EmployeeName, string EmployeeCode)>> GetEmployeesByManagerAsync(long reportingManagerId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var sql = @"
                SELECT ed.Id, CONCAT(ed.FirstName, ' ', ISNULL(ed.MiddleName + ' ', ''), ed.LastName) AS EmployeeName,ed.EmployeeCode
                FROM [dbo].[EmployeeData] ed
                LEFT JOIN [dbo].[EmploymentDetail] emp ON ed.Id = emp.EmployeeId
                WHERE emp.ReportingMangerId = @ReportingManagerId AND ed.IsDeleted = 0 AND emp.IsDeleted = 0";


                return await connection.QueryAsync<(long Id, string EmployeeName, string EmployeeCode)>(sql, new { ReportingManagerId = reportingManagerId });
            }
        }

        public async Task<KPIPlan?> GetKPIPlanByEmployeeIdAsync(long employeeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var sql = @"
                    SELECT Id, EmployeeId, AppraisalCycle, IsReviewed, ReviewDate, OverallProgress, AppraisalNote, AppraisalAttachment, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
                    FROM [dbo].[KPIPlan]
                    WHERE EmployeeId = @EmployeeId  AND  (IsReviewed is null or IsReviewed=0) AND Id =(SELECT MAX(KPL.Id) FROM KPIPlan KPL WHERE KPL.EmployeeId = @EmployeeId)";

                return await connection.QueryFirstOrDefaultAsync<KPIPlan>(sql, new { EmployeeId = employeeId });
            }
        }

        public async Task<long> CreateKPIPlanAsync(KPIPlan kpiPlan)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var sql = @"
                    INSERT INTO [dbo].[KPIPlan] (EmployeeId, CreatedOn, CreatedBy,IsDeleted)
                    OUTPUT INSERTED.Id
                    VALUES (@EmployeeId, GETUTCDATE(), @CreatedBy,0)";

                return await connection.ExecuteScalarAsync<long>(sql, kpiPlan);
            }
        }

        public async Task<KPIGoalsSearchResponseDto> GetGoalListAsync(SearchRequestDto<KPIGoalRequestDto> requestDto)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var result = await connection.QueryMultipleAsync(
                "[dbo].[GetKpiGoalsList]",
                new
                {
                    Title = requestDto.Filters.Title,
                    DepartmentId = requestDto.Filters.DepartmentId,
                    CreatedBy = requestDto.Filters.CreatedBy,
                    CreatedOnFrom = requestDto.Filters.CreatedOnFrom,
                    CreatedOnTo = requestDto.Filters.CreatedOnTo,
                    SortColumn = requestDto.SortColumnName,
                    SortDesc = requestDto.SortDirection?.ToLower() == "desc",
                    StartIndex = (Math.Max(requestDto.StartIndex, 1) - 1) * requestDto.PageSize,
                    PageSize = requestDto.PageSize
                },
                commandType: CommandType.StoredProcedure
            );

            var res = new KPIGoalsSearchResponseDto
            {
                TotalRecords = await result.ReadSingleOrDefaultAsync<int>(),
                GoalList = (await result.ReadAsync<GoalResponseDto>()).ToList()
            };
            return res;
        }


        public async Task<int> UpdateGoalAsync(KPIGoals goal)
        {
            var sql = @"UPDATE [dbo].[KPIGoals]
                SET Title = @Title,
                    Description = @Description,
                    DepartmentId = @DepartmentId,
                    ModifiedBy = @ModifiedBy,
                    ModifiedOn = GETUTCDATE()
                WHERE Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, goal);
                return result;
            }
        }

        public async Task<int> AssignGoalToEmployeeAsync(KPIDetails detail)
        {
            const int AlreadyAssigned = -1;
            const int InsertFailed = 0;

            var checkSql = @"
                SELECT COUNT(1)
                FROM [dbo].[KPIDetails]
                WHERE PlanID = @PlanID AND GoalID = @GoalID AND IsDeleted = 0";

            var insertSql = @"
                INSERT INTO [dbo].[KPIDetails]
                ([PlanID], [GoalID], [AllowedQuarter], [CreatedBy], [CreatedOn], [IsDeleted])
                VALUES (@PlanID, @GoalID, 'Q1,Q2,Q3,Q4', @CreatedBy, @CreatedOn, 0);";
                
            //Set IsReviewed to NULL when a new goal is assigned to that an employee can submit the plan again
            var updateKPIPlanSql = @"
                UPDATE [dbo].[KPIPlan]
                SET IsReviewed = NULL
                WHERE Id = @PlanID;";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var exists = await connection.ExecuteScalarAsync<int>(checkSql, new { detail.PlanId, detail.GoalId });

                if (exists > 0)
                {
                    return AlreadyAssigned;
                }

                var rowsAffected = await connection.ExecuteAsync(insertSql, detail);

                if (rowsAffected > 0)
                {
                    await connection.ExecuteAsync(updateKPIPlanSql, new { PlanID = detail.PlanId });
                    return rowsAffected;
                }

                return InsertFailed;
            }
        }
        public async Task<int> RevokeGoalFromEmployeeAsync(KPIDetails detail)
        {
            var sql = @"
                UPDATE [dbo].[KPIDetails]
                SET IsDeleted = 1,
                    ModifiedBy = @ModifiedBy,
                    ModifiedOn = GETUTCDATE()
                WHERE PlanId = @PlanId AND GoalId = @GoalId AND IsDeleted = 0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { detail.ModifiedBy, detail.PlanId, detail.GoalId });
                return result;
            }
        }


        public async Task<GetEmpListResponseDto> GetEmployeesKPIAsync(Roles roleId, int? SessionUserId, SearchRequestDto<GetEmpByManagerRequestDto> requestDto)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryMultipleAsync("GetEmployeesKPI", new
                {
                    SessionUserId = SessionUserId,
                    roleId = roleId,
                    EmployeeName = requestDto.Filters.EmployeeName?.Trim() ?? string.Empty,
                    EmployeeCode = requestDto.Filters.EmployeeCode?.Trim() ?? string.Empty,
                    AppraisalDateFrom = requestDto.Filters.AppraisalDateFrom,
                    AppraisalDateTo = requestDto.Filters.AppraisalDateTo,
                    ReviewDateFrom = requestDto.Filters.ReviewDateFrom,
                    ReviewDateTo = requestDto.Filters.ReviewDateTo,
                    StatusFilter = requestDto.Filters.StatusFilter,
                    SortColumnName = requestDto.SortColumnName ?? string.Empty,
                    SortColumnDirection = requestDto.SortDirection?.ToUpper() ?? "ASC",
                    PageNumber = requestDto.StartIndex,
                    PageSize = requestDto.PageSize
                }, commandType: CommandType.StoredProcedure);
                var totalCount = await result.ReadSingleOrDefaultAsync<int>();
                var data = (await result.ReadAsync<EmployeeByManagerResponse>()).ToList();
                return new GetEmpListResponseDto
                {
                    GoalList = data,
                    TotalRecords = totalCount
                };
            }
        }

        public async Task<IEnumerable<ReportingManagerResponseDto?>> GetEmployeesByManagerAsync(int? SessionUserId, Roles RoleId)
        {
            var sql = @"Select E.Id, FirstName, MiddleName ,LastName, 
                        Email from EmployeeData as E LEFT JOIN EmploymentDetail  as ED ON E.Id = ED.EmployeeId ";

            if (RoleId != Roles.SuperAdmin)
            {
                sql += "Where ED.ReportingMangerId = @SessionUserId OR ED.ImmediateManager = @SessionUserId ";
            }


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<ReportingManagerResponseDto?>(sql, new { SessionUserId = SessionUserId });
                return result.ToList();
            }
        }

        public async Task<IEnumerable<GetSelfRatingResponseDto>> GetSelfRatingAsync(long? PlanId, long? EmployeeId)
        {
            var sql = @"
                SELECT 
                    e.EmployeeCode,
                    CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
                    emp.Email,
                    emp.JoiningDate,
                    p.EmployeeId,
                    (SELECT TOP 1 ReviewDate 
                    FROM [dbo].[KPIPlan] kp 
                    WHERE kp.EmployeeId = p.EmployeeId AND kp.IsReviewed = 1 AND kp.IsDeleted = 0 ORDER BY kp.Id DESC) AS ReviewDate,
                    p.IsReviewed,
                    k.PlanId,
                    k.GoalId,
                    k.Q1_Rating,
                    k.Q2_Rating,
                    k.Q3_Rating,
                    k.Q4_Rating,
                    k.Q1_Note,
                    k.Q2_Note,
                    k.Q3_Note,
                    k.Q4_Note,
                    k.Status,
                    k.ManagerRating,
                    k.ManagerNote,
                    k.TargetExpected,
                    k.AllowedQuarter,
                    g.Title AS GoalTitle
                FROM [dbo].[KPIDetails] k
                LEFT JOIN [dbo].[KPIPlan] p ON k.PlanId = p.Id
                LEFT JOIN [dbo].[EmployeeData] e ON p.EmployeeId = e.Id
                LEFT JOIN [dbo].[KPIGoals] g ON k.GoalId = g.Id
                LEFT JOIN [dbo].[EmploymentDetail] emp ON p.EmployeeId = emp.EmployeeId
                WHERE 
                    k.IsDeleted = 0";

            object parameters;
            if (PlanId != null)
            {
                sql += " AND k.PlanId = @PlanId";
                parameters = new { PlanId };
            }
            else if (EmployeeId != null)
            {
                sql += " AND p.EmployeeId = @EmployeeId AND p.IsDeleted = 0 AND P.Id = (SELECT MAX(KPL.Id) FROM KPIPlan KPL WHERE KPL.EmployeeId = @EmployeeId)";

                parameters = new { EmployeeId };
            }
            else
            {
                throw new ArgumentException("Either PlanId or EmployeeId must be provided.");
            }

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                try
                {
                    connection.Open();
                    var result = await connection.QueryAsync(sql, parameters);

                    var grouped = result
                        .GroupBy(r => new { r.EmployeeCode, r.EmployeeId, r.PlanId, r.EmployeeName, r.Email, r.JoiningDate, r.IsReviewed, r.ReviewDate })
                        .Select(g => new GetSelfRatingResponseDto
                        {
                            EmployeeCode = g.Key.EmployeeCode,
                            EmployeeId = g.Key.EmployeeId,
                            EmployeeName = g.Key.EmployeeName,
                            JoiningDate = DateOnly.FromDateTime(g.Key.JoiningDate),
                            ReviewDate = g.Key.ReviewDate != null ? DateOnly.FromDateTime(g.Key.ReviewDate) : null,
                            IsReviewed = g.Key.IsReviewed,
                            Email = g.Key.Email,
                            PlanId = g.Key.PlanId,
                            Ratings = g.Select(r => new GetSelfRatingListDto
                            {
                                GoalId = r.GoalId,
                                Q1_Rating = r.Q1_Rating,
                                Q2_Rating = r.Q2_Rating,
                                Q3_Rating = r.Q3_Rating,
                                Q4_Rating = r.Q4_Rating,
                                Q1_Note = r.Q1_Note,
                                Q2_Note = r.Q2_Note,
                                Q3_Note = r.Q3_Note,
                                Q4_Note = r.Q4_Note,
                                ManagerRating = r.ManagerRating,
                                ManagerNote = r.ManagerNote,
                                GoalTitle = r.GoalTitle,
                                TargetExpected = r.TargetExpected,
                                AllowedQuarter = r.AllowedQuarter,
                                Status = r.Status
                            }).ToList()
                        }).ToList();
                    return grouped;
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Error retrieving self-rating data", ex);
                }
            }
        }

        public async Task<int> UpdateSelfRatingAsync(KPIDetails kPIDetails, string quarter)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string[] quarters = ["Q1", "Q2", "Q3", "Q4"];
                if (!quarters.Any(q => q.Equals(quarter, StringComparison.OrdinalIgnoreCase)))
                    return 0;

                var ratingColumn = $"{quarter}_Rating";
                var noteColumn = $"{quarter}_Note";

                var query = $@"
                    UPDATE [dbo].[KPIDetails]
                    SET {ratingColumn} = @Rating,
                        {noteColumn} = @Note,
                        Status = 0,
                        ModifiedBy = @ModifiedBy,
                        ModifiedOn = @ModifiedOn
                    WHERE GoalId = @GoalId 
                    AND PlanId = @PlanId
                    AND IsDeleted = 0
                    AND (Status = 0 OR Status IS NULL)";

                var parameters = new
                {
                    Rating = quarter switch
                    {
                        "Q1" => kPIDetails.Q1_Rating,
                        "Q2" => kPIDetails.Q2_Rating,
                        "Q3" => kPIDetails.Q3_Rating,
                        "Q4" => kPIDetails.Q4_Rating,
                        _ => null
                    },
                    Note = quarter switch
                    {
                        "Q1" => kPIDetails.Q1_Note,
                        "Q2" => kPIDetails.Q2_Note,
                        "Q3" => kPIDetails.Q3_Note,
                        "Q4" => kPIDetails.Q4_Note,
                        _ => null
                    },
                    kPIDetails.GoalId,
                    kPIDetails.PlanId,
                    kPIDetails.ModifiedBy,
                    kPIDetails.ModifiedOn
                };

                return await connection.ExecuteAsync(query, parameters);
            }
        }

        public async Task<KPIDetails?> GetKpiDetailAsync(long goalId, long planId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var query = @"
                    SELECT * 
                    FROM [dbo].[KPIDetails]
                    WHERE GoalId = @GoalId 
                    AND PlanId = @PlanId
                    AND IsDeleted = 0";

                return await connection.QueryFirstOrDefaultAsync<KPIDetails>(query, new { GoalId = goalId, PlanId = planId });
            }
        }


        public async Task<int> UpdateEmployeeRatingByManagerAsync(KPIDetails kPIDetails)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var query = @"
            UPDATE [dbo].[KPIDetails]
            SET ManagerRating = @ManagerRating,
                ManagerNote = @ManagerNote,
                ModifiedBy = @ModifiedBy,
                ModifiedOn = @ModifiedOn
            WHERE GoalId = @GoalId 
              AND PlanId = @PlanId";

                var parameters = new
                {
                    kPIDetails.ManagerRating,
                    kPIDetails.ManagerNote,
                    kPIDetails.GoalId,
                    kPIDetails.PlanId,
                    kPIDetails.ModifiedBy,
                    kPIDetails.ModifiedOn,

                };

                return await connection.ExecuteAsync(query, parameters);
            }
        }

        public async Task<int> SubmitKPIPlanByEmployeeAsync(long planId)
        {
            var sqlKPIDetails = @"
                UPDATE KPIDetails 
                SET Status = 1 
                WHERE PlanId = @planId 
                AND IsDeleted = 0 
                AND (Status = 0 OR Status IS NULL);";

            var sqlKPIPlan = @"
                UPDATE KPIPlan
                SET IsReviewed = 0
                WHERE Id = @planId 
                AND IsDeleted = 0;";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var affectedRows1 = await connection.ExecuteAsync(sqlKPIDetails, new { planId }, transaction);
                        var affectedRows2 = await connection.ExecuteAsync(sqlKPIPlan, new { planId }, transaction);

                        transaction.Commit();
                        return affectedRows1 + affectedRows2;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public async Task<int> UpdateKPIDetailsAsync(long planId, AssignGoalByManagerRequestDto requestDto)
        {
            using (var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                await connection.OpenAsync();

                var existing = await connection.QueryFirstOrDefaultAsync<KPIDetails>(
                    @"SELECT AllowedQuarter, TargetExpected 
                    FROM KPIDetails 
                    WHERE GoalId = @GoalId AND PlanId = @PlanId",
                    new { requestDto.GoalId, PlanId = planId });

                if (existing == null)
                    return 0;

                if (existing.AllowedQuarter == requestDto.AllowedQuarter &&
                    existing.TargetExpected == requestDto.TargetExpected)
                {
                    return 0;
                }

                var sql = @"UPDATE KPIDetails 
                            SET AllowedQuarter = @AllowedQuarter, 
                                TargetExpected = @TargetExpected 
                            WHERE GoalId = @GoalId AND PlanId = @PlanId";

                var parameters = new
                {
                    requestDto.AllowedQuarter,
                    requestDto.TargetExpected,
                    requestDto.GoalId,
                    PlanId = planId
                };

                return await connection.ExecuteAsync(sql, parameters);
            }
        }

        public async Task<IEnumerable<long>> GetAssignedEmployeeIdsAsync(long goalId)
        {
            const string query = @"
                SELECT DISTINCT kp.EmployeeId
                FROM KPIDetails kd
                LEFT JOIN KPIPlan kp ON kd.PlanId = kp.Id
                WHERE kd.GoalId = @GoalId AND kd.IsDeleted = 0 AND kp.IsDeleted = 0 AND (kp.IsReviewed is NULL OR kp.IsReviewed=0)";

            using (var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                var employeeIds = await connection.QueryAsync<long>(query, new { GoalId = goalId });
                return employeeIds;
            }
        }
        public async Task<int> SubmitKPIPlanByManagerAsync(long planId)
        {
            var sqlKPIPlan = @"
                UPDATE KPIPlan
                SET IsReviewed = 1,
                    ReviewDate = GETUTCDATE()
                WHERE Id = @planId 
                AND IsDeleted = 0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var affectedRows = await connection.ExecuteAsync(sqlKPIPlan, new { planId });
                return affectedRows;
            }
        }

        public async Task<int> AddManagerRatingHistoryAsync(ManagerRatingHistory managerRatingHistory)
        {
            var sql = @"
                INSERT INTO [dbo].[ManagerRatingHistory]
                ([PlanId], [GoalId], [ManagerId], [ManagerRating], [ManagerComment], [CreatedBy], [CreatedOn], [IsDeleted])
                VALUES (@PlanId, @GoalId, @ManagerId, @ManagerRating, @ManagerComment, @CreatedBy, GETDATE(), 0);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var insertedId = await connection.ExecuteScalarAsync<int>(sql, managerRatingHistory);
                return insertedId;
            }
        }

        public async Task<IEnumerable<ManagerRatingHistoryByGoalResponseDto>> GetManagerRatingHistoryByGoalAsync(GetRatingHistoryRequestDto requestDto)
        {
            var sql = @"
                SELECT
                    mrh.ManagerId,
                    CONCAT(ed.FirstName, ' ', ISNULL(ed.MiddleName + ' ', ''), ed.LastName) AS ManagerName,
                    mrh.ManagerRating,
                    mrh.ManagerComment,
                    mrh.CreatedOn
                FROM [dbo].[ManagerRatingHistory] mrh
                LEFT JOIN [dbo].[EmployeeData] ed ON mrh.ManagerId = ed.Id
                WHERE 
                    mrh.IsDeleted = 0
                    AND mrh.PlanId = @PlanId
                    AND mrh.GoalId = @GoalId
                ORDER BY mrh.CreatedOn DESC";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<ManagerRatingHistoryByGoalResponseDto>(sql, new { requestDto.PlanId, requestDto.GoalId });
            }
        }

        public async Task<IEnumerable<GetEmployeeRatingByManagerResponseDto>> GetEmployeeRatingByManagerAsync(long EmployeeId)
        {
            var sql = @"
                SELECT 
                    e.EmployeeCode,
                    CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
                    emp.Email,
                    emp.JoiningDate,
                    p.EmployeeId,
                    p.Id AS PlanId,
                    p.ReviewDate,
                    p.IsReviewed,
                    (SELECT TOP 1 ReviewDate 
                    FROM [dbo].[KPIPlan] kp 
                    WHERE kp.EmployeeId = p.EmployeeId AND kp.IsReviewed = 1 AND kp.IsDeleted = 0 
                    ORDER BY kp.Id DESC) AS LastAppraisal,
                    NULL AS NextAppraisal, 
                    k.GoalId,
                    k.Q1_Rating,
                    k.Q2_Rating,
                    k.Q3_Rating,
                    k.Q4_Rating,
                    k.Q1_Note,
                    k.Q2_Note,
                    k.Q3_Note,
                    k.Q4_Note,
                    k.Status,
                    k.ManagerRating,
                    k.ManagerNote,
                    k.TargetExpected,
                    k.AllowedQuarter,
                    g.Title AS GoalTitle,
                    p.CreatedOn
                FROM [dbo].[KPIPlan] p
                LEFT JOIN [dbo].[KPIDetails] k ON k.PlanId = p.Id AND k.IsDeleted = 0
                LEFT JOIN [dbo].[EmployeeData] e ON p.EmployeeId = e.Id
                LEFT JOIN [dbo].[KPIGoals] g ON k.GoalId = g.Id
                LEFT JOIN [dbo].[EmploymentDetail] emp ON p.EmployeeId = emp.EmployeeId
                WHERE 
                p.IsDeleted = 0 
                AND p.EmployeeId = @EmployeeId
            ORDER BY p.CreatedOn DESC";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                try
                {
                    connection.Open();
                    var result = await connection.QueryAsync(sql, new { EmployeeId });

                    var grouped = result
                    .GroupBy(r => new { r.EmployeeCode, r.EmployeeId, r.EmployeeName, r.Email, r.JoiningDate })
                    .Select(g => new GetEmployeeRatingByManagerResponseDto
                    {
                        EmployeeCode = g.Key.EmployeeCode,
                        EmployeeId = g.Key.EmployeeId,
                        EmployeeName = g.Key.EmployeeName,
                        Email = g.Key.Email,
                        JoiningDate = g.Key.JoiningDate != null ? DateOnly.FromDateTime(g.Key.JoiningDate) : null,
                        Ratings = g
                            .GroupBy(r => new { r.PlanId, r.ReviewDate, r.IsReviewed, r.LastAppraisal, r.NextAppraisal })
                            .Select(p => new PlanRatingDto
                            {
                                PlanId = p.Key.PlanId,
                                ReviewDate = p.Key.ReviewDate != null ? DateOnly.FromDateTime(p.Key.ReviewDate) : null,
                                IsReviewed = p.Key.IsReviewed,
                                LastAppraisal = p.Key.LastAppraisal != null ? DateOnly.FromDateTime(p.Key.LastAppraisal) : null,
                                NextAppraisal = p.Key.NextAppraisal != null ? DateOnly.FromDateTime(p.Key.NextAppraisal) : null,
                                Goals = p
                                    .Where(r => r.GoalId != null) // Only include goals that exist
                                    .Select(r => new GetSelfRatingListDto
                                    {
                                        GoalId = r.GoalId,
                                        Q1_Rating = r.Q1_Rating,
                                        Q2_Rating = r.Q2_Rating,
                                        Q3_Rating = r.Q3_Rating,
                                        Q4_Rating = r.Q4_Rating,
                                        Q1_Note = r.Q1_Note,
                                        Q2_Note = r.Q2_Note,
                                        Q3_Note = r.Q3_Note,
                                        Q4_Note = r.Q4_Note,
                                        ManagerRating = r.ManagerRating,
                                        ManagerNote = r.ManagerNote,
                                        GoalTitle = r.GoalTitle,
                                        TargetExpected = r.TargetExpected,
                                        AllowedQuarter = r.AllowedQuarter,
                                        Status = r.Status
                                    }).ToList()
                            }).ToList()
                    }).ToList();

                    return grouped;
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Error retrieving manager rating data", ex);
                }
            }
        }
    }
}