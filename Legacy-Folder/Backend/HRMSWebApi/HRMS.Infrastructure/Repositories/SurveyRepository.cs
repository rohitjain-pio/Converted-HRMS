using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Models.Models.Survey;
using static Dapper.SqlMapper;
using HRMS.Models;
using System.Text;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class SurveyRepository : ISurveyRepository
    {
        private readonly IConfiguration _configuration;
        public SurveyRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<int> AddAsync(Survey entity)
        {
            var sql = "INSERT INTO [dbo].[Surveys]([Title] ,[Description] ,[FormIoReferenceId] ,[StatusId] ,[DeadLine] ,[SurveyJson],[CreatedBy] ,[CreatedOn] ,[IsDeleted])VALUES(@Title,@Description,@FormIoReferenceId,@StatusId,@DeadLine,@SurveyJson,@CreatedBy,@CreatedOn,0)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, entity);
                return result;
            }
        }

        public async Task<SurveyResponseDto?> GetSurveyDetailsByIdAsync(long id)
        {
            var sql = @"SELECT S.Id,   
                               S.Title,
                               S.Description,
                               S.FormIoReferenceId,                               
                               T.StatusValue AS Status,
                               S.DeadLine,  
                               S.SurveyJson,     
                               S.PublishDate
                        FROM dbo.Surveys S                        
                        INNER JOIN [dbo].[Status] T ON S.StatusId = T.Id
                        Where S.Id = @Id and S.IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<SurveyResponseDto>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<int> DeleteAsync(Survey entity)
        {
            var sql = "UPDATE [dbo].[Surveys] SET [ModifiedBy]=@ModifiedBy,[ModifiedOn] = GETUTCDATE(),IsDeleted=1  WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = entity.Id, @modifiedBy = entity.ModifiedBy });
                return result;
            }
        }
        public async Task<int> PublishSurvey(PublishSurveyRequestDto entity)
        {
            var sql = "UPDATE [dbo].[Surveys] SET [StatusId]= @statusId,[PublishDate] = GETUTCDATE() WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = entity.Id ,statusId=entity.StatusId});
                return result;
            }
        }

        public  Task<IReadOnlyList<Survey>> GetAllAsync()
        {
            throw new NotImplementedException();
        }
        public async Task<IEnumerable<SurveyStatus>> GetSurveyStatus()
        {
            var query = @"SELECT Id,
                                 StatusValue
                                 FROM [dbo].[Status] Where
                                 IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<SurveyStatus>(query);
            }
        }

        public async Task<Survey?> GetByIdAsync(long id)
        {
            var query = @"SELECT Id,
                                 Title,
                                 Description,
                                 FormIoReferenceId,
                                 StatusId,
                                 PublishDate,
                                 DeadLine,
                                 ResponsesCount,
                                 CreatedBy,
					             CreatedOn,
					             ModifiedBy,
					             ModifiedOn,
                                 SurveyJson
                                 FROM [dbo].[Surveys] Where
                                 Id = @Id and
                                 IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<Survey>(query, new { id });
            }
        }   

        public async Task<int> UpdateAsync(Survey entity)
        {
            var sql = @"UPDATE [dbo].[Surveys] 
                        SET [Title] = @Title,
                            [Description] = @Description,
                            [FormIoReferenceId] = @FormIoReferenceId,
                            [StatusId] = @StatusId,
                            [DeadLine] = @DeadLine,
                            [SurveyJson] = @SurveyJson,
                            [ModifiedBy] = @ModifiedBy,
                            [ModifiedOn] = @ModifiedOn
                        WHERE Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, entity);
                return result;
            }
        }

        public async Task<int> AddSurveyAnswer(SurveyResponse surveyResponse,Survey survey)
        {
            var sql = "INSERT INTO [dbo].[SurveyResponse]([EmployeeId] ,[SurveyId] ,[SurveyJsonResponse] ,[CreatedBy] ,[CreatedOn])VALUES(@EmployeeId,@SurveyId,@SurveyJsonResponse,@CreatedBy,@CreatedOn)";

            var sqlquery = @"UPDATE [Surveys] SET [ResponsesCount]=@ResponsesCount,[ModifiedBy]=@ModifiedBy,[ModifiedOn]=@ModifiedOn where Id = @Id";
            

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {                        
                        await connection.ExecuteAsync(sql, surveyResponse, transaction);
                        var surveysUpdate = await connection.ExecuteAsync(sqlquery, survey, transaction);
                        transaction.Commit();
                        return surveysUpdate;
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        
                    }

                }
                return 0;
            }

        }

        public async Task<SurveyResponse?> GetSurveyResponseByEmpIdAsync(long id, long surveyId)
        {
            var query = @"SELECT Id,
                                 EmployeeId,
                                 SurveyId,
                                 SurveyJsonResponse,
                                 CreatedBy,
					             CreatedOn,
					             ModifiedBy,
					             ModifiedOn                               
                                 FROM [dbo].[SurveyResponse] Where
                                 EmployeeId = @Id and
                                 SurveyId = @SurveyId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<SurveyResponse>(query, new { id , surveyId});
            }
        }
        public async Task<SurveySearchResponseDto> GetSurveyListAsync(SearchRequestDto<SurveySearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();
            query.Append(" SELECT Count(sm.SurveyId) As TotalRecords FROM SurveyEmpGroupMapping sm INNER JOIN [dbo].[Surveys] s ON s.Id= sm.SurveyId INNER JOIN [dbo].[Group] eg ON eg.Id= sm.EmpGroupId INNER JOIN [dbo].[Status] st ON st.Id= s.StatusId WHERE s.IsDeleted =0 ");

            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.Title))
            {
                query.Append(" and Title like '%'+@title+'%'");
            }
            if (requestDto != null && requestDto.Filters.StatusId != 0)
            {
                query.Append(" and StatusId = @statusId");
            }
            if (requestDto != null && requestDto.Filters.EmpGroupId != 0)
            {
                query.Append(" and EmpGroupId = @empGroupId");
            }
            var sqlQuery = $@"EXEC [dbo].[GetSurveyList] @Title,@StatusId,@EmpGroupId,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                SurveySearchResponseDto SurveySearchResponseDto = new SurveySearchResponseDto();

                connection.Open();
                SurveySearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new {title= requestDto!.Filters.Title ,statusId = requestDto!.Filters.StatusId, empGroupId = requestDto!.Filters.EmpGroupId });
                SurveySearchResponseDto.SurveyResponseList = await connection.QueryAsync<SurveyResponseListDto>(sqlQuery, new { requestDto.Filters.Title, requestDto.Filters.StatusId, requestDto.Filters.EmpGroupId, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });
           
                return SurveySearchResponseDto;
            }
        }

    }
}
