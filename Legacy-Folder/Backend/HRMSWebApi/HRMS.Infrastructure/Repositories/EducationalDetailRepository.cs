using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Utility;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Reflection.PortableExecutable;
using System.Text;
using static Dapper.SqlMapper;

namespace HRMS.Infrastructure.Repositories
{
    public class EducationalDetailRepository : IEducationalDetailRepository
    {

        private readonly IConfiguration _configuration;

        public EducationalDetailRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<int> AddAsync(UserQualificationInfo userQualification)
        {
            var sql = "INSERT INTO [dbo].[UserQualificationInfo] ([EmployeeId],[QualificationId],[CollegeUniversity],[AggregatePercentage],[CreatedBy],[CreatedOn],[IsDeleted],[DegreeName],[FileName],[FileOriginalName],[StartYear],[EndYear])VALUES(@EmployeeId,@QualificationId,@CollegeUniversity,@AggregatePercentage,@CreatedBy,GETUTCDATE(),0,@DegreeName,@FileName,@FileOriginalName,@StartYear,@EndYear)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userQualification);
                return result;
            }
        }

        public async Task<int> UpdateAsync(UserQualificationInfo userQualification)
        {
            var sql = "UPDATE [dbo].[UserQualificationInfo] SET [EmployeeId]=@EmployeeId,[QualificationId]=@QualificationId,[AggregatePercentage]=@AggregatePercentage,[CollegeUniversity]=@CollegeUniversity,[IsDeleted]=@IsDeleted,[ModifiedBy]=@ModifiedBy,[ModifiedOn]=@ModifiedOn,[DegreeName]=@DegreeName,[StartYear]=@StartYear,[EndYear]=@EndYear";

            if (!string.IsNullOrWhiteSpace(userQualification.FileName) && !string.IsNullOrWhiteSpace(userQualification.FileOriginalName))
            {
                sql += ",[FileName]=@FileName,[FileOriginalName]=@FileOriginalName";
            }
            sql += " WHERE Id=@Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userQualification);
                return result;
            }
        }

        public async Task<EduDocResponseDto?> GetEducationalDetailsById(long Id)
        {
            var sql = @"SELECT uq.Id,
                                uq.CollegeUniversity,
                                uq.AggregatePercentage, 
                                uq.EndYear, 
                                uq.StartYear, 
                                uq.FileName, 
                                uq.FileOriginalName,
                                uq.QualificationId, 
                                q.ShortName as QualificationName, 
                                uq.DegreeName
                        FROM UserQualificationInfo uq WITH (NOLOCK)
                        INNER JOIN Qualification q WITH (NOLOCK) on uq.QualificationId = q.Id
                        WHERE ISNULL(uq.IsDeleted,0) = 0 
                        AND uq.Id= @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<EduDocResponseDto?>(sql, new { Id = Id });
                return result;
            }
        }

        public async Task<int> DeleteEducationalDetails(long id)
        {
            var sql = "UPDATE [dbo].[UserQualificationInfo] SET IsDeleted=1  WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = id });
                return result;
            }
        }

        public async Task<EduDocSearchResponseDto> GetEducationalDocuments(SearchRequestDto<EduDocSearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT COUNT(id)  AS TotalRecords FROM UserQualificationInfo WHERE ISNULL(IsDeleted,0) = 0 and EmployeeId = @pemployeeid");
            var sqlQuery = $@"EXEC [dbo].[GetEducationDocuments] @EmployeeId,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                EduDocSearchResponseDto eduDocSearchResponseDto = new();

                connection.Open();
                eduDocSearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { pemployeeid = requestDto.Filters.EmployeeId });
                eduDocSearchResponseDto.EduDocResponseList = await connection.QueryAsync<EduDocResponseDto>(sqlQuery, new { requestDto.Filters.EmployeeId, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });

                return eduDocSearchResponseDto;

            }
        }

        public async Task<bool> CheckEmployeeQualificationExist(long employeeId, long qualificationId, long? id)
        {
            string query = "";
            if (id == null || id == 0)
            {
                query = @"SELECT Id FROM [dbo].[UserQualificationInfo] WHERE IsDeleted = 0 
                            AND EmployeeId = @EmployeeId 
                            AND QualificationId = @QualificationId";
            }
            else
            {
                query = @"SELECT Id FROM [dbo].[UserQualificationInfo] WHERE IsDeleted = 0 
                            AND EmployeeId = @EmployeeId 
                            AND QualificationId = @QualificationId
                            AND Id <> @Id";
            }
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync<int>(query, new { EmployeeId = employeeId, QualificationId = qualificationId, Id = id });
                return result > 0;
            }
        }

        public Task<UserQualificationInfo?> GetByIdAsync(long id)
        {
            throw new NotImplementedException();
        }

        public Task<IReadOnlyList<UserQualificationInfo>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<int> DeleteAsync(UserQualificationInfo entity)
        {
            throw new NotImplementedException();
        }
    }
}