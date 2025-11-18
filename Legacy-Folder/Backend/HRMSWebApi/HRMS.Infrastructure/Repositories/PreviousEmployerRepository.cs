using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Utility;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Data;
using Microsoft.Data.SqlClient;
using static Dapper.SqlMapper;

namespace HRMS.Infrastructure.Repositories
{
    public class PreviousEmployerRepository : IPreviousEmployerRepository
    {
        private readonly IConfiguration _configuration;

        public PreviousEmployerRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<int> AddAsync(PreviousEmployer previousEmployer)
        {
            var sql = @"INSERT INTO [PreviousEmployer]
            ([EmployeeId], [EmployerName], [Designation], [StartDate], [EndDate], [CreatedBy], [CreatedOn],[IsDeleted])
            VALUES
            (@EmployeeId, @EmployerName, @Designation, @StartDate, @EndDate, @CreatedBy, @CreatedOn, 0)
            SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.ExecuteScalarAsync<int>(sql, previousEmployer);
            }
        }

        public async Task<PreviousEmployerSearchResponseDto> GetPreviousEmployerList(SearchRequestDto<PreviousEmployerSearchRequestDto> requestDto)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var query = @"SELECT Count(DISTINCT pe.id)	
	                      FROM [PreviousEmployer] pe
	                      LEFT JOIN PreviousEmployerDocument ped ON pe.Id =ped.PreviousEmployerId
	                      LEFT JOIN EmployerDocumentType edt ON ped.EmployerDocumentTypeId = edt.Id
                          WHERE EmployeeId = @EmployeeId
	                      AND  (@EmployerName IS NULL OR pe.EmployerName LIKE '%'+ @EmployerName +'%')
	                      AND (@DocumentName IS NULL OR edt.DocumentName LIKE '%'+ @DocumentName +'%')
                          AND pe.IsDeleted = 0;";

                var sqlQuery = $@"EXEC [dbo].[GetPreviousEmployerList] @EmployerName, @DocumentName, @EmployeeId, @SortColumnName, @SortColumnDirection, @PageNumber, @PageSize";

                var employer = requestDto.Filters;
                var totalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new
                {
                    employer.EmployerName,
                    employer.DocumentName,
                    employer.EmployeeId
                });

                var result = await connection.QueryAsync(sqlQuery, new
                {
                    employer.EmployerName,
                    employer.DocumentName,
                    employer.EmployeeId,
                    requestDto.SortColumnName,
                    SortColumnDirection = requestDto.SortDirection,
                    PageNumber = requestDto.StartIndex,
                    requestDto.PageSize
                });

                PreviousEmployerSearchResponseDto response = new PreviousEmployerSearchResponseDto();
                response.TotalRecords = totalRecords;
                List<PreviousEmployerSearchDto> PreviousEmployerList = [];
                foreach (var data in result)
                {
                    var previousEmployerData = new PreviousEmployerSearchDto();
                    previousEmployerData.Id = data.ID;
                    previousEmployerData.EmployerName = data.EmployerName;
                    previousEmployerData.Designation = data.Designation;
                    previousEmployerData.StartDate = (data.StartDate == null) ? null : DateOnly.FromDateTime(data.StartDate);
                    previousEmployerData.EndDate = (data.EndDate == null) ? null : DateOnly.FromDateTime(data.EndDate);
                    var documentsJson = data.DocumentsJson;
                    if (documentsJson != null)
                    {
                        previousEmployerData.Documents = JsonConvert.DeserializeObject<List<PreviousEmployerSearchDocumentDto>>(documentsJson);
                    }
                    var professionalReferencesJson = data.ProfessionalReferencesJson;
                    if (professionalReferencesJson != null)
                    {
                        previousEmployerData.ProfessionalReferences = JsonConvert.DeserializeObject<List<ProfessionalReferenceSearchDto>>(professionalReferencesJson);
                    }
                    PreviousEmployerList.Add(previousEmployerData);
                }
                response.PreviousEmployerList = PreviousEmployerList;
                return response;
            }
        }

        public async Task<PreviousEmployer?> GetByIdAsync(long id)
        {
            var query = @"SELECT [Id]
                          ,[EmployeeId]
                          ,[EmployerName]
                          ,[StartDate]
                          ,[EndDate] 
                          ,[Designation]
                      FROM  [PreviousEmployer] WHERE Id = @Id AND IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<PreviousEmployer>(query, new { Id = id });
            }
        }

        public async Task<int> UpdateAsync(PreviousEmployer entity)
        {
            var sql = @"UPDATE [dbo].[PreviousEmployer]
                    SET [EmployeeId] = @EmployeeId
                      ,[EmployerName] = @EmployerName
                      ,[StartDate] = @StartDate
                      ,[EndDate] = @EndDate 
                      ,[ModifiedBy] = @ModifiedBy
                      ,[ModifiedOn] = @ModifiedOn 
                      ,[Designation] = @Designation
                     WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, entity);
                return result;
            }
        }

        public async Task<int> DeleteAsync(PreviousEmployer previousEmployer)
        {
            var sql = @"UPDATE [dbo].[PreviousEmployer]
                        SET IsDeleted = 1,
                        [ModifiedBy] = @ModifiedBy,
                        [ModifiedOn] = GETUTCDATE()
                        WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = previousEmployer.Id, ModifiedBy = previousEmployer.ModifiedBy });
                return result;
            }
        }

        public async Task<bool> GetPreviousEmployerDocument(long previousEmployerId, long employerDocumentTypeId)
        {
            var query = @"SELECT COUNT(1) FROM [dbo].[PreviousEmployerDocument] 
                        WHERE PreviousEmployerId = @PreviousEmployerId
                        AND EmployerDocumentTypeId = @EmployerDocumentTypeId AND IsDeleted = 0;";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(query, new { PreviousEmployerId = previousEmployerId, EmployerDocumentTypeId = employerDocumentTypeId });
                return count > 0;
            }
        }

        public async Task<int> UploadPreviousEmployerDocumentAsync(PreviousEmployerDocument PreviousEmployerDocument)
        {
            var sql = @"INSERT INTO [PreviousEmployerDocument] 
            ([PreviousEmployerId], [EmployerDocumentTypeId], [FileName], [FileOriginalName], 
            [CreatedBy], [CreatedOn], [IsDeleted])
            VALUES
            (@PreviousEmployerId, @EmployerDocumentTypeId, @FileName, @FileOriginalName, @CreatedBy, @CreatedOn, 0)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, PreviousEmployerDocument);
                return result;
            }
        }

        public Task<IReadOnlyList<PreviousEmployer>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<int> DeletePreviousEmployerDocumentAsync(PreviousEmployerDocument previousEmployerDocument)
        {
            var sql = @"UPDATE [dbo].[PreviousEmployerDocument]
                        SET IsDeleted = 1,
                        [ModifiedBy] = @ModifiedBy,
                        [ModifiedOn] = GETUTCDATE()
                        WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, previousEmployerDocument);
                return result;
            }
        }

        public async Task<PreviousEmployerDocument?> GetPreviousEmployerDocumentByIdAsync(long id)
        {
            var query = @"SELECT [Id]
                          ,[PreviousEmployerId]
                          ,[EmployerDocumentTypeId]
                          ,[FileName]
                          ,[FileOriginalName]
                      FROM  [PreviousEmployerDocument] WHERE Id = @Id AND IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<PreviousEmployerDocument>(query, new { Id = id });
            }
        }
    }
}