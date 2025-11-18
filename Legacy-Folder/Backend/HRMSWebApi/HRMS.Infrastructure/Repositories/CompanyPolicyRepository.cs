using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;
using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Text;
using static Dapper.SqlMapper;

namespace HRMS.Infrastructure.Repositories
{
    public class CompanyPolicyRepository : ICompanyPolicyRepository
    {
        private readonly IConfiguration _configuration;
        public CompanyPolicyRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<int> AddAsync(CompanyPolicy entity)
        {
            entity.VersionNo = 1;

            var sql = @"
        INSERT INTO [dbo].[CompanyPolicy] (
            [Name],
            [DocumentCategoryId],
            [EffectiveDate],
            [VersionNo],
            [StatusId],
            [Accessibility],
            [CreatedBy],
            [CreatedOn],
            [IsDeleted],
            [FileName],
            [FileOriginalName],
            [Description]
        )
        VALUES (
            @Name,
            @DocumentCategoryId,
            @EffectiveDate,
            @VersionNo,
            @StatusId,
            @Accessibility,
            @CreatedBy,
            @CreatedOn,
            0,
            @FileName,
            @FileOriginalName,
            @Description
        );

        SELECT CAST(SCOPE_IDENTITY() AS INT);
    ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                try
                {
                    var result = await connection.QuerySingleAsync<int>(sql, entity);
                    return result;

                }
                catch (Exception)
                {
                    return -1;
                }
            }
        }


        public Task<IReadOnlyList<CompanyPolicy>> GetAllAsync()
        {
            throw new NotImplementedException();
        }
        public async Task<CompanyPolicy?> GetByIdAsync(long id)
        {

            var sql = @"SELECT cp.Id,Name,[DocumentCategoryId],EffectiveDate,cdc.CategoryName as DocumentCategory ,VersionNo 
                        ,cp.ModifiedOn,cp.ModifiedBy,cp.CreatedOn,cp.CreatedBy
	                    ,cp.[StatusId],cp.[Accessibility],
						cp.Description FROM CompanyPolicy cp
						Join dbo.CompanyPolicyDocCategory cdc on cdc.Id = cp.DocumentCategoryId	                  
	                    WHERE cp.Id = @Id AND ISNULL(cp.IsDeleted,0) = 0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<CompanyPolicy>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<CompanyPolicySearchResponseDto> GetCompanyPolicies(SearchRequestDto<CompanyPolicySearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT COUNT(id)  AS TotalRecords FROM CompanyPolicy WHERE ISNULL(IsDeleted,0) = 0 ");

            if (requestDto != null && requestDto.Filters.DocumentCategoryId != 0)
            {
                query.Append(" and DocumentCategoryId = @pdoccatid");
            }
            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.Name))
            {
                query.Append(" and Name like '%'+@pname+'%'");
            }
            if (requestDto != null && requestDto.Filters.StatusId != 0)
            {
                query.Append(" and StatusId = @pstatusid");
            }

            var sqlQuery = $@"EXEC [dbo].[GetCompanyPolicyDocuments] @StatusId, @PolicyName,@CategoryId,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                CompanyPolicySearchResponseDto companyPolicySearchResponseDto = new CompanyPolicySearchResponseDto();

                connection.Open();
                companyPolicySearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { pstatusid = requestDto!.Filters.StatusId, pdoccatid = requestDto!.Filters.DocumentCategoryId, pname = requestDto!.Filters.Name });
                companyPolicySearchResponseDto.CompanyPolicyList = await connection.QueryAsync<CompanyPolicyResponseDto>(sqlQuery, new { StatusId = requestDto.Filters.StatusId, PolicyName = requestDto.Filters.Name, CategoryId = requestDto.Filters.DocumentCategoryId, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });

                return companyPolicySearchResponseDto;
            }
        }
        public async Task<int> UpdateAsync(CompanyPolicy entity)
        {
            string sql = @"UPDATE [dbo].[CompanyPolicy] SET [Name]=@Name,[DocumentCategoryId]=@DocumentCategoryId ,[StatusId]=@StatusId,[EffectiveDate]=@EffectiveDate ,[Accessibility]=@Accessibility,[ModifiedBy]=@ModifiedBy,[ModifiedOn]=@ModifiedOn, [Description]=@Description  ";

            if (!string.IsNullOrEmpty(entity.FileName) && !string.IsNullOrEmpty(entity.FileOriginalName))
            {
                sql += ",[FileName]=@FileName,[FileOriginalName]=@FileOriginalName";
            }
            sql += " WHERE ID=@ID";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, entity);
                return result;
            }
        }
        public async Task<IEnumerable<PolicyStatus?>> GetPolicyStatus()
        {
            var sql = "SELECT Id,StatusValue FROM PolicyStatus WHERE IsDeleted =0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<PolicyStatus>(sql);
                return result.ToList();
            }
        }
        public async Task<IEnumerable<CompanyPolicyDocCategory>> GetCompanyPolicyDocumentCategory()
        {
            var sql = "SELECT Id,CategoryName FROM CompanyPolicyDocCategory WHERE IsDeleted =0 Order by CategoryName ASC";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<CompanyPolicyDocCategory>(sql);
                return result.ToList();
            }
        }
        public async Task<CompanyPolicyHistorySearchResponseDto?> GetPolicyHistory(SearchRequestDto<CompanyPolicyHistorySearchRequestDto> companyPolicyHistorySearch)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT COUNT([PolicyId]) AS TotalRecords FROM CompanyPolicyHistory WHERE IsDeleted =0 ");

            if (companyPolicyHistorySearch != null && companyPolicyHistorySearch.Filters.PolicyId != 0)
            {
                query.Append(" and PolicyId = @policyId");
            }
            var sql = @"EXEC [GetHistoryListByPolicyId]  @PolicyId, @SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            CompanyPolicyHistorySearchResponseDto policyHistorySearchResponseDto = new();
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                policyHistorySearchResponseDto.companyPolicyHistoryResponseDto = await connection.QueryAsync<CompanyPolicyHistoryResponseDto>(sql, new { companyPolicyHistorySearch?.Filters.PolicyId, companyPolicyHistorySearch?.SortColumnName, SortColumnDirection = companyPolicyHistorySearch?.SortDirection, companyPolicyHistorySearch?.StartIndex, companyPolicyHistorySearch?.PageSize });
                policyHistorySearchResponseDto.TotalRecords = await connection.QueryFirstOrDefaultAsync<int>(query.ToString(), new { policyId = companyPolicyHistorySearch?.Filters.PolicyId });

                return policyHistorySearchResponseDto;
            }
        }
        public async Task<int> AddPolicyHistory(CompanyPolicy entity)
        {
            var sqlInsertQuery = @"
        INSERT INTO [CompanyPolicyHistory] 
            ([PolicyId], [Name], [DocumentCategoryId], [EffectiveDate], [Description],
            [VersionNo], [StatusId], [Accessibility], [CreatedBy], [CreatedOn],
            [IsDeleted], [FileName], [FileOriginalName], [ModifiedBy], [ModifiedOn])
        VALUES
            (@Id, @Name, @DocumentCategoryId, @EffectiveDate, @Description,
            @VersionNo, @StatusId, @Accessibility, @CreatedBy, @CreatedOn,
            @IsDeleted, @FileName, @FileOriginalName, @ModifiedBy, @ModifiedOn);";

            var sqlquery = @"UPDATE [CompanyPolicy] SET [Name]=@Name,[DocumentCategoryId]=@DocumentCategoryId, 
                    [EffectiveDate]=@EffectiveDate,[VersionNo]=@VersionNo,[StatusId]=@StatusId,[Accessibility]=@Accessibility,
                    [ModifiedBy]=@ModifiedBy,[ModifiedOn]=@ModifiedOn,[Description]=@Description ";

            if (!string.IsNullOrEmpty(entity.FileName) && !string.IsNullOrEmpty(entity.FileOriginalName))
            {
                sqlquery += ",[FileName]=@FileName,[FileOriginalName]=@FileOriginalName";
            }
            sqlquery += " WHERE ID=@ID";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        entity.EffectiveDate = DateTime.UtcNow;
                        entity.VersionNo += 1;

                        var companypolicyHistoryIns = await connection.ExecuteAsync(sqlInsertQuery, entity, transaction);
                        var companypolicyUpdate = await connection.ExecuteAsync(sqlquery, entity, transaction);

                        transaction.Commit();
                        return companypolicyUpdate + companypolicyHistoryIns;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return 0;
                    }
                }
            }
        }

        public async Task<CompanyPolicyResponseDto?> GetPolicyDetailByIdAsync(long id)
        {

            var sql = @"SELECT cp.Id,Name,[DocumentCategoryId],EffectiveDate,cdc.CategoryName as DocumentCategory ,VersionNo 
                        ,cp.ModifiedOn,cp.ModifiedBy,cp.CreatedOn,cp.CreatedBy
	                    ,cp.[StatusId],cp.[Accessibility]
						,cp.Description,cp.FileName, cp.FileOriginalName FROM CompanyPolicy cp
						Join dbo.CompanyPolicyDocCategory cdc on cdc.Id = cp.DocumentCategoryId 	                   
	                    WHERE cp.Id = @Id AND ISNULL(cp.IsDeleted,0) = 0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<CompanyPolicyResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<int> AddUserCompanyPolicyTrackAsync(UserCompanyPolicyTrackRequestDto request)
        {
            var sql = "INSERT INTO [dbo].[UserCompanyPolicyTrack]([EmployeeId],[CompanyPolicyId] ,[ViewedOn])VALUES(@EmployeeId,@CompanyPolicyId ,GETUTCDATE())";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, request);
                return result;
            }
        }

        public async Task<int> GetCompanyPolicyTrack(long policyId, long employeeId)
        {
            var sql = @"select Id from UserCompanyPolicyTrack where CompanyPolicyId = @pCompanyPolicyId and EmployeeId = @pEmployeeId Order by Id desc";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<int>(sql, new { pCompanyPolicyId = policyId, pEmployeeId = employeeId });
                return result;
            }
        }
        public async Task<int> UpdateUserCompanyPolicyTrackAsync(long id)
        {
            var sql = "update [dbo].[UserCompanyPolicyTrack] set [ModifiedOn] = GETUTCDATE() where CompanyPolicyId = @pCompanyPolicyId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<int>(sql, new { pCompanyPolicyId = id });
                return result;
            }
        }

        public async Task<UserCompanyPolicyTrackSearchResponseDto> GetUserCompanyPolicyTrackList(SearchRequestDto<UserCompanyPolicyTrackSearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();
            query.Append(@"SELECT COUNT(uc.id) AS TotalRecords 
                            FROM dbo.UserCompanyPolicyTrack UC WITH (NOLOCK)
                            INNER JOIN dbo.EmployeeData ed WITH (NOLOCK) ON uc.EmployeeId = ed.id
                            WHERE 1=1 ");

            if (requestDto != null && requestDto.Filters.CompanyPolicyId != 0)
            {
                query.Append(" and UC.CompanyPolicyId = @CompanyPolicyId");
            }
            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.EmployeeName))
            {
                query.Append(" and (ed.FirstName LIKE '%'+@EmployeeName+'%' OR ed.MiddleName LIKE '%'+@EmployeeName+'%' OR ed.LastName LIKE '%'+@EmployeeName+'%') ");
            }

            var sqlQuery = $@"EXEC [dbo].[GetUserCompanyPolicyTrackList] @CompanyPolicyId,@EmployeeName,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                UserCompanyPolicyTrackSearchResponseDto companyPolicySearchResponseDto = new UserCompanyPolicyTrackSearchResponseDto();

                connection.Open();
                companyPolicySearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { requestDto!.Filters.EmployeeName, requestDto!.Filters.CompanyPolicyId });
                companyPolicySearchResponseDto.CompanyPolicyTrackList = await connection.QueryAsync<UserCompanyPolicyTrackResponseDto>(sqlQuery, new { requestDto.Filters.EmployeeName, requestDto.Filters.CompanyPolicyId, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });

                return companyPolicySearchResponseDto;
            }
        }

        public async Task<int> DeleteAsync(CompanyPolicy companyPolicy)
        {
            var sql = "UPDATE [dbo].[CompanyPolicy] SET [ModifiedBy]=@ModifiedBy,[ModifiedOn] = GETUTCDATE(),IsDeleted=1  WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = companyPolicy.Id, @modifiedBy = companyPolicy.ModifiedBy });
                return result;
            }
        }

        public async Task<CompanyPolicyFileDto?> GetCompanyPolicyFileNameById(long id)
        {
            var sql = @"
        SELECT FileName, FileOriginalName 
        FROM CompanyPolicy 
        WHERE Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var result = await connection.QueryFirstOrDefaultAsync<CompanyPolicyFileDto>(sql, new { Id = id });

                return result;
            }
        }

    }
}


