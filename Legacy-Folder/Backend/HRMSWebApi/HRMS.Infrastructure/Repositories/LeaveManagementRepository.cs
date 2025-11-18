using HRMS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;
using Dapper;
using HRMS.Infrastructure.Interface;
using HRMS.Models.Models.Leave;
using HRMS.Models;
using HRMS.Domain.Enums;
using System.Globalization;
using System.Transactions;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{

    public class LeaveManagementRepository : ILeaveManagementRepository
    {
        private readonly IConfiguration _configuration;
        public LeaveManagementRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<IEnumerable<LeaveTypeResponseDto?>> GetEmployeeLevesAsync()
        {
            var sql = "SELECT LT.Id, Title,ShortName,EL.OpeningBalance FROM LeaveType LT LEFT JOIN EmployeeLeave EL ON EL.LeaveId=LT.Id ";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<LeaveTypeResponseDto?>(sql);
                return result.ToList();
            }
        }
        public async Task<IEnumerable<EmployeeLeaveResponseDto>> GetEmployeeLevesByIdAsync(long id)
        {
            var sql = @"
                SELECT 
                    el.EmployeeId,
                    lt.Title,
                    lt.ShortName,
                    el.LeaveId,
                    el.OpeningBalance,
                    SUM(aul.Accrued) AS AccruedLeave,
                    el.IsActive,
                    (SELECT TOP 1 aul2.ClosingBalance 
                     FROM [dbo].[AccrualUtilizedLeave] aul2 
                     WHERE aul2.EmployeeId = el.EmployeeId 
                       AND aul2.LeaveId = el.LeaveId 
                     ORDER BY aul2.Id DESC) AS ClosingBalance 
                FROM 
                    [dbo].[EmployeeLeave] el
                LEFT JOIN 
                    [dbo].[AccrualUtilizedLeave] aul 
                    ON el.EmployeeId = aul.EmployeeId 
                       AND el.LeaveId = aul.LeaveId
                       AND YEAR(aul.Date) = (
                SELECT MAX(YEAR(Date)) FROM [dbo].[AccrualUtilizedLeave]
                )
                JOIN 
                    [dbo].[LeaveType] lt ON el.LeaveId = lt.Id
                JOIN [dbo].EmployeeData ED ON ED.Id = el.EmployeeId
                WHERE 
                    el.EmployeeId = @Id
	                AND ((ED.Gender = 1 AND lt.ShortName <> 'ML') OR (ED.Gender = 2 AND lt.ShortName <> 'PL') OR (ED.Gender NOT IN (1,2) OR ED.Gender IS NULL) OR EL.IsActive = 1)
                GROUP BY 
                    el.EmployeeId,
                    lt.Title,
                    lt.ShortName,
                    el.LeaveId,
                    el.OpeningBalance,
                    el.IsActive
                ORDER BY 
                    el.LeaveId;
            ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<EmployeeLeaveResponseDto>(sql, new { Id = id });
                return result.ToList();
            }
        }


        public async Task<bool> UpdateLeaveBalanceAsync(EmployeeLeave request)
        {
            var connectionString = _configuration.GetConnectionString(ConnectionStrings.DefaultConnection);

            using (IDbConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Fetch existing leave record
                        var existingLeave = await connection.QueryFirstOrDefaultAsync<EmployeeLeave>(
                            @"SELECT * FROM EmployeeLeave 
                      WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId",
                            new { request.EmployeeId, request.LeaveId },
                            transaction);

                        if (existingLeave == null)
                            return false;

                        // Get latest closing balance from AccrualUtilizedLeave
                        var previousClosingBalance = await connection.QueryFirstOrDefaultAsync<decimal?>(
                            @"SELECT TOP 1 ClosingBalance 
                      FROM AccrualUtilizedLeave 
                      WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId 
                      ORDER BY Id DESC",
                            new { request.EmployeeId, request.LeaveId },
                            transaction) ?? 0;


                        decimal balanceDiff = (request.OpeningBalance != existingLeave.OpeningBalance)
                                              ? request.OpeningBalance - existingLeave.OpeningBalance
                                              : request.OpeningBalance;




                        // Update EmployeeLeave table
                        var sqlLeaveBalance = @"
                        UPDATE [EmployeeLeave]
                        SET OpeningBalance = @OpeningBalance,
                            IsActive = @IsActive,
                            ModifiedBy = @ModifiedBy,
                            ModifiedOn = GETUTCDATE()
                        WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId";

                        var resultLeaveBalance = await connection.ExecuteAsync(sqlLeaveBalance, new
                        {
                            OpeningBalance = request.OpeningBalance,
                            IsActive = request.IsActive,
                            ModifiedBy = request.ModifiedBy,
                            EmployeeId = request.EmployeeId,
                            LeaveId = request.LeaveId
                        }, transaction);

                        // Insert into AccrualUtilizedLeave

                        // Check if any records exist in AccrualUtilizedLeave for this employeeid/leaveid
                        var hasExistingAccruals = await connection.ExecuteScalarAsync<int>(
                            @"SELECT COUNT(1) 
                             FROM AccrualUtilizedLeave 
                             WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId",
                            new { request.EmployeeId, request.LeaveId },
                            transaction) > 0;


                        var accrualInsert = @"
                            INSERT INTO AccrualUtilizedLeave
                            (EmployeeId, LeaveId, [Date], Description, Accrued, UtilizedOrRejected, ClosingBalance, CreatedOn, CreatedBy)
                            VALUES
                            (@EmployeeId, @LeaveId, GETUTCDATE(), @Description, @Accrued, 0, @ClosingBalance, GETUTCDATE(), @CreatedBy)";

                        // Only insert into AccrualUtilizedLeave if it is first insert or Opening balance has changed
                        if (!hasExistingAccruals || request.OpeningBalance != existingLeave.OpeningBalance)
                        {
                            await connection.ExecuteAsync(accrualInsert, new
                            {
                                EmployeeId = request.EmployeeId,
                                LeaveId = request.LeaveId,
                                Description = !string.IsNullOrWhiteSpace(request.Description)
                                    ? $"Admin Updated:\n{request.Description}"
                                    : (request.IsActive ? "Leave Enabled" : "Leave Disabled"),
                                Accrued = 0,
                                ClosingBalance = previousClosingBalance + balanceDiff,
                                CreatedBy = request.ModifiedBy
                            }, transaction);
                        }
                        else
                        {
                            await connection.ExecuteAsync(accrualInsert, new
                            {
                                EmployeeId = request.EmployeeId,
                                LeaveId = request.LeaveId,
                                Description = !string.IsNullOrWhiteSpace(request.Description)
                                   ? $"Admin Updated:\n{request.Description}"
                                   : (request.IsActive ? "Leave Enabled" : "Leave Disabled"),
                                Accrued = 0,
                                ClosingBalance = previousClosingBalance,
                                CreatedBy = request.ModifiedBy
                            }, transaction);
                        }


                        transaction.Commit();
                        return resultLeaveBalance > 0;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }



        public async Task<LeaveHistoryTotalRecordsResponseDto> GetLeaveHistoryByEmployeeIdAsync(long employeeId, SearchRequestDto<LeaveHistoryFilterDto> request)
        {
            var filter = request.Filters;
            var sqlBuilder = new StringBuilder();
            var countSqlBuilder = new StringBuilder();

            sqlBuilder.Append(@"
                SELECT 
                    AL.Id,
                    AL.LeaveId,
                    LT.ShortName AS LeaveShortName,
                    LT.Title AS LeaveTitle,
                    AL.TotalLeaveDays,       
                    AL.Reason,
                    AL.StartDate,
                    AL.EndDate,
                    AL.Status,
                    AL.StartDateSlot,
                    AL.EndDateSlot
                FROM AppliedLeaves AL
                INNER JOIN LeaveType LT ON AL.LeaveId = LT.Id
                WHERE AL.EmployeeId = @EmployeeId
            ");

            countSqlBuilder.Append(@"
                SELECT COUNT(1)
                FROM AppliedLeaves AL
                INNER JOIN LeaveType LT ON AL.LeaveId = LT.Id
                WHERE AL.EmployeeId = @EmployeeId
            ");

            //  Apply date filter if present
            if (filter.StartDate.HasValue || filter.EndDate.HasValue)
            {
                var dateFilter = @"
                     AND (
                         (@StartDate IS NULL OR @StartDate BETWEEN AL.StartDate AND AL.EndDate OR AL.StartDate >= @StartDate) AND
                         (@EndDate IS NULL OR @EndDate BETWEEN AL.StartDate AND AL.EndDate OR AL.EndDate <= @EndDate)
                     )
                ";

                sqlBuilder.Append(dateFilter);
                countSqlBuilder.Append(dateFilter);
            }

            //  Apply leave type filter if present
            if (filter.LeaveType > 0)
            {
                var leaveTypeFilter = @" AND AL.LeaveId = @LeaveType ";
                sqlBuilder.Append(leaveTypeFilter);
                countSqlBuilder.Append(leaveTypeFilter);
            }

            // Sorting
            if (!string.IsNullOrEmpty(request.SortColumnName))
            {
                string sortColumn = request.SortColumnName switch
                {
                    "StartDate" => "StartDate",
                    "EndDate" => "EndDate",
                    "LeaveId" => "LeaveId",
                    "Status" => "Status",
                    "CreatedOn" => "AL.CreatedOn",
                    "ModifiedOn" => "AL.ModifiedOn",
                    "TotalLeaveDays" => "TotalLeaveDays",
                    _ => "AL.StartDate"
                };

                string direction = request.SortDirection?.ToUpper() == "ASC" ? "ASC" : "DESC";
                sqlBuilder.Append($" ORDER BY {sortColumn} {direction} ");
            }
            else
                sqlBuilder.Append(" ORDER BY AL.StartDate DESC ");

            sqlBuilder.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY; ");

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                int pageNumber = request.StartIndex < 1 ? 1 : request.StartIndex;
                int offset = (pageNumber - 1) * request.PageSize;

                var parameters = new
                {
                    EmployeeId = employeeId,
                    StartDate = filter.StartDate,
                    EndDate = filter.EndDate,
                    LeaveType = (int)filter.LeaveType,
                    Offset = offset,
                    request.PageSize
                };

                var rawResult = await connection.QueryAsync<dynamic>(sqlBuilder.ToString(), parameters);

                var totalCount = await connection.ExecuteScalarAsync<int>(countSqlBuilder.ToString(), parameters);

                var leaveHistoryList = rawResult.Select(item =>
                {
                    return new LeaveHistoryResponseDto
                    {
                        Id = item.Id,
                        LeaveId = item.LeaveId,
                        LeaveShortName = item.LeaveShortName,
                        LeaveTitle = item.LeaveTitle,
                        Reason = item.Reason,
                        StartDate = DateOnly.FromDateTime((DateTime)item.StartDate),
                        StartDateSlot = (LeaveDayPart)item.StartDateSlot,
                        EndDate = DateOnly.FromDateTime((DateTime)item.EndDate),
                        EndDateSlot = (LeaveDayPart)item.EndDateSlot,
                        Status = (LeaveStatus)item.Status,
                        TotalDays = Convert.ToDouble(item.TotalLeaveDays)
                    };
                }).ToList();

                return new LeaveHistoryTotalRecordsResponseDto
                {
                    leaveHistoryList = leaveHistoryList,
                    TotalRecords = totalCount
                };
            }
        }



        public async Task<AccrualUtilizedLeave?> GetEmployeeLeaveBalanceAsync(int employeeId, int leaveId)
        {
            var sql = @"
        SELECT TOP 1 * 
        FROM AccrualUtilizedLeave 
        WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId
        ORDER BY  Id DESC";  // Latest record first

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();

            return await connection.QueryFirstOrDefaultAsync<AccrualUtilizedLeave>(sql, new
            {
                EmployeeId = employeeId,
                LeaveId = leaveId
            });
        }

        public async Task<int> ApplyLeaveAsync(EmployeeLeaveApplyRequestDto request, decimal updatedBalance, string createdBy)
        {
            var insertSql = @"INSERT INTO AppliedLeaves 
        (EmployeeId, LeaveId, ReportingManagerId, Status, Reason, StartDate, StartDateSlot, EndDate, EndDateSlot, AttachmentPath, CreatedOn, CreatedBy, TotalLeaveDays)
        VALUES 
        (@EmployeeId, @LeaveId, @ReportingManagerId, @Status, @Reason, @StartDate, @StartDateSlot, @EndDate, @EndDateSlot, @AttachmentPath, @CreatedOn, @CreatedBy, @TotalLeaveDays)";

            var fetchManagerSql = @"SELECT ReportingMangerId 
                            FROM EmploymentDetail 
                            WHERE EmployeeId = @EmployeeId";

            // Checking Duplicate in AppliedLeaves
            var checkDuplicateSql = @"
            SELECT COUNT(1)
            FROM AppliedLeaves
            WHERE EmployeeId = @EmployeeId
            AND Status IN (1, 2)
            AND (
                (@StartDate BETWEEN StartDate AND EndDate)
                OR (@EndDate BETWEEN StartDate AND EndDate)
                OR (StartDate BETWEEN @StartDate AND @EndDate) 
                OR (EndDate BETWEEN @StartDate AND @EndDate) 
            )";


            const string lastClosingBalanceSql = @"
        SELECT TOP 1 ClosingBalance
        FROM AccrualUtilizedLeave
        WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId
        ORDER BY Id DESC";

            const string insertAccrualSql = @"
        INSERT INTO AccrualUtilizedLeave
        (EmployeeId, LeaveId, [Date], Description, Accrued, UtilizedOrRejected, ClosingBalance, CreatedOn, CreatedBy)
        VALUES
        (@EmployeeId, @LeaveId, GETUTCDATE(), @Description, NULL, @Utilized, @ClosingBalance, GETUTCDATE(), @CreatedBy)";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {

                var duplicateExists = await connection.ExecuteScalarAsync<int>
                (checkDuplicateSql, new
                {
                    EmployeeId = request.EmployeeId,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate
                },
                transaction
                );

                if (duplicateExists > 0)
                {
                    await transaction.RollbackAsync();
                    return -1;
                }


                var reportingManagerId = await connection.QueryFirstOrDefaultAsync<int?>(
                    fetchManagerSql,
                    new { EmployeeId = request.EmployeeId },
                    transaction: transaction
                );

                if (reportingManagerId == null)
                {
                    await transaction.RollbackAsync();
                    return 0;
                }

                await connection.ExecuteAsync(insertSql, new
                {
                    EmployeeId = request.EmployeeId,
                    LeaveId = request.LeaveId,
                    ReportingManagerId = reportingManagerId,
                    Status = LeaveStatus.Pending,
                    Reason = request.Reason,
                    StartDate = request.StartDate,
                    StartDateSlot = request.StartDateSlot,
                    EndDate = request.EndDate,
                    EndDateSlot = request.EndDateSlot,
                    AttachmentPath = request.Attachment,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = createdBy,
                    TotalLeaveDays = request.TotalLeaveDays
                }, transaction);

                // Deduct leave balance immediately (Pending status)
                var utilized = request.TotalLeaveDays;

                var lastClosingBalance = await connection.ExecuteScalarAsync<decimal?>(
                    lastClosingBalanceSql,
                    new { EmployeeId = request.EmployeeId, LeaveId = request.LeaveId },
                    transaction
                );

                var closingBalance = (lastClosingBalance ?? updatedBalance) - utilized;

                await connection.ExecuteAsync(insertAccrualSql, new
                {
                    EmployeeId = request.EmployeeId,
                    LeaveId = request.LeaveId,
                    Utilized = utilized,
                    Description = request.Reason,
                    ClosingBalance = closingBalance,
                    CreatedBy = createdBy
                }, transaction);

                await transaction.CommitAsync();
                return 1;
            }
            catch
            {
               await  transaction.RollbackAsync();
                return 0;
            }
        }

        public async Task<LeaveCalendarResonseDto> GetMonthlyLeaveCalendarAsync(Roles roleId, LeaveCalendarSearchRequestDto request)
        {
            DateTime date = request.Date ?? DateTime.UtcNow;
            int year = date.Year;
            int month = date.Month;


            StringBuilder sqlLeaves = new StringBuilder();

            sqlLeaves.Append(@"
            WITH DateRange AS (
                SELECT
                    AL.Id,
                    AL.Status,
                    AL.StartDate,
                    AL.EndDate,
                    AL.EmployeeId,
                    AL.LeaveId,
                    ED.DepartmentId,
                    CONCAT(E.FirstName, ' ', E.LastName) As EmployeeName,        
                    LT.ShortName as LeaveName,      
                    D.Department        
                FROM AppliedLeaves AL
                LEFT JOIN EmploymentDetail ED ON AL.EmployeeId = ED.EmployeeId
                LEFT JOIN EmployeeData E ON AL.EmployeeId = E.Id       
                LEFT JOIN LeaveType LT ON AL.LeaveId = LT.Id        
                LEFT JOIN Department D ON ED.DepartmentId = D.Id       
                WHERE ((YEAR(AL.StartDate) = @Year AND MONTH(AL.StartDate) = @Month)
                    OR (YEAR(AL.EndDate) = @Year AND MONTH(AL.EndDate) = @Month))
                    AND (@LeaveTypeId = 0 OR AL.LeaveId = @LeaveTypeId)
                    AND (@DepartmentId = 0 OR ED.DepartmentId = @DepartmentId)
                    AND (@Status = 0 OR AL.Status = @Status)
                    AND (@RoleId = 1 OR AL.ReportingManagerId = @EmployeeId) 
            ),
            AllDates AS (
                SELECT
                    Id,
                    Status,
                     EmployeeName,
                    LeaveName,
                    DepartmentId,
                    Department,
                    CAST(StartDate AS DATE) AS TheDate,
                    EndDate
                FROM DateRange
                UNION ALL
                SELECT
                    Id,
                    Status,
                  EmployeeName,
                LeaveName,
                    DepartmentId,
                    Department,
                    DATEADD(DAY, 1, TheDate),
                    EndDate
                FROM AllDates
                WHERE DATEADD(DAY, 1, TheDate) <= EndDate
            )
            SELECT
                TheDate AS [Date],
                EmployeeName,
                Department,
                LeaveName,
                COUNT(CASE WHEN Status = 1 THEN 1 END) AS PendingCount,
                COUNT(CASE WHEN Status = 2 THEN 1 END) AS ApprovedCount
            FROM AllDates
            WHERE YEAR(TheDate) = @Year AND MONTH(TheDate) = @Month
            GROUP BY TheDate, EmployeeName, Department, LeaveName
            ORDER BY TheDate, EmployeeName, Department, LeaveName
            OPTION (MAXRECURSION 1000);
        ");


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var dailyStatuses = (await connection.QueryAsync<DailyLeaveStatusDto>(sqlLeaves.ToString(), new
                {
                    Year = year,
                    RoleId = roleId,
                    Month = month,
                    LeaveTypeId = request?.LeaveTypeId ?? 0,
                    DepartmentId = request?.DepartmentId ?? 0,
                    Status = request?.Status ?? 0,
                    EmployeeId = request?.EmployeeId ?? 0
                })).ToList();
                return new LeaveCalendarResonseDto { DailyStatuses = dailyStatuses };
            }
        }

        public async Task<AccrualsUtilizedListResponseDto> GetAccrualsUtilizedByIdAsync(int id, SearchRequestDto<AccrualLeaveSearchRequestDto> requestDto)
        {
            var response = new AccrualsUtilizedListResponseDto();
            var parameters = new DynamicParameters();
            parameters.Add("EmployeeId", id);

            bool hasDateFilter = requestDto.Filters.Date.HasValue;
            bool hasLeaveIdFilter = requestDto.Filters.LeaveId.HasValue;

            if (hasDateFilter && requestDto.Filters?.Date is DateOnly date)
            {
                parameters.Add("FilterDate", date.ToDateTime(TimeOnly.MinValue));
            }

            if (hasLeaveIdFilter && requestDto.Filters?.LeaveId is int leaveId)
            {
                parameters.Add("LeaveId", leaveId);
            }


            var sql = $@"
        SELECT EmployeeId, Description, ClosingBalance, Date, Accrued, UtilizedOrRejected 
        FROM AccrualUtilizedLeave 
        WHERE EmployeeId = @EmployeeId
        {(hasDateFilter ? "AND CAST(Date AS DATE) = @FilterDate" : "")}
        {(hasLeaveIdFilter ? "AND LeaveId = @LeaveId" : "")}
        ORDER BY Id DESC
        OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY";

            var countSql = $@"
        SELECT COUNT(*) 
        FROM AccrualUtilizedLeave 
        WHERE EmployeeId = @EmployeeId
        {(hasDateFilter ? "AND CAST(Date AS DATE) = @FilterDate" : "")}
        {(hasLeaveIdFilter ? "AND LeaveId = @LeaveId" : "")}";

            parameters.Add("StartIndex", (requestDto.StartIndex - 1) * requestDto.PageSize);
            parameters.Add("PageSize", requestDto.PageSize);

            using (var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                await connection.OpenAsync();
                response.totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);
                response.result = (await connection.QueryAsync<AccrualsUtilizedResponseDto>(sql, parameters)).ToList();
            }

            return response;
        }


        public async Task<GetAppliedLeavesTotalRecordsDto> GetFilteredAppliedLeavesAsync(SearchRequestDto<AppliedLeaveSearchRequestDto> request)
        {
            var filters = request.Filters;

            var sql = new StringBuilder(@"
                SELECT 
                    AL.EmployeeId,
                    AL.LeaveId,
                    AL.ReportingManagerId,
                    AL.Status,
                    AL.Reason,
                    AL.StartDate,
                    AL.StartDateSlot,
                    AL.EndDate,
                    AL.EndDateSlot,
                    AL.AttachmentPath
                FROM AppliedLeaves AL
                INNER JOIN EmployeeData ED ON ED.Id = AL.EmployeeId               
                INNER JOIN EmploymentDetail EMP ON EMP.EmployeeId = AL.EmployeeId
                INNER JOIN LeaveType LT ON LT.Id = AL.LeaveId
                WHERE 1 = 1
            ");

            var countSql = new StringBuilder(@"
                SELECT COUNT(1)
                FROM AppliedLeaves AL
                INNER JOIN EmployeeData ED ON ED.Id = AL.EmployeeId               
                INNER JOIN EmploymentDetail EMP ON EMP.EmployeeId = AL.EmployeeId
                INNER JOIN LeaveType LT ON LT.Id = AL.LeaveId
                WHERE 1 = 1
            ");

            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(filters.EmployeeName))
            {
                var nameFilter = " AND (ED.FirstName LIKE @EmployeeName OR ED.MiddleName LIKE @EmployeeName OR ED.LastName LIKE @EmployeeName) ";
                sql.Append(nameFilter);
                countSql.Append(nameFilter);
                parameters.Add("EmployeeName", $"%{filters.EmployeeName}%");
            }

            if (filters.LeaveType != null)
            {
                var leaveTypeFilter = " AND LT.Id = @LeaveType ";
                sql.Append(leaveTypeFilter);
                countSql.Append(leaveTypeFilter);
                parameters.Add("LeaveType", filters.LeaveType);
            }

            if (filters.Department != null)
            {
                var deptFilter = " AND EMP.DepartmentId = @DepartmentId ";
                sql.Append(deptFilter);
                countSql.Append(deptFilter);
                parameters.Add("DepartmentId", filters.Department);
            }

            if (filters.StartDate.HasValue)
            {
                var startDateFilter = " AND AL.StartDate >= @StartDate ";
                sql.Append(startDateFilter);
                countSql.Append(startDateFilter);
                parameters.Add("StartDate", filters.StartDate.Value);
            }

            if (filters.EndDate.HasValue)
            {
                var endDateFilter = " AND AL.StartDate <= @EndDate ";
                sql.Append(endDateFilter);
                countSql.Append(endDateFilter);
                parameters.Add("EndDate", filters.EndDate.Value);
            }

            // Sorting
            if (!string.IsNullOrEmpty(request.SortColumnName))
            {
                string sortColumn = request.SortColumnName switch
                {
                    "StartDate" => "AL.StartDate",
                    "EmployeeName" => "ED.FirstName",
                    _ => "AL.StartDate"
                };

                string direction = request.SortDirection?.ToUpper() == "DESC" ? "DESC" : "ASC";
                sql.Append($" ORDER BY {sortColumn} {direction} ");
            }
            else
            {
                sql.Append(" ORDER BY AL.StartDate DESC ");
            }

            int pageNumber = request.StartIndex < 1 ? 1 : request.StartIndex;
            int offset = (pageNumber - 1) * request.PageSize;

            sql.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY ");
            parameters.Add("Offset", offset);
            parameters.Add("PageSize", request.PageSize);

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();

            var data = await connection.QueryAsync<EmployeeLeaveApplyResponseDto>(sql.ToString(), parameters);


            var totalCount = await connection.ExecuteScalarAsync<int>(countSql.ToString(), parameters);

            return new GetAppliedLeavesTotalRecordsDto
            {
                GetAppliedLeavesList = data.ToList(),
                TotalRecords = totalCount
            };
        }

        public async Task<EmpLeaveBalanceListResponseDto> GetLeaveBalanceByIdAsync(int id)
        {
            var sql = @"SELECT 
                el.LeaveId, 
                el.IsActive,
                lt.ShortName,
                lt.Title,
                (SELECT TOP 1 aul.ClosingBalance 
                FROM [dbo].[AccrualUtilizedLeave] aul 
                WHERE aul.EmployeeId = el.EmployeeId AND aul.LeaveId = el.LeaveId 
                ORDER BY aul.Id DESC) AS ClosingBalance 
            FROM 
                [dbo].[EmployeeLeave] el
            JOIN 
                [dbo].[LeaveType] lt ON el.LeaveId = lt.Id
            WHERE 
                el.EmployeeId = @Id
                AND el.IsActive = 1;";


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var leaveBalances = await connection.QueryAsync<EmpLeaveBalanceResponseDto>(sql, new { Id = id });
                var response = new EmpLeaveBalanceListResponseDto
                {
                    Data = leaveBalances
                };
                return response;
            }
        }

        public async Task<EmployeeLeaveDetailResponseDto?> GetEmpLeaveDetailByIdAsync(int id)
        {
            var sql = @"
        SELECT 
            al.LeaveId,
            al.StartDate,
            al.EndDate,
            al.StartDateSlot,
            al.EndDateSlot,
            al.Reason,
            al.RejectReason,
            al.TotalLeaveDays,
            al.Status,
            al.CreatedOn,
            lt.ShortName,
            lt.Title
        FROM 
            dbo.AppliedLeaves al
        JOIN 
            dbo.LeaveType lt ON al.LeaveId = lt.Id
        WHERE 
            al.Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<EmployeeLeaveDetailResponseDto>(sql, new { Id = id });
                return result;
            }
        }


        public async Task<GetAllLeaveBalanceResponseDto?> GetLeaveBalanceAsync(long employeeId, int leaveId)
        {
            using (var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                var sql = @"
WITH LeavesTaken AS (
    SELECT 
        EmployeeId,
        LeaveId,
        SUM(CAST(TotalLeaveDays AS DECIMAL(18,2))) AS TotalLeavesTaken
    FROM 
        [dbo].[AppliedLeaves]
    WHERE 
        EmployeeId = @EmployeeId 
        AND LeaveId = @LeaveId
        AND YEAR(CreatedOn) = YEAR(GETUTCDATE())
       --AND Status = 2 -- Only approved leaves
    GROUP BY 
        EmployeeId, LeaveId
),
LatestBalance AS (
    SELECT TOP 1
        EmployeeId,
        LeaveId,
        CAST(ClosingBalance AS DECIMAL(18,2)) AS ClosingBalance
    FROM 
        [dbo].[AccrualUtilizedLeave]
    WHERE 
        EmployeeId = @EmployeeId 
        AND LeaveId = @LeaveId
    ORDER BY 
        CreatedOn DESC
)

SELECT 
    CAST(el.OpeningBalance AS DECIMAL(18,2)) AS openingBalance,
    lb.ClosingBalance AS closingBalance,
   
    ISNULL(lt.TotalLeavesTaken, 0.00) AS leavesTaken
FROM 
    [dbo].[EmployeeLeave] el
LEFT JOIN 
    LeavesTaken lt ON el.EmployeeId = lt.EmployeeId AND el.LeaveId = lt.LeaveId
LEFT JOIN 
    LatestBalance lb ON el.EmployeeId = lb.EmployeeId AND el.LeaveId = lb.LeaveId
WHERE 
    el.EmployeeId = @EmployeeId 
    AND el.LeaveId = @LeaveId;
";

                var result = await connection.QueryFirstOrDefaultAsync<GetAllLeaveBalanceResponseDto>(sql, new
                {
                    EmployeeId = employeeId,
                    LeaveId = leaveId
                });

                if (result != null)
                {
                    result.EmployeeId = employeeId;
                    result.LeaveId = leaveId;
                }

                return result;
            }
        }


        public async Task<bool> IsReportingManagerExistAsync(long id)
        {
            var sql = @"
            SELECT TOP 1 ReportingMangerId
            FROM EmploymentDetail
            WHERE ReportingMangerId = @EmployeeId
            AND ReportingMangerId > 0

        ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var reportingManagerId = await connection.ExecuteScalarAsync<long?>(sql, new { EmployeeId = id });

                return reportingManagerId.HasValue && reportingManagerId.Value > 0;
            }
        }

        public async Task<int> MonthlyUpdateLeaveBalance(LeaveEnum leaveType, float credit, float carryOverLimit, int carryOverMonth, DateOnly selectedDate, bool? testing = false)
        {
            try
            {
                string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(selectedDate.Month);

                using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
                connection.Open();
                var updatedRowCount = await connection.ExecuteScalarAsync<int>("[dbo].[CreditMonthlyLeaveBalance]", new
                {
                    LeaveTypeId = (int)leaveType,
                    CreditAmount = credit,
                    CarryOverLimit = carryOverLimit,
                    CarryOverMonth = carryOverMonth,
                    selectedDate,
                    Description = $"Monthly Credited {monthName}",
                    CreatedBy = "admin"

                }, commandType: CommandType.StoredProcedure);

                return updatedRowCount;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to process request.", ex);

            }
        }


        public async Task<AppliedLeave?> GetAppliedLeaveByIdAsync(int id)
        {
            const string sql = "SELECT * FROM AppliedLeaves WHERE Id = @Id";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
            return await connection.QueryFirstOrDefaultAsync<AppliedLeave>(sql, new { Id = id });
        }
        public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
        {
            public override DateOnly Parse(object value) =>
                DateOnly.FromDateTime((DateTime)value);

            public override void SetValue(IDbDataParameter parameter, DateOnly value) =>
                parameter.Value = value.ToDateTime(TimeOnly.MinValue);
        }
        public async Task<bool> ApproveOrRejectLeaveAndInsertAccrualAsync(LeaveApprovalDto request, string modifiedBy)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

                var leave = await connection.QueryFirstOrDefaultAsync<AppliedLeave>(
                    "SELECT * FROM AppliedLeaves WHERE Id = @Id",
                    new { Id = request.AppliedLeaveId }, transaction);

                if (leave == null)
                    return false;

                // Update leave status
                const string updateStatusSql = @"
            UPDATE AppliedLeaves 
            SET Status = @Status, ModifiedOn = GETUTCDATE(), ModifiedBy = @ModifiedBy, RejectReason = @RejectReason
            WHERE Id = @Id";

                await connection.ExecuteAsync(updateStatusSql, new
                {
                    Status = (byte)request.Decision,
                    ModifiedBy = modifiedBy,
                    RejectReason = request.RejectReason,
                    Id = request.AppliedLeaveId
                }, transaction);

                // If leave is rejected, restore the balance
                if (request.Decision == LeaveStatus.Rejected)
                {
                    var utilized = leave.TotalLeaveDays;

                    const string lastClosingBalanceSql = @"
                SELECT TOP 1 ClosingBalance
                FROM AccrualUtilizedLeave
                WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId
                ORDER BY Id DESC";

                    var lastClosingBalance = await connection.ExecuteScalarAsync<decimal?>(
                        lastClosingBalanceSql,
                        new { EmployeeId = leave.EmployeeId, LeaveId = leave.LeaveId },
                        transaction);

                    var closingBalance = (lastClosingBalance ?? 0) + utilized;

                    const string insertAccrualSql = @"
                INSERT INTO AccrualUtilizedLeave
                (EmployeeId, LeaveId, [Date], Description, Accrued, UtilizedOrRejected, ClosingBalance, CreatedOn, CreatedBy)
                VALUES
                (@EmployeeId, @LeaveId, GETUTCDATE(), @Description, NULL, -@Utilized, @ClosingBalance, GETUTCDATE(), @CreatedBy)";

                    await connection.ExecuteAsync(insertAccrualSql, new
                    {
                        EmployeeId = leave.EmployeeId,
                        LeaveId = leave.LeaveId,
                        Description = $"Reversal due to Rejection",
                        Utilized = utilized,
                        ClosingBalance = closingBalance,
                        CreatedBy = modifiedBy
                    }, transaction);


                  
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Import Excel
        public async Task<Dictionary<string, int>> GetEmployeeCodeIdMapping()
        {
            var sql = "SELECT EmployeeCode, Id FROM EmployeeData WHERE IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                var records = await connection.QueryAsync<(string EmployeeCode, int Id)>(sql);

                var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach (var record in records)
                {
                    if (!dict.ContainsKey(record.EmployeeCode))
                        dict.Add(record.EmployeeCode, record.Id);
                }

                return dict;
            }
        }


        public async Task<int> InsertEmployeeLeavesAsync(List<EmployeeLeave> leaveList)
        {
            var leaveTypeMap = new Dictionary<string, int>
            {
                { "CasualSickLeave", (int)LeaveEnum.CL },
                { "EarnedLeave", (int)LeaveEnum.EL },
                { "BereavementLeave", (int)LeaveEnum.BL },
                { "PaternityLeave", (int)LeaveEnum.PL },
                { "MaternityLeave", (int)LeaveEnum.ML },
                { "AdvanceLeave", (int)LeaveEnum.AL },
                { "LeaveBucket", (int)LeaveEnum.LB }
            };

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                var employeeIds = leaveList.Select(l => l.EmployeeId).Distinct().ToList();

                var existingLeaves = (await connection.QueryAsync<EmployeeLeaveRecord>(
                    @"SELECT EmployeeId, LeaveId, OpeningBalance
                      FROM [dbo].[EmployeeLeave]
                      WHERE EmployeeId IN @EmployeeIds",
                    new { EmployeeIds = employeeIds }, transaction))
                    .GroupBy(x => (x.EmployeeId, x.LeaveId))
                    .ToDictionary(g => g.Key, g => g.First().OpeningBalance);

                var latestBalances = (await connection.QueryAsync<AccrualUtilizedLeave>(
                    @"SELECT EmployeeId, LeaveId, ClosingBalance
                      FROM (
                          SELECT *,
                                 ROW_NUMBER() OVER (PARTITION BY EmployeeId, LeaveId ORDER BY ID DESC) AS rn
                          FROM [dbo].[AccrualUtilizedLeave]
                      ) t
                      WHERE rn = 1", null, transaction))
                    .ToDictionary(x => (x.EmployeeId, x.LeaveId), x => x.ClosingBalance);

                var toUpdate = new List<dynamic>();
                var toInsert = new List<EmployeeLeaveInsert>();
                var accrualInserts = new List<AccrualUtilizedLeaveInsert>();

                foreach (var leave in leaveList)
                {
                    foreach (var kv in leave.Leaves)
                    {
                        if (!leaveTypeMap.TryGetValue(kv.Key, out int leaveId))
                            continue;

                        decimal accruedAmount = kv.Value;
                        var key = (leave.EmployeeId, leaveId);
                        bool exists = existingLeaves.ContainsKey(key);
                        bool isActive = accruedAmount > 0;

                        if (exists)
                        {
                            toUpdate.Add(new
                            {
                                leave.EmployeeId,
                                LeaveId = leaveId,
                                OpeningBalance = accruedAmount,
                                ModifiedBy = leave.CreatedBy,
                                IsActive = isActive
                            });
                        }
                        else
                        {
                            toInsert.Add(new EmployeeLeaveInsert
                            {
                                EmployeeId = leave.EmployeeId,
                                LeaveId = leaveId,
                                OpeningBalance = accruedAmount,
                                IsActive = isActive,
                                CreatedBy = leave.CreatedBy,
                                CreatedOn = leave.CreatedOn,
                                LeaveDate = leave.LeaveDate
                            });
                        }

                        decimal previousBalance = latestBalances.TryGetValue(key, out var balance) ? balance : 0;

                        accrualInserts.Add(new AccrualUtilizedLeaveInsert
                        {
                            EmployeeId = leave.EmployeeId,
                            LeaveId = leaveId,
                            Date = leave.CreatedOn,
                            Description = "Imported from Paybook",
                            Accrued = 0,
                            UtilizedOrRejected = previousBalance,
                            ClosingBalance = accruedAmount,
                            CreatedOn = leave.CreatedOn,
                            CreatedBy = leave.CreatedBy
                        });
                    }
                }

                // Batch update using Dapper
                if (toUpdate.Any())
                {
                    await connection.ExecuteAsync(
                        @"UPDATE [dbo].[EmployeeLeave]
                      SET OpeningBalance = @OpeningBalance,
                          ModifiedOn = GETUTCDATE(),
                          ModifiedBy = @ModifiedBy,
                          IsActive = @IsActive
                      WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId",
                        toUpdate, transaction);
                }

                // Bulk insert EmployeeLeave
                if (toInsert.Any())
                {
                    var employeeLeaveTable = new DataTable();
                    employeeLeaveTable.Columns.Add("EmployeeId", typeof(long));
                    employeeLeaveTable.Columns.Add("LeaveId", typeof(int));
                    employeeLeaveTable.Columns.Add("OpeningBalance", typeof(decimal));
                    employeeLeaveTable.Columns.Add("IsActive", typeof(bool));
                    employeeLeaveTable.Columns.Add("CreatedBy", typeof(string));
                    employeeLeaveTable.Columns.Add("CreatedOn", typeof(DateTime));
                    employeeLeaveTable.Columns.Add("LeaveDate", typeof(DateTime));

                    foreach (var item in toInsert)
                    {
                        employeeLeaveTable.Rows.Add(item.EmployeeId, item.LeaveId, item.OpeningBalance, item.IsActive,
                                                    item.CreatedBy, item.CreatedOn, item.LeaveDate.ToDateTime(new TimeOnly(0, 0)));
                    }

                    using var bulkCopy = new SqlBulkCopy(connection, SqlBulkCopyOptions.Default, transaction)
                    {
                        DestinationTableName = "dbo.EmployeeLeave"
                    };

                    bulkCopy.ColumnMappings.Add("EmployeeId", "EmployeeId");
                    bulkCopy.ColumnMappings.Add("LeaveId", "LeaveId");
                    bulkCopy.ColumnMappings.Add("OpeningBalance", "OpeningBalance");
                    bulkCopy.ColumnMappings.Add("IsActive", "IsActive");
                    bulkCopy.ColumnMappings.Add("CreatedBy", "CreatedBy");
                    bulkCopy.ColumnMappings.Add("CreatedOn", "CreatedOn");
                    bulkCopy.ColumnMappings.Add("LeaveDate", "LeaveDate");

                    await bulkCopy.WriteToServerAsync(employeeLeaveTable);
                }

                // Bulk insert AccrualUtilizedLeave
                if (accrualInserts.Any())
                {
                    var accrualTable = new DataTable();
                    accrualTable.Columns.Add("EmployeeId", typeof(int));
                    accrualTable.Columns.Add("LeaveId", typeof(int));
                    accrualTable.Columns.Add("Date", typeof(DateTime));
                    accrualTable.Columns.Add("Description", typeof(string));
                    accrualTable.Columns.Add("Accrued", typeof(decimal));
                    accrualTable.Columns.Add("UtilizedOrRejected", typeof(decimal));
                    accrualTable.Columns.Add("ClosingBalance", typeof(decimal));
                    accrualTable.Columns.Add("CreatedOn", typeof(DateTime));
                    accrualTable.Columns.Add("CreatedBy", typeof(string));

                    foreach (var item in accrualInserts)
                    {
                        accrualTable.Rows.Add(item.EmployeeId, item.LeaveId, item.Date, item.Description, item.Accrued,
                                              item.UtilizedOrRejected, item.ClosingBalance, item.CreatedOn, item.CreatedBy);
                    }

                    using var bulkCopy = new SqlBulkCopy(connection, SqlBulkCopyOptions.Default, transaction)
                    {
                        DestinationTableName = "dbo.AccrualUtilizedLeave"
                    };

                    bulkCopy.ColumnMappings.Add("EmployeeId", "EmployeeId");
                    bulkCopy.ColumnMappings.Add("LeaveId", "LeaveId");
                    bulkCopy.ColumnMappings.Add("Date", "Date");
                    bulkCopy.ColumnMappings.Add("Description", "Description");
                    bulkCopy.ColumnMappings.Add("Accrued", "Accrued");
                    bulkCopy.ColumnMappings.Add("UtilizedOrRejected", "UtilizedOrRejected");
                    bulkCopy.ColumnMappings.Add("ClosingBalance", "ClosingBalance");
                    bulkCopy.ColumnMappings.Add("CreatedOn", "CreatedOn");
                    bulkCopy.ColumnMappings.Add("CreatedBy", "CreatedBy");

                    await bulkCopy.WriteToServerAsync(accrualTable);
                }

                await transaction.CommitAsync();
                return leaveList.Count;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return 0;
            }
        }

        public async Task<LeaveRequestListResponseDto> GetEmployeeLeaveRequestAsync(Roles roleId, int? SessionUserId, SearchRequestDto<GetLeaveRequestSearchRequestDto> request)
        {
            var filters = request.Filters;
            var parameters = new DynamicParameters();
            parameters.Add("SessionUserId", SessionUserId);

            using (var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                await connection.OpenAsync();

                var sql = new StringBuilder(@"
            SELECT 
                AL.Id,
                ED.id As EmployeeId,
                ED.EmployeeCode,
                CONCAT(ED.FirstName, ' ', ED.LastName) AS EmployeeName,
                AL.LeaveId,
                LT.Title,
                LT.ShortName,
                AL.Status,
                AL.Reason,
                AL.StartDate,
                AL.EndDate,
                EL.OpeningBalance,
                AL.TotalLeaveDays,
                AL.StartDateSlot,
                AL.EndDateSlot
            FROM AppliedLeaves AL
            LEFT JOIN EmployeeData ED ON ED.Id = AL.EmployeeId               
            LEFT JOIN EmploymentDetail EMP ON EMP.EmployeeId = AL.EmployeeId
            Left join EmploymentDetail EMP2 ON EMP2.EmployeeId = @SessionUserId
            LEFT JOIN LeaveType LT ON LT.Id = AL.LeaveId
            LEFT JOIN EmployeeLeave EL ON EL.EmployeeId = AL.EmployeeId AND EL.LeaveId = AL.LeaveId
            WHERE 1=1
        ");

                var countSql = new StringBuilder(@"
            SELECT COUNT(1)
            FROM AppliedLeaves AL
            LEFT JOIN EmployeeData ED ON ED.Id = AL.EmployeeId               
            LEFT JOIN EmploymentDetail EMP ON EMP.EmployeeId = AL.EmployeeId
            LEFT JOIN LeaveType LT ON LT.Id = AL.LeaveId
            LEFT JOIN EmployeeLeave EL ON EL.EmployeeId = AL.EmployeeId AND EL.LeaveId = AL.LeaveId
            WHERE 1=1
        ");

                if (roleId != Roles.SuperAdmin)
                {
                    sql.Append(" AND ( EMP.ReportingMangerId = @SessionUserId OR EMP.ImmediateManager = @SessionUserId )"); //imiddiate reporting manager id
                    //Leave approval, leave calander,  
                    countSql.Append(" AND ( EMP.ReportingMangerId = @SessionUserId OR EMP.ImmediateManager = @SessionUserId )");
                }

                if (filters.Status.HasValue)
                {
                    sql.Append(" AND AL.Status = @Status ");
                    countSql.Append(" AND AL.Status = @Status ");
                    parameters.Add("Status", filters.Status.Value);
                }

                if (filters.StartDate.HasValue && filters.EndDate.HasValue)
                {
                    sql.Append(" AND (AL.StartDate <= @EndDate AND AL.EndDate >= @StartDate) ");
                    countSql.Append(" AND (AL.StartDate <= @EndDate AND AL.EndDate >= @StartDate) ");
                    parameters.Add("StartDate", filters.StartDate.Value);
                    parameters.Add("EndDate", filters.EndDate.Value);
                }
                else if (filters.StartDate.HasValue)
                {
                    sql.Append(" AND AL.EndDate >= @StartDate ");
                    countSql.Append(" AND AL.EndDate >= @StartDate ");
                    parameters.Add("StartDate", filters.StartDate.Value);
                }
                else if (filters.EndDate.HasValue)
                {
                    sql.Append(" AND AL.StartDate <= @EndDate ");
                    countSql.Append(" AND AL.StartDate <= @EndDate ");
                    parameters.Add("EndDate", filters.EndDate.Value);
                }


                //  EmployeeCode filter 
                if (!string.IsNullOrEmpty(filters.EmployeeCode))
                {
                    var employeeCodes = filters.EmployeeCode
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(code => code.Trim())
                        .ToList();

                    if (employeeCodes.Any())
                    {
                        sql.Append(" AND ED.EmployeeCode IN @EmployeeCodes ");
                        countSql.Append(" AND ED.EmployeeCode IN @EmployeeCodes ");
                        parameters.Add("EmployeeCodes", employeeCodes);
                    }
                }

                // Sorting
                if (!string.IsNullOrEmpty(request.SortColumnName))
                {
                    string sortColumn = request.SortColumnName switch
                    {
                        "StartDate" => "AL.StartDate",
                        "employeeName" => "ED.FirstName",
                        "employeeCode" => "ED.EmployeeCode",
                        "Status" => "AL.Status",
                        _ => "AL.StartDate"
                    };

                    string direction = request.SortDirection?.ToUpper() == "ASC" ? "ASC" : "DESC";
                    sql.Append($" ORDER BY {sortColumn} {direction} ");
                }
                else
                {
                    sql.Append(" ORDER BY AL.StartDate ASC ");
                }

                int pageNumber = request.StartIndex < 1 ? 1 : request.StartIndex;
                int offset = (pageNumber - 1) * request.PageSize;
                sql.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY ");
                parameters.Add("Offset", offset);
                parameters.Add("PageSize", request.PageSize);

                var data = await connection.QueryAsync<GetLeaveRequestDto>(sql.ToString(), parameters);
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql.ToString(), parameters);

                return new LeaveRequestListResponseDto
                {
                    leaveRequestList = data.ToList(),
                    TotalCount = totalCount
                };
            }
        }


        public async Task<int> ApplySwapHolidayAsync(CompOffAndSwapHolidayDetail request)
        {
            const string insertSql = @"
                INSERT INTO CompOffAndSwapHolidayDetail 
                (EmployeeId, WorkingDate, LeaveDate, WorkingDateLabel, LeaveDateLabel, Reason, Status, RequestType, CreatedOn,CreatedBy, IsDeleted)
                VALUES 
                (@EmployeeId, @WorkingDate, @LeaveDate, @WorkingDateLabel, @LeaveDateLabel, @Reason, @Status, @Type, @CreatedOn,@CreatedBy, 0)";

            const string checkDuplicateSql = @"
                SELECT COUNT(1)
                FROM CompOffAndSwapHolidayDetail
                WHERE EmployeeId = @EmployeeId
                AND LeaveDate = @LeaveDate
                AND Status IN (1, 2) -- Pending or Accepted
                AND RequestType = 2 -- Swap
                AND IsDeleted = 0";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                // Check for duplicate swap application
                var duplicateExists = await connection.ExecuteScalarAsync<int>(
                    checkDuplicateSql,
                    new { EmployeeId = request.EmployeeId, LeaveDate = request.LeaveDate },
                    transaction
                );

                if (duplicateExists > 0)
                {
                    await transaction.RollbackAsync();
                    return -1;
                }

                // Insert swap holiday application
                await connection.ExecuteAsync(insertSql, request, transaction);

                await transaction.CommitAsync();
                return 1;
            }
            catch
            {
                await transaction.RollbackAsync();
                return 0;
            }
        }

        public async Task<int> GetAcceptedSwapsCountAsync(long employeeId, int year)
        {
            const string sql = @"
                SELECT COUNT(1)
                FROM CompOffAndSwapHolidayDetail
                WHERE EmployeeId = @EmployeeId
                AND Status IN (1,2) -- Accepted
                AND RequestType = 2 -- Swap
                AND YEAR(CreatedOn) = @Year
                AND IsDeleted = 0";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            return await connection.ExecuteScalarAsync<int>(sql, new { EmployeeId = employeeId, Year = year });
        }

        public async Task<CompOffAndSwapHolidayListResponseDto?> GetCompOffAndSwapHolidayDetailsAsync(Roles roles, long? sessionUserId, SearchRequestDto<CompOffAndSwapHolidaySearchRequestDto> requestDto)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var result = await connection.QueryMultipleAsync(
                "[dbo].[GetCompOffAndSwapHolidayDetails]",
                new
                {
                    SessionUserId = sessionUserId,
                    RoleId = (int)roles,
                    EmployeeCode = requestDto.Filters.EmployeeCode,
                    WorkingDate = requestDto.Filters.WorkingDate?.ToDateTime(TimeOnly.MinValue),
                    StatusFilter = requestDto.Filters.Status.HasValue ? (int?)requestDto.Filters.Status.Value : null,
                    TypeFilter = requestDto.Filters.Type.HasValue ? (int?)requestDto.Filters.Type.Value : null,
                    SortColumn = requestDto.SortColumnName,
                    SortDesc = requestDto.SortDirection?.ToLower() == "desc",
                    StartIndex = (Math.Max(requestDto.StartIndex, 1) - 1) * requestDto.PageSize,
                    PageSize = requestDto.PageSize
                },
                commandType: CommandType.StoredProcedure
            );

            var res = new CompOffAndSwapHolidayListResponseDto();
            res.TotalCount = await result.ReadSingleOrDefaultAsync<int>();
            res.CompOffAndSwapHolidayList = (await result.ReadAsync<CompOffAndSwapHolidayResponseDto>()).ToList();
            return res;
        }
        public async Task<int> ApplyCompOffAsync(CompOffAndSwapHolidayDetail CompOffReq)
        {
            string insertSql = @" 
                IF NOT EXISTS (SELECT * FROM CompOffAndSwapHolidayDetail WHERE EmployeeId = @EmployeeId AND WorkingDate = @WorkingDate AND Status IN (1, 2)  AND RequestType = @Type  AND IsDeleted = 0)
                BEGIN
                        INSERT INTO CompOffAndSwapHolidayDetail 
                        (EmployeeId, WorkingDate, Reason, Status, RequestType, CreatedOn,CreatedBy, IsDeleted,NumberOfDays)
                        VALUES 
                        (@EmployeeId, @WorkingDate, @Reason, @Status, @Type, @CreatedOn,@CreatedBy, 0, @NumberOfDays)
                END ";


            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var count = await connection.ExecuteAsync(insertSql, CompOffReq, transaction);
                await transaction.CommitAsync();
                if (count <= 0)
                {
                    return -1;
                }
                return 1;
            }
            catch
            {
                await transaction.RollbackAsync();
                return 0;
            }
        }

        public async Task<bool> ApproveOrRejectCompOffAsync(CompOffAndSwapHolidayDetail request)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

                int LeaveId = (int)LeaveEnum.CO; // static ID for comp off leave type

                // Update leave status
                const string updateStatusSql = @"UPDATE CompOffAndSwapHolidayDetail 
                SET Status = @Status, ModifiedOn = @ModifiedOn, ModifiedBy = @ModifiedBy, RejectReason = @RejectReason WHERE Id = @Id";
                await connection.ExecuteAsync(updateStatusSql, new
                {
                    Status = (int)request.Status,
                    ModifiedOn = request.ModifiedOn,
                    ModifiedBy = request.ModifiedBy,
                    RejectReason = request.RejectReason,
                    Id = request.Id
                }, transaction);

                // If leave is rejected, restore the balance
                if (request.Status == LeaveStatus.Accepted)
                {
                    const string lastClosingBalanceSql = @"
                SELECT TOP 1 ClosingBalance
                FROM AccrualUtilizedLeave
                WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId
                ORDER BY Id DESC";

                    var lastClosingBalance = await connection.ExecuteScalarAsync<decimal?>(
                        lastClosingBalanceSql,
                        new { EmployeeId = request.EmployeeId, LeaveId = LeaveId },
                        transaction);
                    var closingBalance = (lastClosingBalance ?? 0) + request?.NumberOfDays;
                    const string insertAccrualSql = @"
                                INSERT INTO AccrualUtilizedLeave
                                (EmployeeId, LeaveId, [Date], Description, Accrued, UtilizedOrRejected, ClosingBalance, CreatedOn, CreatedBy)
                                VALUES
                                (@EmployeeId, @LeaveId, GETUTCDATE(), @Description, @Accrued, @Utilized, @ClosingBalance, GETUTCDATE(), @CreatedBy)";
                    await connection.ExecuteAsync(insertAccrualSql, new
                    {
                        EmployeeId = request?.EmployeeId,
                        LeaveId = LeaveId,
                        Description = $"Added for comp off",
                        Utilized = 0,
                        Accrued = request?.NumberOfDays,
                        ClosingBalance = closingBalance,
                        CreatedBy = request?.ModifiedBy,
                    }, transaction);

                    const string insertEmployeeLeaveSql = @"
                        IF NOT EXISTS (SELECT EmployeeId FROM  EmployeeLeave WHERE EmployeeId = @EmployeeId AND LeaveId = @LeaveId)
                        BEGIN 
                        INSERT INTO EmployeeLeave
                        (EmployeeId, LeaveId, OpeningBalance, LeaveDate, IsActive, CreatedOn, CreatedBy)
                        VALUES
                        (@EmployeeId, @LeaveId, 0,GETUTCDATE(),1, GETUTCDATE(), @CreatedBy) 
                        END";

                    await connection.ExecuteAsync(insertEmployeeLeaveSql, new
                    {
                        EmployeeId = request?.EmployeeId,
                        LeaveId = LeaveId,
                        CreatedBy = request?.ModifiedBy,
                    }, transaction);


                }
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<bool> ApproveOrRejectSwapAsync(CompOffAndSwapHolidayDetail compOffAndSwapHoliday)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var updateStatusSql = @"UPDATE CompOffAndSwapHolidayDetail 
                    SET Status = @Status, ModifiedOn = @ModifiedOn, ModifiedBy = @ModifiedBy, 
                        RejectReason = @RejectReason 
                    WHERE Id = @Id";

                var parameters = new
                {
                    Status = (int)compOffAndSwapHoliday.Status,
                    ModifiedOn = compOffAndSwapHoliday.ModifiedOn,
                    ModifiedBy = compOffAndSwapHoliday.ModifiedBy,
                    RejectReason = compOffAndSwapHoliday.RejectReason,
                    Id = compOffAndSwapHoliday.Id
                };

                var rowsAffected = await connection.ExecuteAsync(updateStatusSql, parameters, transaction);
                await transaction.CommitAsync();
                return rowsAffected > 0;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<IEnumerable<CompOffAndSwapResponseDto?>> GetAllAdjustedLeaveByEmployeeAsync(long employeeId)
        {
            var sql = @"
            SELECT  
                CS.Id,
                CS.WorkingDate,
                CS.LeaveDate,
                CS.LeaveDateLabel,
                CS.WorkingDateLabel,
                CS.Reason,
                CS.Status,
                CS.RejectReason,
                CS.RequestType,
                CS.CreatedOn,
                CS.NumberOfDays              
            FROM dbo.CompOffAndSwapHolidayDetail CS where CS.EmployeeId = @EmployeeId
            ORDER BY CS.CreatedOn DESC;
        ";


            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<CompOffAndSwapResponseDto?>(sql, new { EmployeeId = employeeId });
                return result;
            }
        }

        public async Task<IEnumerable<SwapHolidayDto>> GetAcceptedSwapHolidaysAsync(long employeeId)
        {
            var sql = @"
                SELECT  
                    CS.Id,
                    CS.WorkingDate,
                    CS.LeaveDate,
                    CS.WorkingDateLabel,
                    CS.LeaveDateLabel
                FROM dbo.CompOffAndSwapHolidayDetail CS 
                WHERE CS.EmployeeId = @EmployeeId 
                    AND CS.RequestType = 2  -- swap
                    AND CS.Status = 2       -- Accepted
                    AND CS.IsDeleted = 0
                ORDER BY CS.WorkingDate ASC;
            ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<SwapHolidayDto>(sql, new { EmployeeId = employeeId });
                return result.ToList();
            }
        }
        public async Task<int?> CompOffExpire()
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            try
            { 
                var updatedRowCount = await connection.ExecuteScalarAsync<int>("[dbo].[ExpireCompOffLeave]", null, commandType: CommandType.StoredProcedure);
                return updatedRowCount;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to process request.", ex);

            } 
        }
    }
}

