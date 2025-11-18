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
using System.Text;
using static Dapper.SqlMapper;

namespace HRMS.Infrastructure.Repositories
{
    public class CertificateRepository : ICertificateRepository
    {
        private readonly IConfiguration _configuration;

        public CertificateRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<UserCertificate?> GetByIdAsync(long id)
        {
            var sql = @"SELECT [Id],[EmployeeId],[CertificateName] FROM [UserCertificate] WITH (NOLOCK) WHERE IsDeleted = 0 and Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<UserCertificate?>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<int> ArchiveUnarchiveUserCertificate(EmployeeArchiveRequestDto archiveRequestDto)
        {
            var sql = "UPDATE [UserCertificate] SET IsDeleted = @IsArchived WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { archiveRequestDto.Id, archiveRequestDto.IsArchived });
                return result;
            }
        }

        public async Task<int> AddAsync(UserCertificate userCertificate)
        {
            var sql = "INSERT INTO [dbo].[UserCertificate] ([EmployeeId],[CertificateName],[CertificateExpiry],[CreatedBy],[CreatedOn],[IsDeleted],[FileName],[OriginalFileName])VALUES(@EmployeeId,@CertificateName,@CertificateExpiry,@CreatedBy,GETUTCDATE(),0,@FileName,@OriginalFileName)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userCertificate);
                return result;
            }
        }

        public async Task<UserCertificateSearchResponseDto?> GetEmployeeCertificates(SearchRequestDto<UserCertificateSearchRequestDto> userCertificateSearchList)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT COUNT(id)  AS TotalRecords FROM UserCertificate WITH (NOLOCK) WHERE ISNULL(IsDeleted,0) = 0 and EmployeeId = @pemployeeid");
            var sql = @"EXEC [GetEmployeeCertificatesList] @EmployeeId, @SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            UserCertificateSearchResponseDto userCertificateSearchResponseDto = new();
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                userCertificateSearchResponseDto.UserCertificateResponseList = await connection.QueryAsync<UserCertificateResponseDto>(sql, new { userCertificateSearchList.Filters.EmployeeId, userCertificateSearchList.SortColumnName, SortColumnDirection = userCertificateSearchList.SortDirection, userCertificateSearchList.StartIndex, userCertificateSearchList.PageSize });
                userCertificateSearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { pemployeeid = userCertificateSearchList.Filters.EmployeeId });
                return userCertificateSearchResponseDto;
            }
        }

        public async Task<UserCertificateResponseDto?> GetUserCertificateByIdAsync(long id)
        {
            var sql = @"SELECT uc.Id,
                            uc.EmployeeId,
                            uc.CertificateName,
                            uc.FileName,
                            uc.OriginalFileName,
                            uc.CertificateExpiry
				        FROM UserCertificate uc WITH (NOLOCK)
				        WHERE ISNULL(uc.IsDeleted,0) = 0 and Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<UserCertificateResponseDto?>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<int> UpdateAsync(UserCertificate userCertificate)
        {
            string sql = @"UPDATE [dbo].[UserCertificate] 
                            SET [CertificateName]=@CertificateName,
                                [CertificateExpiry] = @CertificateExpiry,
                                [ModifiedBy]=@ModifiedBy,
                                [ModifiedOn]=@ModifiedOn ";

            if (!string.IsNullOrWhiteSpace(userCertificate.FileName) && !string.IsNullOrWhiteSpace(userCertificate.OriginalFileName))
            {
                sql += ",[FileName]=@FileName ,[OriginalFileName]=@OriginalFileName";
            }
            sql += " WHERE Id=@Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userCertificate);
                return result;
            }
        }

        public async Task<bool> CertificateNameExistsAsync(UserCertificateRequestDto userCertificateRequestDto)
        {
            var query = "SELECT COUNT(1) FROM [dbo].[UserCertificate] WITH (NOLOCK) WHERE EmployeeId = @employeeId AND ISNULL(IsDeleted,0) = 0 AND CertificateName = @CertificateName and Id <> @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(query, userCertificateRequestDto);
                return count > 0;
            }
        }

        public Task<IReadOnlyList<UserCertificate>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<int> DeleteAsync(UserCertificate entity)
        {
            throw new NotImplementedException();
        }
    }
}