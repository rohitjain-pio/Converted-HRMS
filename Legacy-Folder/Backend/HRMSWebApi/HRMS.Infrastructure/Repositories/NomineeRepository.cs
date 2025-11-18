using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using HRMS.Domain.Utility;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class NomineeRepository:INomineeRepository
    {
        private readonly IConfiguration _configuration;
        public NomineeRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }
        public async Task<int> AddNominee(UserNomineeInfo userNominee)
        {
            var sql = @"INSERT INTO [dbo].[UserNomineeInfo]([NomineeName],[EmployeeId],[DOB],[Age],[IsNomineeMinor],[CareOf],[Relationship],[Percentage],[CreatedBy],[CreatedOn],[IsDeleted],[Others],[IdProofDocType],[FileName],[FileOriginalName])
                        VALUES(@NomineeName,@EmployeeId,@DOB,@Age,@IsNomineeMinor,@CareOf,@Relationship,@Percentage,@CreatedBy,GETUTCDATE(),0,@Others,@IdProofDocType,@FileName,@FileOriginalName)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userNominee);
                return result;
            }
        }

        public async Task<bool> ValidatePercentage(UserNomineeInfo userNominee)
        {
            var query = @"SELECT ISNULL(SUM(Percentage),0) FROM [dbo].[UserNomineeInfo] WHERE IsDeleted =0 AND EmployeeId = @EmployeeId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var percentage = await connection.ExecuteScalarAsync<int>(query, new { EmployeeId = userNominee.EmployeeId });
                return (userNominee.Percentage + percentage) <= 100;
            }
        }
        public async Task<bool> ValidateUpdatePercentage(UserNomineeInfo userNominee)
        {
            var query = @"SELECT ISNULL(SUM(Percentage),0) FROM [dbo].[UserNomineeInfo] WHERE IsDeleted =0 AND EmployeeId = @EmployeeId AND Id ! = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var percentage = await connection.ExecuteScalarAsync<int>(query, new { EmployeeId = userNominee.EmployeeId, Id = userNominee.Id });
                return (userNominee.Percentage + percentage) <= 100;
            }
        }
        public async Task<int> UpdateNominee(UserNomineeInfo userNominee)
        {
            var sql = @"UPDATE [dbo].[UserNomineeInfo] 
                        SET [NomineeName]=@NomineeName,
                            [EmployeeId]=@EmployeeId,
                            [DOB]=@DOB,
                            [Age]=@Age,
                            [IsNomineeMinor]=@IsNomineeMinor,[CareOf]=@CareOf,[Relationship]=@Relationship,[Percentage]=@Percentage,[ModifiedBy]=@ModifiedBy,[ModifiedOn]=GETUTCDATE(),[Others]=@Others,[IdProofDocType]=@IdProofDocType";
                      
            if (!string.IsNullOrWhiteSpace(userNominee.FileName) && !string.IsNullOrWhiteSpace(userNominee.FileOriginalName))
            {
                sql += ",[FileName]=@FileName ,[FileOriginalName]=@FileOriginalName";
            }
            sql += " WHERE ID=@Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userNominee);
                
                return result;
            }
        }
        public async Task<bool> ValidateNomineeIdAsync(long? nomineeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                string query = @"
                            SELECT COUNT(1)
                            FROM [dbo].[UserNomineeInfo]
                            WHERE Id=@nomineeId AND IsDeleted = 0";
                int invalidCount = await connection.ExecuteScalarAsync<int>(query, new { @nomineeId = nomineeId });
                return invalidCount > 0;
            }
        }
        public async Task<NomineeResponseDto?> GetNomineeById(long nomineeId)
        {
            var query = @"SELECT n.Id, 
                                 n.NomineeName,
                                 n.Relationship RelationshipId,
                                 n.DOB,
                                 n.Age,
                                 n.CareOf,
                                 n.Others, 
                                 n.Percentage,
                                 n.EmployeeId,
                                 r.Name RelationshipName,
                                 n.CreatedBy,
					             n.CreatedOn,
					             n.ModifiedBy,
					             n.ModifiedOn,
                                 n.FileName,
                                 n.FileOriginalName,
                                 n.IdProofDocType,
                                 d.Name As IdProofDocName
                                 FROM [dbo].[UserNomineeInfo] n
                                 INNER JOIN [dbo].[Relationship] r ON n.Relationship=r.Id and r.IsDeleted=0
                                 INNER JOIN [dbo].[DocumentType] d ON n.IdProofDocType =d.Id and d.IsDeleted=0
                                 WHERE n.Id=@id AND n.IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<NomineeResponseDto>(query, new { @id = nomineeId });
            }
        }
        public async Task<int> DeleteNominee(UserNomineeInfo nominee)
        {
            var sql = @"UPDATE [dbo].[UserNomineeInfo]
                        SET IsDeleted = 1,
                            [ModifiedBy]=@ModifiedBy,
                            [ModifiedOn]=GETUTCDATE()
                            WHERE Id = @id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = nominee.Id, @modifiedBy = nominee.ModifiedBy });
                return result;
            }
        }
        public async Task<NomineeSearchResponseDto> GetNomineeList(SearchRequestDto<NomineeSearchRequestDto> requestDto)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var query = @"SELECT COUNT(1) FROM [UserNomineeInfo]
                             WHERE EmployeeId= @EmployeeId AND (@NomineeName IS NULL OR NomineeName LIKE '%'+ @NomineeName +'%')     
                             AND IsDeleted=0 ";
                if (requestDto.Filters.RelationshipId == (int)Domain.Enums.Relationship.Others)
                {
                    query += " AND ( Others LIKE '%'+ @Others +'%')";
                }
                else if ((requestDto.Filters.RelationshipId < (int)Domain.Enums.Relationship.Others) && (requestDto.Filters.RelationshipId >= (int)Domain.Enums.Relationship.Father))
                {
                    query += " AND ( Relationship = @RelationshipId )";
                }
                var sqlQuery = $@"EXEC [dbo].[GetNomineeList] @EmployeeId, @NomineeName, @RelationshipId, @Others, @SortColumnName,@SortDirection,@PageNumber,@PageSize";

                var sqlQueryTotalPercentage = @"SELECT IsNull(SUM(Percentage),0) FROM [UserNomineeInfo]
                             WHERE EmployeeId= @EmployeeId AND IsDeleted=0 ";


                var nominee = requestDto.Filters;

                var totalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new
                {
                    nominee.EmployeeId,
                    nominee.NomineeName,
                    nominee.RelationshipId,
                    nominee.Others
                });

                var totalPercentage = await connection.QuerySingleOrDefaultAsync<int>(sqlQueryTotalPercentage.ToString(), new
                {
                    nominee.EmployeeId

                });

                var nomineeList = await connection.QueryAsync<NomineeResponseDto>(sqlQuery, new
                {
                    nominee.EmployeeId,
                    nominee.NomineeName,
                    nominee.RelationshipId,
                    nominee.Others,
                    requestDto.SortColumnName,
                    requestDto.SortDirection,
                    PageNumber = requestDto.StartIndex,
                    requestDto.PageSize
                });

                return new NomineeSearchResponseDto
                {
                    NomineeList = nomineeList,
                    TotalRecords = totalRecords,
                    TotalPercentage = totalPercentage

                };
            }
        }

    }
}
