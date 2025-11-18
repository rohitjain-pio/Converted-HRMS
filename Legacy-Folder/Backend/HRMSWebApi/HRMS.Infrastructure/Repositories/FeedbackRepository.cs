
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using Dapper;
using HRMS.Domain.Utility;
using HRMS.Domain.Entities;
using System.Data;
using Microsoft.Data.SqlClient;
using HRMS.Domain.Contants;
using HRMS.Application;
using System.Text;
using HRMS.Models;



namespace HRMS.Infrastructure.Repositories
{
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly IConfiguration _configuration;
        public FeedbackRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<long> AddFeedbackAsync(Feedback request)
        {
            var sql = @"
                INSERT INTO [dbo].[Feedback]
                ([EmployeeId], [TicketStatus], [FeedbackType], [Subject], [Description], [AdminComment], 
                 [AttachmentPath], [FileOriginalName], [CreatedBy], [CreatedOn])
                VALUES (@EmployeeId,1, @FeedbackType, @Subject, @Description, @AdminComment, 
                        @AttachmentPath, @FileOriginalName, @CreatedBy, @CreatedOn);
                SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var insertedId = await connection.ExecuteScalarAsync<long>(sql, request);
                return insertedId;
            }
        }

        public async Task<FeedbackListResponseDto?> GetAllFeedbackAsync(SearchRequestDto<FeedbackSearchRequestDto> requestDto)
        {
            var response = new FeedbackListResponseDto();
            var parameters = new DynamicParameters();

            int startIndex = (requestDto.StartIndex - 1) * requestDto.PageSize;
            parameters.Add("StartIndex", startIndex < 0 ? 0 : startIndex); 
            parameters.Add("PageSize", requestDto.PageSize);

            parameters.Add("EmployeeCodes", string.IsNullOrWhiteSpace(requestDto.Filters?.EmployeeCodes) ? null : requestDto.Filters.EmployeeCodes);
            parameters.Add("CreatedOnFrom", requestDto.Filters?.CreatedOnFrom?.ToDateTime(TimeOnly.MinValue) ?? null);
            parameters.Add("CreatedOnTo", requestDto.Filters?.CreatedOnTo?.ToDateTime(TimeOnly.MaxValue) ?? null);
            parameters.Add("FeedbackType", (requestDto.Filters?.FeedbackType != null && requestDto.Filters.FeedbackType != 0) ? (int?)requestDto.Filters.FeedbackType : null);
            parameters.Add("TicketStatus", (requestDto.Filters?.TicketStatus != null && requestDto.Filters.TicketStatus != 0) ? (int?)requestDto.Filters.TicketStatus : null);
            parameters.Add("SearchQuery", string.IsNullOrWhiteSpace(requestDto.Filters?.SearchQuery) ? null : requestDto.Filters.SearchQuery);

            string sortColumn = requestDto.SortColumnName;
            parameters.Add("SortColumn", string.IsNullOrWhiteSpace(sortColumn) ? null : sortColumn); 
            parameters.Add("SortDesc", requestDto.SortDirection?.ToUpper() == "ASC" ? 0 : 1);

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            using var multi = await connection.QueryMultipleAsync("GetAllFeedback", parameters, commandType: CommandType.StoredProcedure);

            response.TotalRecords = await multi.ReadSingleAsync<int>();
            response.FeedbackList = (await multi.ReadAsync<FeedbackResponseDto>()).ToList();

            return response;
        }

        public async Task<FeedbackByEmployeeListResponseDto?> GetFeedbackByEmployeeAsync(int userSessionId, SearchRequestDto<FeedbackSearchRequestDto> requestDto)
        {
            var response = new FeedbackByEmployeeListResponseDto();
            var parameters = new DynamicParameters();

            parameters.Add("UserSessionId", userSessionId);

            int startIndex = (requestDto.StartIndex - 1) * requestDto.PageSize;
            parameters.Add("StartIndex", startIndex < 0 ? 0 : startIndex);
            parameters.Add("PageSize", requestDto.PageSize);

            parameters.Add("EmployeeCodes", string.IsNullOrWhiteSpace(requestDto.Filters?.EmployeeCodes) ? null : requestDto.Filters.EmployeeCodes);
            parameters.Add("CreatedOnFrom", requestDto.Filters?.CreatedOnFrom?.ToDateTime(TimeOnly.MinValue) ?? null);
            parameters.Add("CreatedOnTo", requestDto.Filters?.CreatedOnTo?.ToDateTime(TimeOnly.MaxValue) ?? null);
            parameters.Add("FeedbackType", (requestDto.Filters?.FeedbackType != null && requestDto.Filters.FeedbackType != 0) ? (int?)requestDto.Filters.FeedbackType : null);
            parameters.Add("TicketStatus", (requestDto.Filters?.TicketStatus != null && requestDto.Filters.TicketStatus != 0) ? (int?)requestDto.Filters.TicketStatus : null);
            parameters.Add("SearchQuery", string.IsNullOrWhiteSpace(requestDto.Filters?.SearchQuery) ? null : requestDto.Filters.SearchQuery);

            string sortColumn = requestDto.SortColumnName;
            parameters.Add("SortColumn", string.IsNullOrWhiteSpace(sortColumn) ? null : sortColumn);
            parameters.Add("SortDesc", requestDto.SortDirection?.ToUpper() == "ASC" ? 0 : 1);

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            using var multi = await connection.QueryMultipleAsync("GetFeedbackByEmployee", parameters, commandType: CommandType.StoredProcedure);

            response.TotalRecords = await multi.ReadSingleAsync<int>();
            response.FeedbackList = (await multi.ReadAsync<FeedbackByEmployeeResponseDto>()).ToList();

            return response;
        }

        public async Task<FeedbackResponseDto?> GetFeedbackByIdAsync(long id)
        {
            var sql = @"
                SELECT 
                    f.[Id],
                    f.[EmployeeId],
                    CONCAT(e.[FirstName], ' ', 
                           CASE WHEN e.[MiddleName] IS NOT NULL THEN e.[MiddleName] + ' ' ELSE '' END, 
                           e.[LastName]) AS EmployeeName,
                    f.[CreatedBy] AS EmployeeEmail,
                    f.[TicketStatus],
                    f.[FeedbackType],
                    f.[Subject],
                    f.[Description],
                    f.[AdminComment],
                    f.[AttachmentPath],
                    f.[FileOriginalName],
                    f.[CreatedOn],
                    f.[ModifiedOn]
                FROM [dbo].[Feedback] f
                LEFT JOIN [dbo].[EmployeeData] e ON f.[EmployeeId] = e.[Id]
                WHERE f.[Id] = @Id ;";

            using (var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                await connection.OpenAsync();
                var feedback = await connection.QuerySingleOrDefaultAsync<FeedbackResponseDto>(sql, new { Id = id });
                return feedback;
            }
        }

        public async Task UpdateFeedbackAsync(Feedback feedback)
        {
            var sql = @"
                UPDATE [dbo].[Feedback]
                SET [TicketStatus] = @TicketStatus,
                    [AdminComment] = @AdminComment,
                    [ModifiedBy] = @ModifiedBy,
                    [ModifiedOn] = @ModifiedOn
                WHERE [Id] = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                await connection.ExecuteAsync(sql, feedback);
            }
        }


        
    }
}