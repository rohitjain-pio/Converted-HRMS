using HRMS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System.Data;
using Dapper;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Domain.Enums;
using HRMS.Models.Models.Grievance;
using System.Text;
using Microsoft.Data.SqlClient;
using HRMS.Domain.Contants;



namespace HRMS.Infrastructure.Repositories
{

    public class GrievanceRepository : IGrievanceRepository
    {
        private readonly IConfiguration _configuration;
        public GrievanceRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task DeleteGrievanceAsync(GrievanceType type)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
                    UPDATE GrievanceType 
                    SET IsActive = 0, 
                        ModifiedBy = @ModifiedBy, 
                        ModifiedOn = @ModifiedOn 
                    WHERE Id = @Id";

                var parameters = new
                {
                    Id = type.Id,
                    ModifiedBy = type.ModifiedBy,
                    ModifiedOn = DateTime.UtcNow
                };

                await connection.ExecuteAsync(sqlQuery, parameters);
            }
        }
        public async Task<EmployeeGrievanceResponseList> GetEmployeeGrievancesAsync(long EmployeeId, SearchRequestDto<EmployeeGrievanceFilterDto> request)
        {
            var connectionString = _configuration.GetConnectionString(ConnectionStrings.DefaultConnection);
            using (IDbConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                var filter = request.Filters;

                // Default sorting fallback
                string sortColumn = !string.IsNullOrWhiteSpace(request.SortColumnName) ? request.SortColumnName : "CreatedOn";
                string sortDirection = !string.IsNullOrWhiteSpace(request.SortDirection) ? request.SortDirection.ToUpper() : "DESC";

                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeId", EmployeeId);
                parameters.Add("@GrievanceTypeId", filter.GrievanceTypeId);
                parameters.Add("@Status", filter.Status);
                parameters.Add("@SortColumnName", sortColumn);
                parameters.Add("@SortDirection", sortDirection);
                parameters.Add("@StartIndex", request.StartIndex > 0 ? request.StartIndex : 0);
                parameters.Add("@PageSize", request.PageSize);

                // This will contain multiple result sets: first total count, second actual data
                using (var multi = await connection.QueryMultipleAsync("GetEmployeeGrievances", parameters, commandType: CommandType.StoredProcedure))
                {
                    int totalRecords = await multi.ReadFirstAsync<int>();
                    var grievances = (await multi.ReadAsync<EmployeeGrievanceResponseDto>()).ToList();

                    return new EmployeeGrievanceResponseList
                    {
                        EmployeeGrievanceList = grievances,
                        TotalRecords = totalRecords
                    };
                }

            }
        }




        public async Task<string> GenerateTicketNumberAsync(int grievanceTypeId)
        {
            var connectionString = _configuration.GetConnectionString(ConnectionStrings.DefaultConnection);
            using (IDbConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                var grievanceName = await connection.QueryFirstOrDefaultAsync<string>(
                    "SELECT GrievanceName FROM GrievanceType WHERE Id = @Id", new { Id = grievanceTypeId });

                if (string.IsNullOrWhiteSpace(grievanceName))
                    grievanceName = "NIL";

                var shortCode = new string(grievanceName
                    .Where(char.IsLetter)
                    .Take(3)
                    .ToArray())
                    .ToUpper();


                var datePart = DateTime.UtcNow.ToString("ddMM");
                var likePattern = $"GR{shortCode}-{datePart}-%";

                var query = @"
            SELECT TOP 1 CAST(RIGHT(TicketNo, 6) AS INT) + 1
            FROM EmployeeGrievance
            WHERE TicketNo LIKE @LikePattern
            ORDER BY TicketNo DESC";

                var nextSequence = await connection.ExecuteScalarAsync<int?>(query, new
                {
                    GrievanceTypeId = grievanceTypeId,
                    LikePattern = likePattern
                }) ?? 1;

                var sequence = nextSequence.ToString("D6");

                return $"GR{shortCode}-{datePart}-{sequence}";
            }
        }


        public async Task<long> InsertEmployeeGrievanceAsync(EmployeeGrievance employeeGrievance, string ticketNo)
        {
            var connectionString = _configuration.GetConnectionString(ConnectionStrings.DefaultConnection);

            const string insertSql = @"
            INSERT INTO EmployeeGrievance
            (
                EmployeeId,
                GrievanceTypeId,
                Title,
                Description,
                AttachmentPath,
                FileOriginalName,
                CreatedBy,
                CreatedOn,
                TicketNo,
                Level,
                Status,
                TatStatus
            )
            OUTPUT INSERTED.Id
            VALUES
            (
                @EmployeeId,
                @GrievanceTypeId,
                @Title,
                @Description,
                @AttachmentPath,
                @FileOriginalName,
                @CreatedBy,
                @CreatedOn,
                @TicketNo,
                @Level,
                @Status,
                @TatStatus
            )";

            var parameters = new
            {
                employeeGrievance.EmployeeId,
                employeeGrievance.GrievanceTypeId,
                employeeGrievance.Title,
                employeeGrievance.Description,
                employeeGrievance.AttachmentPath,
                employeeGrievance.FileOriginalName,
                employeeGrievance.CreatedBy,
                employeeGrievance.CreatedOn,
                TicketNo = ticketNo,
                employeeGrievance.Level,
                Status = (byte)GrievanceStatus.Open,
                TatStatus = TatStatus.OnTime
            };

            using (IDbConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                int insertedId = await connection.QuerySingleAsync<int>(insertSql, parameters);
                return insertedId;
            }
        }



        public async Task<GrievanceListResponseDTO> GetAllGrievancesAsync()
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
                    SELECT 
                        gt.Id,
                        gt.GrievanceName,
                        gt.Description,
                        gt.IsAutoEscalation,
                        gt.L1TatHours,
                        STRING_AGG(CAST(go1.OwnerID AS NVARCHAR(50)), ',') AS L1OwnerId,
                        STRING_AGG(CONCAT(ed1.FirstName, ' ', ed1.LastName), ',') AS L1OwnerName,
                        gt.L2TatHours,
                        STRING_AGG(CAST(go2.OwnerID AS NVARCHAR(50)), ',') AS L2OwnerId,
                        STRING_AGG(CONCAT(ed2.FirstName, ' ', ed2.LastName), ',') AS L2OwnerName,
                        gt.L3TatDays,
                        STRING_AGG(CAST(go3.OwnerID AS NVARCHAR(50)), ',') AS L3OwnerId,
                        STRING_AGG(CONCAT(ed3.FirstName, ' ', ed3.LastName), ',') AS L3OwnerName
                    FROM [dbo].[GrievanceType] gt
                    LEFT JOIN [dbo].[GrievanceOwner] go1 ON gt.Id = go1.GrievanceTypeId AND go1.Level = 1 AND go1.IsDeleted = 0
                    LEFT JOIN [dbo].[EmployeeData] ed1 ON go1.OwnerID = ed1.Id
                    LEFT JOIN [dbo].[GrievanceOwner] go2 ON gt.Id = go2.GrievanceTypeId AND go2.Level = 2 AND go2.IsDeleted = 0
                    LEFT JOIN [dbo].[EmployeeData] ed2 ON go2.OwnerID = ed2.Id
                    LEFT JOIN [dbo].[GrievanceOwner] go3 ON gt.Id = go3.GrievanceTypeId AND go3.Level = 3 AND go3.IsDeleted = 0
                    LEFT JOIN [dbo].[EmployeeData] ed3 ON go3.OwnerID = ed3.Id
                    WHERE gt.IsActive = 1 
                    GROUP BY gt.Id, gt.GrievanceName, gt.L1TatHours, gt.L2TatHours, gt.L3TatDays,gt.Description,gt.IsAutoEscalation
                    ORDER BY gt.Id;";

                var grievances = await connection.QueryAsync<GrievanceResponseDTO>(sqlQuery);

                return new GrievanceListResponseDTO
                {
                    GrievanceList = grievances
                };
            }
        }

        public async Task<GrievanceResponseDTO> GetGrievanceTypeByIdAsync(long grievanceTypeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
                    SELECT 
                        gt.Id,
                        gt.GrievanceName,
                        gt.Description,
                        gt.IsAutoEscalation,
                        gt.L1TatHours,
                        STRING_AGG(CAST(go1.OwnerID AS NVARCHAR(50)), ',') AS L1OwnerId,
                        STRING_AGG(CONCAT(ed1.FirstName, ' ', ed1.LastName), ',') AS L1OwnerName,
                        gt.L2TatHours,
                        STRING_AGG(CAST(go2.OwnerID AS NVARCHAR(50)), ',') AS L2OwnerId,
                        STRING_AGG(CONCAT(ed2.FirstName, ' ', ed2.LastName), ',') AS L2OwnerName,
                        gt.L3TatDays,
                        STRING_AGG(CAST(go3.OwnerID AS NVARCHAR(50)), ',') AS L3OwnerId,
                        STRING_AGG(CONCAT(ed3.FirstName, ' ', ed3.LastName), ',') AS L3OwnerName
                    FROM [dbo].[GrievanceType] gt
                    LEFT JOIN [dbo].[GrievanceOwner] go1 ON gt.Id = go1.GrievanceTypeId AND go1.Level = 1 AND go1.IsDeleted = 0
                    LEFT JOIN [dbo].[EmployeeData] ed1 ON go1.OwnerID = ed1.Id
                    LEFT JOIN [dbo].[GrievanceOwner] go2 ON gt.Id = go2.GrievanceTypeId AND go2.Level = 2 AND go2.IsDeleted = 0
                    LEFT JOIN [dbo].[EmployeeData] ed2 ON go2.OwnerID = ed2.Id
                    LEFT JOIN [dbo].[GrievanceOwner] go3 ON gt.Id = go3.GrievanceTypeId AND go3.Level = 3 AND go3.IsDeleted = 0
                    LEFT JOIN [dbo].[EmployeeData] ed3 ON go3.OwnerID = ed3.Id
                    WHERE gt.IsActive = 1 AND gt.Id = @GrievanceTypeId 
                    GROUP BY gt.Id, gt.GrievanceName, gt.L1TatHours, gt.L2TatHours, gt.L3TatDays,gt.Description,gt.IsAutoEscalation;";

                var grievance = await connection.QuerySingleOrDefaultAsync<GrievanceResponseDTO>(sqlQuery, new { GrievanceTypeId = grievanceTypeId });

                return grievance ?? new GrievanceResponseDTO();
            }
        }

        public async Task<int> AddGrievanceTypeAsync(GrievanceType grievanceType)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
                    INSERT INTO [dbo].[GrievanceType] (
                        GrievanceName,
                        Description,
                        L1TatHours,
                        L2TatHours,
                        L3TatDays,
                        IsActive,
                        IsAutoEscalation,
                        CreatedBy,
                        CreatedOn,
                        ModifiedBy,
                        ModifiedOn
                    )
                    OUTPUT INSERTED.Id
                    VALUES (
                        @GrievanceName,
                        @Description,
                        @L1TatHours,
                        @L2TatHours,
                        @L3TatDays,
                        @IsActive,
                        @IsAutoEscalation,
                        @CreatedBy,
                        @CreatedOn,
                        @ModifiedBy,
                        @ModifiedOn
                    );";


                return await connection.QuerySingleAsync<int>(sqlQuery, grievanceType);
            }
        }
        public async Task<int> UpdateGrievanceTypeAsync(GrievanceType grievanceType)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
            UPDATE [dbo].[GrievanceType]
            SET
                GrievanceName = @GrievanceName,
                Description=@Description,
                L1TatHours = @L1TatHours,
                L2TatHours = @L2TatHours,
                L3TatDays = @L3TatDays,
                IsActive = @IsActive,
                IsAutoEscalation = @IsAutoEscalation,
                ModifiedBy = @ModifiedBy,
                ModifiedOn = @ModifiedOn
            WHERE Id = @Id;";

                string softDeleteOwnersSql = @"
            UPDATE [dbo].[GrievanceOwner]
            SET
                IsDeleted = 1,
                ModifiedBy = @ModifiedBy,
                ModifiedOn = @ModifiedOn
            WHERE GrievanceTypeId = @Id AND IsDeleted = 0;";

                using (var transaction = connection.BeginTransaction())
                {
                    await connection.ExecuteAsync(sqlQuery, grievanceType, transaction);
                    await connection.ExecuteAsync(softDeleteOwnersSql, new
                    {
                        Id = grievanceType.Id,
                        grievanceType.ModifiedBy,
                        grievanceType.ModifiedOn
                    }, transaction);

                    transaction.Commit();
                }

                return 1;
            }


        }

        public async Task AddGrievanceOwnerAsync(GrievanceOwner grievanceOwner)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
                    INSERT INTO [dbo].[GrievanceOwner] (
                        GrievanceTypeId,
                        Level,
                        OwnerID,
                        CreatedBy,
                        CreatedOn,
                        ModifiedBy,
                        ModifiedOn,
                        IsDeleted
                    )
                    VALUES (
                        @GrievanceTypeId,
                        @Level,
                        @OwnerID,
                        @CreatedBy,
                        @CreatedOn,
                        @ModifiedBy,
                        @ModifiedOn,
                        @IsDeleted
                    );";

                await connection.ExecuteAsync(sqlQuery, grievanceOwner);
            }
        }

        public async Task<EmployeeGrievanceDetail?> GetEmployeeGrievancesDetailAsync(long TicketId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sqlQuery = @"
                    SELECT 
                eg.TicketNo,
                gt.GrievanceName AS GrievanceTypeName,
                go.GrievanceTypeId,
                eg.Level,
                eg.Title,
                eg.Description,
                eg.Status,
                eg.CreatedOn,
                eg.ResolvedDate AS ResolvedDate,
                eg.AttachmentPath,
                eg.FileOriginalName,
                LTRIM(RTRIM(
                    ISNULL(emp.FirstName, '') + ' ' +
                    ISNULL(emp.MiddleName + ' ', '') +
                    ISNULL(emp.LastName, '')
                )) AS requesterName,
                empd.Email as requesterEmail,
                emp.FileName as requesterAvatar,
                STRING_AGG(
                    LTRIM(RTRIM(
                        ISNULL(ed.FirstName, '') + ' ' +
                        ISNULL(ed.MiddleName + ' ', '') +
                        ISNULL(ed.LastName, '')
                    )), ', '
                ) AS ManageBy
            FROM EmployeeGrievance eg
            INNER JOIN GrievanceType gt 
                ON eg.GrievanceTypeId = gt.Id
            LEFT JOIN GrievanceOwner go 
                ON eg.GrievanceTypeId = go.GrievanceTypeId 
                AND eg.Level = go.Level
            LEFT JOIN EmployeeData ed 
                ON go.OwnerID = ed.Id 
            LEFT JOIN EmployeeData emp 
                ON eg.EmployeeId = emp.id
            LEFT JOIN EmploymentDetail empd
                ON eg.EmployeeId = empd.EmployeeId
            WHERE eg.Id = @TicketId
            AND go.IsDeleted = 0
            GROUP BY 
                eg.TicketNo,
                gt.GrievanceName,
                go.GrievanceTypeId,
                eg.Level,
                eg.Title,
                eg.Description,
                eg.Status,
                eg.CreatedOn,
                eg.ResolvedDate,
                eg.AttachmentPath,
                empd.Email,
                emp.FileName,
                emp.FirstName,
                emp.MiddleName,
                emp.LastName,
                eg.FileOriginalName;";


                var grievanceDetail = await connection.QuerySingleOrDefaultAsync<EmployeeGrievanceDetail>(sqlQuery, new { TicketId = TicketId });

                return grievanceDetail;

            }
        }

        public async Task<EmployeeListGrievanceResponseList> GetEmployeeListGrievancesAsync(int? SessionUserId, Roles RoleId, SearchRequestDto<EmployeeListGrievanceFilterDto> request)
        {
            var filters = request.Filters;
            var parameters = new DynamicParameters();

            parameters.Add("SessionUserId", SessionUserId);
            parameters.Add("RoleId", (int)RoleId);
            parameters.Add("GrievanceTypeId", filters?.GrievanceTypeId);
            parameters.Add("Status", filters?.Status);
            parameters.Add("TatStatus", filters?.TatStatus);
            parameters.Add("CreatedOnFrom", filters?.CreatedOnFrom.HasValue == true ? filters.CreatedOnFrom.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null);
            parameters.Add("CreatedOnTo", filters?.CreatedOnTo.HasValue == true ? filters.CreatedOnTo.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null);
            parameters.Add("ResolvedDate", filters?.ResolvedDate.HasValue == true ? filters.ResolvedDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null);
            parameters.Add("ResolvedBy", filters?.ResolvedBy);
            parameters.Add("CreatedBy", filters?.CreatedBy);
            parameters.Add("Level", filters?.Level);
            parameters.Add("SortColumnName", string.IsNullOrWhiteSpace(request.SortColumnName) ? "CreatedOn" : request.SortColumnName);
            parameters.Add("SortDirection", string.Equals(request.SortDirection, "ASC", StringComparison.OrdinalIgnoreCase) ? "ASC" : "DESC");
            parameters.Add("StartIndex", request.StartIndex < 1 ? 1 : request.StartIndex);
            parameters.Add("PageSize", request.PageSize);

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();


            using var multi = await connection.QueryMultipleAsync("GetEmployeeListGrievances", parameters, commandType: CommandType.StoredProcedure);

            var totalCount = await multi.ReadFirstAsync<int>();
            var data = (await multi.ReadAsync<EmployeeListGrievanceResponseDto>()).ToList();


            return new EmployeeListGrievanceResponseList
            {
                EmployeeListGrievance = data,
                TotalRecords = totalCount
            };
        }




        public async Task<EmployeeGrievanceRemarksDetail?> GetEmployeeGrievanceRemarksDetailAsync(long ticketId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                string sql = @"
                 SELECT 
                    CONCAT(ed.FirstName, ' ', ISNULL(ed.MiddleName + ' ', ''), ed.LastName) AS RemarkOwnerName,
                    empd.Email AS RemarkOwnerEmail,
                    ed.Id AS RemarkOwnerEmpId,
                    ed.FileName AS RemarkOwnerAvatar,
                    gr.Remarks,
                    gr.AttachmentPath,
                    gr.FileOriginalName,
                    gr.Status,
                    gr.CreatedOn,
					eg.Level
                FROM GrievanceRemarks gr
                LEFT JOIN EmployeeData ed ON gr.OwnerId = ed.Id
                LEFT JOIN EmploymentDetail empd ON empd.EmployeeId = ed.Id
				LEFT JOIN EmployeeGrievance eg ON eg.Id = gr.TicketId
                WHERE gr.TicketId = @TicketId
                ORDER BY gr.CreatedOn ASC;";

                var remarks = await connection.QueryAsync<EmployeeGrievanceRemarkDto>(sql, new { TicketId = ticketId });

                var remarksList = remarks.ToList();


                return new EmployeeGrievanceRemarksDetail
                {
                    RemarksList = remarksList
                };
            }
        }

        public async Task<EmployeeGrievance?> GetEmployeeGrievanceByIdAsync(long ticketId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                const string query = @"SELECT * FROM EmployeeGrievance WHERE Id = @TicketId";

                return await connection.QuerySingleOrDefaultAsync<EmployeeGrievance>(query, new { TicketId = ticketId });
            }
        }

        public async Task<List<int>> GetOwnersByGrievanceIdAndLevelAsync(int grievanceTypeId, int level)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                const string query = @"
            SELECT OwnerID
            FROM GrievanceOwner
            WHERE GrievanceTypeId = @GrievanceTypeId
              AND Level = @Level
              AND IsDeleted = 0";

                var result = await connection.QueryAsync<int>(query, new { GrievanceTypeId = grievanceTypeId, Level = level });

                return result.ToList();
            }
        }

        public async Task InsertGrievanceRemarkAsync(GrievanceRemarks remark)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                const string query = @"
            INSERT INTO GrievanceRemarks
            (
                TicketId,
                Remarks,
                OwnerId,
                AttachmentPath,
                FileOriginalName,
                Status,
                CreatedOn,
                CreatedBy
            )
            VALUES
            (
                @TicketId,
                @Remarks,
                @OwnerId,
                @AttachmentPath,
                @FileOriginalName,
                @Status,
                @CreatedOn,
                @CreatedBy
            )";

                await connection.ExecuteAsync(query, remark);
            }
        }

        public async Task ResolveGrievanceAsync(long ticketId, int ownerId, GrievanceRemarks remark)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                const string query = @"
            UPDATE EmployeeGrievance
            SET 
                Status = @Status,
                ResolvedDate = @ResolvedDate,
                ResolvedBy = @ResolvedBy,
                ModifiedBy = @ModifiedBy,
                ModifiedOn = @ModifiedOn 
            WHERE Id = @TicketId";

                await connection.ExecuteAsync(query, new
                {
                    TicketId = ticketId,
                    ResolvedBy = ownerId,
                    ResolvedDate = DateTime.UtcNow,
                    Status = (byte)GrievanceStatus.Resolved,
                    ModifiedBy = remark.ModifiedBy,
                    ModifiedOn = remark.ModifiedOn,
                });
            }
        }

        public async Task EscalateGrievanceAsync(long ticketId, int newLevel, GrievanceRemarks remark)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {

                connection.Open();

                const string query = @"
            UPDATE EmployeeGrievance
            SET 
                Level = @NewLevel,
                Status = @escalatedStatus,
                ModifiedBy = @ModifiedBy,
                ModifiedOn = @ModifiedOn 
            WHERE Id = @TicketId";

                await connection.ExecuteAsync(query, new
                {
                    TicketId = ticketId,
                    NewLevel = newLevel,
                    escalatedStatus = (int)GrievanceStatus.Escalated,
                    ModifiedBy = remark.ModifiedBy,
                    ModifiedOn = remark.ModifiedOn,
                });
            }
        }

        public async Task<string?> GetTicketNoByIdAsync(long ticketId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                const string query = @"SELECT TicketNo FROM EmployeeGrievance WHERE Id = @TicketId";

                return await connection.QueryFirstOrDefaultAsync<string?>(query, new { TicketId = ticketId });
            }
        }

        public async Task EscalateGrievanceByCronAsync()
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                ///Need to replace MINUTE to HOURS
                connection.Open();

                const string query = @"UPDATE eg
                SET eg.Level = 
                CASE 
                    WHEN eg.Level = 1 AND DATEDIFF(HOUR, ISNULL(eg.ModifiedOn, eg.CreatedOn), GETUTCDATE()) > gt.L1TatHours THEN 2
                    WHEN eg.Level = 2 AND DATEDIFF(HOUR, ISNULL(eg.ModifiedOn, eg.CreatedOn), GETUTCDATE()) > gt.L2TatHours THEN 3
                    ELSE eg.Level
                END, eg.Status = 5,eg.TatStatus = 2,eg.ModifiedOn = GETUTCDATE(),eg.ModifiedBy = 'Admin'
            FROM dbo.EmployeeGrievance eg
            JOIN dbo.GrievanceType gt ON eg.GrievanceTypeId = gt.Id
            WHERE eg.Status NOT IN (3, 4)
              AND (
                    (eg.Level = 1 AND DATEDIFF(HOUR, ISNULL(eg.ModifiedOn, eg.CreatedOn), GETUTCDATE()) > gt.L1TatHours)
                 OR (eg.Level = 2 AND DATEDIFF(HOUR, ISNULL(eg.ModifiedOn, eg.CreatedOn), GETUTCDATE()) > gt.L2TatHours)
              ) AND ISNULL(gt.IsAutoEscalation, 0) = 1;
";

                const string queryIns = @" 
                INSERT INTO [dbo].[GrievanceRemarks]
                           ([TicketId]
                           ,[OwnerId]
                           ,[Remarks]
                           ,[AttachmentPath]
                           ,[FileOriginalName]
                           ,[Status]  
                           ,[CreatedBy]
                           ,[CreatedOn]
                           ,[ModifiedBy]
                           ,[ModifiedOn])
                SELECT	
                           eg.Id as TicketId,
                           NULL as  OwnerId,
                           CASE WHEN eg.Level = 1  THEN 'Auto Escalated to L2' WHEN eg.Level = 2   THEN 'Auto Escalated to L3' ELSE '' END as [Remarks],   
                           NULL as [AttachmentPath], 
                           NULL as [FileOriginalName], 
                            5 as  [Status], 
                            'Admin' as [CreatedBy],
                            GETUTCDATE() as [CreatedOn],
                            NULL as [ModifiedBy],
                            NULL as [ModifiedOn]   
                FROM dbo.EmployeeGrievance eg
                JOIN dbo.GrievanceType gt ON eg.GrievanceTypeId = gt.Id
                WHERE eg.Status NOT IN (3, 4)
                  AND (
                        (eg.Level = 1 AND DATEDIFF(HOUR, ISNULL(eg.ModifiedOn, eg.CreatedOn), GETUTCDATE()) > gt.L1TatHours)
                     OR (eg.Level = 2 AND DATEDIFF(HOUR, ISNULL(eg.ModifiedOn, eg.CreatedOn), GETUTCDATE()) > gt.L2TatHours)
                  ) AND ISNULL(gt.IsAutoEscalation, 0) = 1;";

                await connection.ExecuteAsync(queryIns);
                await connection.ExecuteAsync(query);

            }
        }

        public async Task<bool> GrievanceViewAllowedAsync(long grievanceId, int? SessionUserId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                 connection.Open();

                const string grievanceQuery = @"
            SELECT EmployeeId, GrievanceTypeId 
            FROM EmployeeGrievance
            WHERE Id = @GrievanceId";

                var grievance = await connection.QueryFirstOrDefaultAsync<(long EmployeeId, long GrievanceTypeId)>(
                    grievanceQuery, new { GrievanceId = grievanceId });

                if (grievance == default)
                    return false;

                const string ownerQuery = @"
            SELECT OwnerID 
            FROM GrievanceOwner 
            WHERE GrievanceTypeId = @GrievanceTypeId";

                var ownerIds = await connection.QueryAsync<int?>(
                    ownerQuery, new { grievance.GrievanceTypeId });

                return SessionUserId == grievance.EmployeeId || ownerIds.Contains(SessionUserId);
            }
        }

    }


}

