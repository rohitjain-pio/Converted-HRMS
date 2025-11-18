using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Utility;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;
using static Dapper.SqlMapper;

namespace HRMS.Infrastructure.Repositories
{
    public class ProfessionalReferenceRepository : IProfessionalReferenceRepository
    {
        private readonly IConfiguration _configuration;

        public ProfessionalReferenceRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<int> AddProfessionalReferenceAsync(List<ProfessionalReference> professionalReference)
        {
            var sql = @"INSERT INTO [ProfessionalReference] ([PreviousEmployerId], [FullName], [Designation], [Email], [ContactNumber], [CreatedBy],
           [CreatedOn], [ModifiedBy], [ModifiedOn], [IsDeleted])
           VALUES
           (@PreviousEmployerId, @FullName, @Designation, @Email, @ContactNumber, @CreatedBy, GETUTCDATE(), @ModifiedBy, @ModifiedOn, 0);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, professionalReference);
                return result;
            }
        }

        public async Task<ProfessionalReference?> GetByIdAsync(long id)
        {
            var query = @"SELECT [Id]
                      ,[PreviousEmployerId]
                      ,[FullName]
                      ,[Designation]
                      ,[Email]
                      ,[ContactNumber]
                      ,[CreatedBy]
                      ,[CreatedOn]
                      ,[ModifiedBy]
                      ,[ModifiedOn] 
            FROM [ProfessionalReference] WHERE Id = @Id AND IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<ProfessionalReference>(query, new { Id = id });
            }
        }

        public async Task<int> UpdateAsync(ProfessionalReference professionalReference)
        {
            var sql = @" UPDATE [dbo].[ProfessionalReference]
                        SET [FullName] = @FullName,
                        [Designation] = @Designation,
                        [Email] = @Email,
                        [ContactNumber] = @ContactNumber, 
                        [ModifiedBy] = @ModifiedBy, 
                        [ModifiedOn] = GETUTCDATE() 
                        WHERE ID = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, professionalReference);
                return result;
            }
        }

        public async Task<int> DeleteAsync(ProfessionalReference professionalReference)
        {
            var sql = @"UPDATE [dbo].[ProfessionalReference]
                        SET IsDeleted = 1,
                        [ModifiedBy] = @ModifiedBy,
                        [ModifiedOn] = GETUTCDATE()
                        WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { professionalReference.Id, professionalReference.ModifiedBy });
                return result;
            }
        }

        public Task<IReadOnlyList<ProfessionalReference>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<int> AddAsync(ProfessionalReference entity)
        {
            throw new NotImplementedException();
        }

        public async Task<int> GetReferenceCountAsync(long previousEmployerId)
        {
            var sql = @"SELECT COUNT(1)
                        FROM ProfessionalReference
				        WHERE PreviousEmployerId=@PreviousEmployerId AND IsDeleted=0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.ExecuteScalarAsync<int>(sql, new { PreviousEmployerId = previousEmployerId });

            }
        }
    }
}