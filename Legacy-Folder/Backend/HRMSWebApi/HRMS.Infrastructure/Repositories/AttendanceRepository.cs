using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Dapper;
using HRMS.Models.Models.Attendance;
using Microsoft.Extensions.Configuration;
using HRMS.Infrastructure.Interface;
using HRMS.Domain.Enums;
using HRMS.Domain.Entities;
using HRMS.Models.Models.AttendanceConfiguration;
using HRMS.Models;
using HRMS.Models.Models.EmployeeReport;
using Newtonsoft.Json;
using OfficeOpenXml;
using HRMS.Domain.Utility;
using HRMS.Domain.Contants;
using System.Globalization;

namespace HRMS.Infrastructure.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly IConfiguration _configuration;
        public AttendanceRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<AttendanceResponseDto> GetAttendanceByEmployeeIdAsync(long employeeId, string? dateFrom, string? dateTo, int pageIndex, int pageSize)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = @"SELECT * FROM Attendance WHERE EmployeeId = @EmployeeId";
                var totalSql = @"SELECT Count(*) FROM Attendance WHERE EmployeeId = @EmployeeId";
                var parameters = new DynamicParameters();
                var totalParameters = new DynamicParameters();
                totalParameters.Add("EmployeeId", employeeId);
                parameters.Add("EmployeeId", employeeId);
                var format = "yyyy-MM-dd"; // or your expected format
                var provider = CultureInfo.InvariantCulture;

                if (!string.IsNullOrEmpty(dateFrom))
                {
                    var parsedDateFrom = DateTime.ParseExact(dateFrom, format, provider);
                    parameters.Add("DateFrom", parsedDateFrom);
                    sql += " AND [Date] >= @DateFrom";
                    totalSql += " AND [Date] >= @DateFrom";
                    totalParameters.Add("DateFrom", parsedDateFrom);
                }

                if (!string.IsNullOrEmpty(dateTo))
                {
                    var parsedDateTo = DateTime.ParseExact(dateTo, format, provider);
                    parameters.Add("DateTo", parsedDateTo);
                    sql += " AND [Date] <= @DateTo";
                    totalSql += " AND [Date] <= @DateTo";
                    totalParameters.Add("DateTo", parsedDateTo);
                }

                sql += " ORDER BY [Date] DESC OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY";
                parameters.Add("StartIndex", pageIndex * pageSize);
                parameters.Add("PageSize", pageSize);
                var rawRows = await connection.QueryAsync(sql, parameters);
                var result = new List<AttendanceRowDto>();
                foreach (var row in rawRows)
                {
                    var attendanceRow = new AttendanceRowDto
                    {
                        Id = row.Id,
                        Date = row.Date != null ? row.Date.ToString("yyyy-MM-dd") : "",
                        StartTime = row.StartTime != null ? row.StartTime.ToString(@"hh\:mm") : "",
                        EndTime = row.EndTime != null ? row.EndTime.ToString(@"hh\:mm") : "",
                        Day = row.Day ?? "",
                        Location = row.Location ?? "",
                        AttendanceType = row.AttendanceType,
                        TotalHours = row.TotalHours != null ? row.TotalHours : "",
                        Audit = new List<AttendanceAuditDto>()
                    };
                    var auditSql = @"SELECT [Action], CONVERT(varchar, [Time], 120) as [Time], [Comment],[Reason] FROM AttendanceAudit WHERE AttendanceId = @AttendanceId";
                    var audits = await connection.QueryAsync<AttendanceAuditDto>(auditSql, new { AttendanceId = row.Id });
                    attendanceRow.Audit = audits.AsList();
                    result.Add(attendanceRow);
                }
                var totalRecords = await connection.ExecuteScalarAsync<int>(totalSql, totalParameters);
                var response = new AttendanceResponseDto
                {
                    AttendaceReport = result,
                    TotalRecords = totalRecords
                };
                return response;
            }
        }

        public async Task<int> AddAttendanceAsync(long employeeId, Attendance attendanceRow)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {


                    var format = "yyyy-MM-dd";
                    var provider = CultureInfo.InvariantCulture;

                    var actionDate = DateTime.Parse(attendanceRow.Date, provider);
                    var insertSql = @"INSERT INTO Attendance (EmployeeId, [Date], StartTime, EndTime, [Day], AttendanceType, Location, TotalHours,CreatedBy, CreatedOn)
                                  VALUES (@EmployeeId, @Date, @StartTime, @EndTime, @Day, @AttendanceType, @Location, @TotalHours,@CreatedBy, GETUTCDATE());
                                  SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";
                    var attendanceId = await connection.ExecuteScalarAsync<long>(insertSql, new
                    {
                        EmployeeId = employeeId,
                        Date = actionDate,
                        StartTime = attendanceRow.StartTime != null ? attendanceRow.StartTime : null,
                        EndTime = attendanceRow.EndTime != null ? attendanceRow.EndTime : null,
                        Day = attendanceRow.Day,
                        AttendanceType = attendanceRow.AttendanceType,
                        Location = attendanceRow.Location ?? null,

                        TotalHours = !string.IsNullOrEmpty(attendanceRow.TotalHours) &&
                        TimeSpan.TryParse(attendanceRow.TotalHours, CultureInfo.InvariantCulture, out var parsedTime)
                        ? parsedTime
                        : (TimeSpan?)null,
                        CreatedBy = attendanceRow.CreatedBy
                    }, transaction);

                    if (attendanceRow.Audit != null && attendanceRow.Audit.Count > 0)
                    {
                        var insertAuditSql = @"INSERT INTO AttendanceAudit (AttendanceId, [Action], [Time], [Comment], [Reason])
                                     VALUES (@AttendanceId, @Action, @Time, @Comment, @Reason);";
                        foreach (var audit in attendanceRow.Audit)
                        {
                            await connection.ExecuteAsync(insertAuditSql, new
                            {
                                AttendanceId = attendanceId,
                                Action = audit.Action,
                                Time = TimeSpan.Parse(audit.Time, CultureInfo.InvariantCulture),
                                Comment = audit.Comment,
                                Reason = audit.Reason ?? ""
                            }, transaction);
                        }
                    }
                    transaction.Commit();
                    return 1;
                }
            }
        }

        public async Task<int> UpdateAttendanceAsync(long employeeId, Attendance attendanceRow, long attendanceId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {



                    var updateSql = @"UPDATE Attendance SET StartTime=@StartTime,[Date]=@Date, EndTime=@EndTime, TotalHours=@TotalHours, Day=@Day, AttendanceType=@AttendanceType, Location=@Location ,ModifiedBy=@ModifiedBy, ModifiedOn=GETUTCDATE() WHERE Id=@Id;";

                    await connection.ExecuteAsync(updateSql, new
                    {
                        Id = attendanceId,
                        StartTime = attendanceRow.StartTime,
                        EndTime = attendanceRow.EndTime != null ? attendanceRow.EndTime : null,
                        TotalHours = !string.IsNullOrEmpty(attendanceRow.TotalHours)
                        ? TimeSpan.Parse(attendanceRow.TotalHours, CultureInfo.InvariantCulture)
                        : (TimeSpan?)null,
                        Day = attendanceRow.Day,
                        Date = attendanceRow.Date,
                        AttendanceType = attendanceRow.AttendanceType,
                        Location = attendanceRow.Location ?? null,
                        ModifiedBy = attendanceRow.ModifiedBy
                    }, transaction);

                    if (attendanceRow.Audit != null && attendanceRow.Audit.Count > 0)
                    {
                        if (attendanceRow.Date != DateTime.UtcNow.ToString("yyyy-MM-dd"))
                        {
                            // Clear existing audits for this attendance if date is not today
                            var deleteAuditSql = "DELETE FROM AttendanceAudit WHERE AttendanceId = @AttendanceId";
                            await connection.ExecuteAsync(deleteAuditSql, new { AttendanceId = attendanceId }, transaction);
                        }
                        var insertAuditSql = @"INSERT INTO AttendanceAudit (AttendanceId, [Action], [Time], [Comment], [Reason])
                                     VALUES (@AttendanceId, @Action, @Time, @Comment, @Reason);";
                        foreach (var audit in attendanceRow.Audit)
                        {
                            await connection.ExecuteAsync(insertAuditSql, new
                            {
                                AttendanceId = attendanceId,
                                Action = audit.Action,
                                Time = TimeSpan.Parse(audit.Time, CultureInfo.InvariantCulture),
                                Comment = audit.Comment,
                                Reason = audit.Reason ?? ""
                            }, transaction);
                        }
                    }
                    transaction.Commit();
                    return 1;
                }
            }
        }
        public async Task<int> UpdateAttendanceConfigAsync(AttendanceConfigRequestDto attendanceRow)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var updateSql = @"UPDATE EmploymentDetail SET IsManualAttendance=@IsManualAttendance WHERE EmployeeId=@EmployeeId;";
                await connection.ExecuteAsync(updateSql, attendanceRow);
                return 1;
            }
        }

        public async Task UpdateTimeDoctorUserId(long empId, string? timeDoctorUserId)
        {
            if (string.IsNullOrEmpty(timeDoctorUserId)) return;
            using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            connection.Open();
            var updateSql = @"UPDATE EmploymentDetail SET TimeDoctorUserId=@TimeDoctorUserId WHERE EmployeeId=@EmployeeId;";
            await connection.ExecuteAsync(updateSql, new
            {
                TimeDoctorUserId = timeDoctorUserId,
                EmployeeId = empId
            });
        }


        public async Task<bool> GetConfigByEmployeeIDAsync(long employeeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = @"
                SELECT  IsManualAttendance from EmploymentDetail
                   where
                    EmployeeId = @EmployeeId
                ";

                var result = await connection.QuerySingleOrDefaultAsync<bool>(sql, new { EmployeeId = employeeId });
                return result;
            }
        }
        public async Task<string?> GetConfigTimeDoctorUserIdByEmployeeIDAsync(long employeeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = @"
                SELECT  [TimeDoctorUserId] from EmploymentDetail
                   where
                    EmployeeId = @EmployeeId
                ";

                var result = await connection.QuerySingleOrDefaultAsync<string>(sql, new { EmployeeId = employeeId });
                return result;
            }
        }

        public async Task<AttendancConfigSearchResponseDto> GetAttendanceConfigListAsync(int? ReportingManagerId, SearchRequestDto<AttendanceConfigSearchRequestDto> requestDto)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using var result = await connection.QueryMultipleAsync(
                "[dbo].[GetAttendanceConfigList]",
                new
                {
                    EmployeeName = requestDto.Filters.EmployeeName,
                    EmployeeEmail = requestDto.Filters.EmployeeEmail,
                    DepartmentId = requestDto.Filters.DepartmentId,
                    BranchId = requestDto.Filters.BranchId,
                    DesignationId = requestDto.Filters.DesignationId,
                    EmployeeCode = requestDto.Filters.EmployeeCode,
                    IsManualAttendance = requestDto.Filters.IsManualAttendance,
                    CountryId = requestDto.Filters.CountryId,
                    SortColumn = requestDto.SortColumnName,
                    SortDesc = requestDto.SortDirection?.ToLower() == "desc",
                    StartIndex = (Math.Max(requestDto.StartIndex, 1) - 1) * requestDto.PageSize,
                    PageSize = requestDto.PageSize,
                    DOJRangeFrom = requestDto.Filters.DOJFrom,
                    DOJRangeTo = requestDto.Filters.DOJTo,
                    ReportingManagerId = ReportingManagerId
                },
                commandType: CommandType.StoredProcedure
            );
            var res = new AttendancConfigSearchResponseDto();
            res.TotalRecords = await result.ReadSingleOrDefaultAsync<int>();
            res.AttendanceConfigList = (await result.ReadAsync<AttendancConfigDto>()).ToList();
            return res;
        }
        public async Task<Attendance?> GetAttendanceByIdAsync(long attendanceId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = "SELECT * FROM Attendance WHERE Id = @Id";
                var result = await connection.QueryFirstOrDefaultAsync<Attendance>(sql, new { Id = attendanceId });
                if (result != null)
                {
                    var auditSql = @"SELECT [Action], CONVERT(varchar, [Time], 120) as [Time], [Comment],[Reason] FROM AttendanceAudit WHERE AttendanceId = @AttendanceId";
                    var audits = await connection.QueryAsync<AttendanceAudit>(auditSql, new { AttendanceId = attendanceId });
                    result.Audit = new List<AttendanceAudit>(audits);
                }
                return result;
            }
        }

        public async Task<EmployeeReportResponseDto> GetEmployeeReport(int? ReportingManagerId, SearchRequestDto<EmployeeReportSearchRequestDto> requestDto)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            var StartDate = requestDto.Filters?.DateFrom ?? DateTime.Today.AddDays(-90).Date;
            var EndDate = requestDto.Filters?.DateTo ?? DateTime.Today.Date;
            using var result = await connection.QueryMultipleAsync(
                "[dbo].[GetEmployeeAttendanceReport]",
                new
                {
                    EmployeeCodes = requestDto.Filters?.EmployeeCode,
                    EmployeeName = requestDto.Filters?.EmployeeName,
                    EmployeeEmail = requestDto.Filters?.EmployeeEmail,
                    CountryId = requestDto.Filters?.CountryId,
                    DepartmentId = requestDto.Filters?.DepartmentId,
                    BranchId = requestDto.Filters?.BranchId,
                    DesignationId = requestDto.Filters?.DesignationId,
                    SortColumn = requestDto.SortColumnName,
                    SortDesc = requestDto.SortDirection?.ToLower() == "desc",
                    StartIndex = (Math.Max(requestDto.StartIndex, 1) - 1) * requestDto.PageSize,
                    PageSize = requestDto.PageSize,
                    IsManualAttendance = requestDto.Filters?.IsManualAttendance,
                    StartDate = StartDate.ToString("yyyy-MM-dd"),
                    EndDate = EndDate.ToString("yyyy-MM-dd"),
                    DOJRangeFrom = requestDto.Filters?.DOJFrom,
                    DOJRangeTo = requestDto.Filters?.DOJTo,
                    ReportingManagerId = ReportingManagerId
                },
                commandType: CommandType.StoredProcedure
            );
            var res = new EmployeeReportResponseDto();
            res.TotalRecords = await result.ReadSingleOrDefaultAsync<int>();
            var list = await result.ReadAsync<EmployeeReportDto>();
            if (list == null) return res;
            foreach (var employee in list)
            {
                var dictionary = JsonConvert.DeserializeObject<Dictionary<string, string>?>(employee.WorkedHoursByDateJson ?? "{}");
                if (employee.WorkedHoursByDateJson == null || dictionary == null)
                {
                    employee.TotalHour = "00:00";
                    employee.WorkedHoursByDate = new();
                    continue;
                }
                // to only get data with dates to reduce response size
                var total = TimeSpan.Zero;
                foreach (var item in dictionary.Keys)
                {
                    var ts = TimeSpan.Parse(dictionary[item], CultureInfo.InvariantCulture);
                    dictionary[item] = ts.ToString(@"hh\:mm");
                    total = total.Add(ts);
                }


                employee.TotalHour = $"{(int)total.TotalHours:D2}:{total.Minutes:D2}";
                employee.WorkedHoursByDate = dictionary;
                employee.WorkedHoursByDateJson = string.Empty;
            }
            res.EmployeeReports = list.ToList();
            return res;
        }
        public async Task<long?> AttendanceExistsAsync(long employeeId, string date)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = "SELECT Id FROM Attendance WHERE EmployeeId = @EmployeeId AND [Date] = @Date";
                var parsedDate = DateTime.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                var result = await connection.ExecuteScalarAsync<long?>(sql, new { EmployeeId = employeeId, Date = parsedDate });
                return result;
            }
        }

        public async Task<List<EmployeeCodeServiceDto>> GetEmployeeCodeAndNameListAsync(Roles RoleId, int? SessionUserId, string? employeeCode, string? employeeName,bool exEmployee)

        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = @"SELECT E.Id as EmployeeId, EmployeeCode,  CONCAT(
                        FirstName,
                        CASE WHEN MiddleName IS NOT NULL AND MiddleName <> '' THEN CONCAT(' ', MiddleName) ELSE '' END,
                        ' ',
                        LastName
                    ) AS EmployeeName From EmployeeData as E INNER JOIN EmploymentDetail  as ED ON E.Id = ED.EmployeeId WHERE E.IsDeleted=0";
                if (RoleId != Roles.SuperAdmin)
                {
                    sql += " AND ED.ReportingMangerId = @SessionUserId OR ED.ImmediateManager = @SessionUserId ";

                }
                if (!exEmployee)
                {
                    sql+= "AND ED.EmployeeStatus != 4 ";
                }
                if (!string.IsNullOrEmpty(employeeCode) || !string.IsNullOrEmpty(employeeName))
                {
                    sql += " AND (1=0";
                    if (!string.IsNullOrEmpty(employeeCode))
                        sql += " OR EmployeeCode LIKE '%' + @EmployeeCode + '%'";
                    if (!string.IsNullOrEmpty(employeeName))
                        sql += " OR (FirstName + CASE WHEN MiddleName IS NOT NULL AND MiddleName <> '' THEN ' ' + MiddleName ELSE '' END + ' ' + LastName) LIKE '%' + @EmployeeName + '%'";
                    sql += ")";
                }
                var result = (await connection.QueryAsync<EmployeeCodeServiceDto>(sql, new { EmployeeCode = employeeCode, EmployeeName = employeeName })).ToList();
                return result;
            }
        }
        public async Task<List<string>> GetAttendanceDateList(long employeeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var sql = @"SELECT  [Date] from Attendance where EmployeeId = @EmployeeId";

                var result = (await connection.QueryAsync<string>(sql, new { EmployeeId = employeeId })).ToList();
                return result;
            }
        }

        public async Task<byte[]> GenerateAttendanceReportExcelFile(List<EmployeeReportDto> employees, DateTime fromDate, DateTime toDate)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("AttendanceReport");

            if (employees.Count == 0) return [];
            var row = 1;
            var column = 1;
            worksheet.Cells.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet.Cells.Style.WrapText = true;

            worksheet.Column(column).Width = 5;
            worksheet.Cells[row, column++].Value = "Sr No.";
            worksheet.Column(column).Width = 35;
            worksheet.Cells[row, column++].Value = "Employee Name";
            worksheet.Column(column).Width = 10;
            worksheet.Cells[row, column++].Value = "Employee Code";
            worksheet.Cells[row, column++].Value = "Total Hours";

            var dates = Helper.GetDatesBetween(fromDate, toDate).OrderByDescending(d => d).ToList();


            foreach (var date in dates)
            {
                var colName = $"{date.DayOfWeek.ToString().Substring(0, 3)}\n({date.Date.ToShortDateString()})";
                worksheet.Cells[row, column++].Value = colName;
            }
            foreach (var report in employees)
            {
                row++;
                column = 1;
                worksheet.Cells[row, column++].Value = row - 1;
                worksheet.Cells[row, column++].Value = report.EmployeeName;
                worksheet.Cells[row, column++].Value = report.EmployeeCode;
                worksheet.Cells[row, column++].Value = Helper.GetFormattedTime(report.TotalHour);
                foreach (var date in dates)
                {

                    var key = date.ToString("yyyy-MM-dd");
                    if (report.WorkedHoursByDate.TryGetValue(key, out string? value))
                        worksheet.Cells[row, column++].Value = Helper.GetFormattedTime(value);
                    else
                        worksheet.Cells[row, column++].Value = 0;
                }
            }

            worksheet.Rows[1].Style.Font.Bold = true;
            worksheet.Columns[3, column].Width = 13;

            return await package.GetAsByteArrayAsync();
        }
    }
}
