using Dapper;
using HRMS.Domain;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.OfficialDetails;
using HRMS.Models.Models.UserProfile;
using Microsoft.Extensions.Configuration;
using OfficeOpenXml;
using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using System.Net;
using System.Reflection.PortableExecutable;
using System.Text;
using static Dapper.SqlMapper;
using ConnectionStrings = HRMS.Domain.Contants.ConnectionStrings;

namespace HRMS.Infrastructure.Repositories
{
    public class UserProfileRepository : IUserProfileRepository
    {
        private readonly IConfiguration _configuration;
        public UserProfileRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<PersonalDetailsResponseDto?> GetPersonalDetailByIdAsync(long id)
        {
            var sql = $@"SELECT 
                        ED.[Id], 
                        ED.[FirstName], 
                        ED.[MiddleName], 
                        ED.[LastName], 
                        ED.[FatherName], 
                        ED.[FileName], 
                        ED.[FileOriginalName], 
                        ED.[BloodGroup], 
                        ED.[Gender], 
                        ED.[DOB], 
                        ED.[Phone], 
                        ED.[AlternatePhone], 
                        ED.[EmergencyContactPerson], 
                        ED.[EmergencyContactNo], 
                        ED.[PersonalEmail], 
                        ED.[Nationality], 
                        ED.[MaritalStatus], 
                        ED.[Interest],
                         E.[Email],

                        (
                            SELECT 
                                Ad.Id, 
                                S.StateName, 
                                C.CountryName, 
                                cy.CityName,
                                ISNULL(Ad.CountryId, 0) AS CountryId, 
                                ISNULL(Ad.StateId, 0) AS StateId, 
                                ISNULL(Ad.CityId, 0) AS CityId,
                                Ad.Line1, 
                                Ad.Line2, 
                                ISNULL(Ad.AddressType, 0) AS AddressType,
                                Ad.Pincode
                               
                            FROM 
                                [Address] AS Ad 
                                LEFT JOIN Country AS C ON C.Id = Ad.CountryId 
                                LEFT JOIN State AS S ON S.Id = Ad.StateId 
                                LEFT JOIN City AS cy ON cy.Id = Ad.CityId
                            WHERE 
                                Ad.EmployeeId = ED.Id 
                            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                        ) AS [AddressJson], 
                        (
                            SELECT 
                                Ad.Id, 
                                S.StateName, 
                                C.CountryName, 
                                cy.CityName,
                                ISNULL(Ad.CountryId, 0) AS CountryId, 
                                ISNULL(Ad.StateId, 0) AS StateId, 
                                ISNULL(Ad.CityId, 0) AS CityId,
                                Ad.Line1, 
                                Ad.Line2, 
                                ISNULL(Ad.AddressType, 0) AS AddressType,
                                Ad.Pincode
                            FROM 
                                [PermanentAddress] AS Ad 
                                LEFT JOIN Country AS C ON C.Id = Ad.CountryId 
                                LEFT JOIN State AS S ON S.Id = Ad.StateId 
                                LEFT JOIN City AS cy ON cy.Id = Ad.CityId
                               
                            WHERE 
                                Ad.EmployeeId = ED.Id 
                            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                        ) AS [PermanentAddressJson]

                    FROM 
                        [EmployeeData] AS ED 
                        INNER JOIN EmploymentDetail AS E ON E.EmployeeId = ED.Id
                    WHERE 
                        ED.Id = @Id 
                        AND ED.IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<PersonalDetailsResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<Gender?> GetUserGender(long id)
        {
            var sql = $@"SELECT [Gender]  
                        FROM  [EmployeeData]
                        WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Gender?>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<DateTime?> GetUserJoiningDate(long id)
        {
            var sql = $@"SELECT [JoiningDate]  
                        FROM  [EmploymentDetail]
                        WHERE EmployeeId = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<DateTime?>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<PersonalProfileDetailsResponseDto?> GetPersonalProfileByIdAsync(long id)
        {
            var sql = $@"SELECT   ED.[Id], ED.[FirstName], ED.[LastName], ED.[FileName]  
                        FROM  [EmployeeData] AS ED 
                        INNER JOIN EmploymentDetail AS E ON E.EmployeeId = ED.Id
                        WHERE 
                        ED.Id = @Id 
                        AND ED.IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<PersonalProfileDetailsResponseDto>(sql, new { Id = id });
                return result;
            }
        }

        public Task<int> AddAsync(EmployeeData entity)
        {
            throw new NotImplementedException();
        }
        public Task<IReadOnlyList<EmployeeData>> GetAllAsync()
        {
            throw new NotImplementedException();
        }


        public Task<int> UpdateAsync(EmployeeData entity)
        {
            throw new NotImplementedException();
        }

        public Task<EmployeeData?> GetByIdAsync(long id)
        {
            throw new NotImplementedException();
        }
        public async Task<IEnumerable<Country?>> GetCountryListAsync()
        {

            var sql = "SELECT Id,CountryName FROM Country WHERE  IsActive = 1 and IsDeleted = 0 AND Id in(101,231)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<Country?>(sql);

                return result;
            }
        }

        public async Task<IEnumerable<State?>> GetStateListByCountryIdAsync(long id)
        {
            var sql = "SELECT Id,StateName FROM State WHERE  IsActive = 1 and IsDeleted = 0 and CountryId = @Countryid";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<State?>(sql, new { Countryid = id });
                return result;
            }
        }

        public async Task<IEnumerable<DocumentType>> GetDocumentType(int idProofFor)
        {
            var sql = "select Id, Name, IsExpiryDateRequired from DocumentType where IsDeleted = 0 AND IdProofFor IN (@IdProofFor, @Both)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<DocumentType>(sql, new { IdProofFor = idProofFor, Both = IdProofFor.Both });
                return result.ToList();
            }
        }

        public async Task<int> AddPersonalDetail(EmployeeData employeeData, Address address, PermanentAddress permanentAddress)
        {
            employeeData.CreatedOn = DateTime.UtcNow;

            var sql = @"INSERT INTO [dbo].[EmployeeData] ([FirstName]  ,[MiddleName] ,[LastName] ,[FatherName] ,[BloodGroup]  ,[Gender]
                ,[DOB] ,[Phone] ,[AlternatePhone] ,[PersonalEmail] ,[Nationality] ,[Interest] ,[MaritalStatus] ,[EmergencyContactPerson]
                ,[EmergencyContactNo] ,[CreatedBy] ,[CreatedOn] ,[IsDeleted])
                VALUES
                (@FirstName  ,@MiddleName  ,@LastName ,@FatherName ,@BloodGroup ,@Gender ,@DOB  ,@Phone ,@AlternatePhone
                ,@PersonalEmail ,@Nationality ,@Interest ,@MaritalStatus ,@EmergencyContactPerson ,@EmergencyContactNo ,@CreatedBy ,@CreatedOn
                ,0);
                SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";

            var addressSql = @"INSERT INTO [dbo].[Address]
                       ([EmployeeId] ,[Line1] ,[Line2] ,[CityId] ,[CountryId] ,[StateId] ,[AddressType] ,[CreatedBy] ,[CreatedOn] ,[Pincode])
                       VALUES
                       (@EmployeeId,@Line1 ,@Line2 ,@CityId ,@CountryId ,@StateId ,@AddressType ,@CreatedBy ,@CreatedOn ,@Pincode);";

            var permanentAddressSql = @"INSERT INTO [dbo].[PermanentAddress]
                                ([EmployeeId] ,[Line1] ,[Line2] ,[CityId] ,[CountryId] ,[StateId] ,[AddressType] ,[CreatedBy] ,[CreatedOn] ,[Pincode])
                                VALUES
                                (@EmployeeId,@Line1 ,@Line2 ,@CityId ,@CountryId ,@StateId ,@AddressType ,@CreatedBy ,@CreatedOn ,@Pincode);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var employeeId = await connection.ExecuteScalarAsync<long>(sql, employeeData, transaction);

                        address.EmployeeId = employeeId;
                        permanentAddress.EmployeeId = employeeId;

                        var addressResult = await connection.ExecuteAsync(addressSql, address, transaction);
                        var permanentAddressResult = await connection.ExecuteAsync(permanentAddressSql, permanentAddress, transaction);

                        transaction.Commit();
                        return addressResult + permanentAddressResult; // Sum of affected rows from both inserts
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }


        public async Task<IEnumerable<City?>> GetCityListByStateIdAsync(long Stateid)
        {
            var sql = "SELECT Id,CityName FROM City WHERE  IsActive = 1 and IsDeleted = 0 and StateId = @Stateid";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<City?>(sql, new { Stateid = Stateid });
                return result;
            }
        }

        public async Task<IEnumerable<UserDocumentResponseDto?>> GetUserDocumentListAsync(long employeeId)
        {
            var sql = @"SELECT ud.Id,EmployeeId,DocumentName,DocumentTypeId,dt.Name AS DocumentType, DocumentNumber,DocumentExpiry,Location FROM UserDocument ud 
                        INNER JOIN DocumentType dt ON dt.Id= ud.DocumentTypeId
                        WHERE EmployeeId = @EmployeeId AND ud.IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<UserDocumentResponseDto?>(sql, new { EmployeeId = employeeId });
                return result;
            }
        }
        public async Task<UserDocumentResponseDto?> GetUserDocumentById(long Id)
        {
            var sql = @"SELECT ud.Id,EmployeeId,
                            DocumentName,
                            DocumentTypeId,
                            dt.Name AS DocumentType,
                            DocumentNumber,
                            DocumentExpiry,
                            Location 
                        FROM UserDocument ud WITH (NOLOCK)
                        INNER JOIN DocumentType dt WITH (NOLOCK) ON dt.Id= ud.DocumentTypeId
                        WHERE ud.Id = @Id AND ud.IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<UserDocumentResponseDto?>(sql, new { Id });
                return result;
            }
        }

        public async Task<int> UploadUserDocument(UserDocument userDocument)
        {
            userDocument.CreatedOn = DateTime.UtcNow;
            var sql = "INSERT INTO [dbo].[UserDocument]([EmployeeId],[DocumentName],[DocumentTypeId],[DocumentNumber],[DocumentExpiry],[Location],[CreatedBy],[CreatedOn],[IsDeleted])VALUES(@EmployeeId,@DocumentName,@DocumentTypeId,@DocumentNumber,@DocumentExpiry,@Location,@CreatedBy,GETUTCDATE(),0)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userDocument);
                return result;
            }
        }

        public async Task<int> UpdateUserDocument(UserDocument userDocument)
        {
            string sql = @"UPDATE [dbo].[UserDocument] 
                            SET [DocumentTypeId]=@DocumentTypeId,
                                [DocumentNumber]=@DocumentNumber,
                                [DocumentExpiry] = @DocumentExpiry,
                                [ModifiedBy]=@ModifiedBy,[ModifiedOn]=@ModifiedOn ";

            if (!string.IsNullOrWhiteSpace(userDocument.Location))
            {
                sql += ",[DocumentName]=@DocumentName ,[Location]=@Location";
            }
            sql += " WHERE ID=@Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, userDocument);
                return result;
            }
        }
        public async Task<bool> ValidateEmployeeIdAsync(long employeeId)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                string query = @"
                            SELECT COUNT(1)
                            FROM [dbo].[EmployeeData]
                            WHERE Id = @Id AND IsDeleted = 0";
                int invalidCount = await connection.ExecuteScalarAsync<int>(query, new { @Id = employeeId });
                return invalidCount > 0;
            }
        }

        public async Task<IEnumerable<Qualification?>> GetQualificationListAsync()
        {
            var sql = "SELECT Id,ShortName FROM [dbo].[Qualification] WHERE IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<Qualification>(sql);
                return result;
            }
        }

        public async Task<IEnumerable<Domain.Entities.Relationship>> GetRelationships()
        {
            var sql = "select Id,Name from Relationship where IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<Domain.Entities.Relationship>(sql);
                return result.ToList();
            }
        }

        public async Task<IEnumerable<PreviousEmployer?>> GetEmployerDetailIdAsync(long id)
        {
            var sql = @"SELECT [EmployeeId] ,[EmployerName] ,[StartDate] ,[EndDate] FROM [PreviousEmployer] WHERE IsDeleted = 0 and Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<PreviousEmployer?>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<int> UpdatePersonalDetail(EmployeeData employeeData, Address addressList, PermanentAddress permanentAddress)
        {
            employeeData.CreatedOn = DateTime.UtcNow;

            var sql = @"UPDATE [dbo].[EmployeeData] SET [FirstName]=@FirstName  ,[MiddleName]=@MiddleName ,[LastName]=@LastName ,[FatherName]=@FatherName ,[BloodGroup] =@BloodGroup ,[Gender]=@Gender
                        ,[DOB]=@DOB ,[Phone]=@Phone ,[AlternatePhone]=@AlternatePhone ,[PersonalEmail]=@PersonalEmail ,[Nationality]=@Nationality  ,[Interest]=@Interest ,[MaritalStatus]=@MaritalStatus,[EmergencyContactPerson]=@EmergencyContactPerson
                        ,[EmergencyContactNo]=@EmergencyContactNo ,[ModifiedBy]=@ModifiedBy ,[ModifiedOn]=GETUTCDATE()
                         WHERE ID =@ID";


            Address? currentAdd = GetCurrentAddressByEmployeeId(employeeData.Id);
            PermanentAddress? permanentAdd = PermanentAddressByEmployeeId(employeeData.Id);

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var result = await connection.ExecuteAsync(sql, employeeData, transaction);

                        string AddresSql = string.Empty;
                        if (currentAdd != null)
                        {
                            AddresSql = @"UPDATE [dbo].[Address] 
                                                SET [Line1]=@Line1, [Line2]=@Line2, [CityId]=@CityId, [CountryId]=@CountryId, [StateId]=@StateId, [AddressType]=@AddressType, [ModifiedBy]=@ModifiedBy, [ModifiedOn]=GETUTCDATE(), [Pincode]=@Pincode
		                                        WHERE EmployeeId =@EmployeeId";
                        }
                        else
                        {
                            AddresSql = @"INSERT INTO [dbo].[Address]
                                               ([EmployeeId] ,[Line1] ,[Line2] ,[AddressType] ,[CreatedBy] ,[CreatedOn] ,[Pincode] ,[CityId] ,[CountryId] ,[StateId])
                                                 VALUES
                                               (@EmployeeId ,@Line1 ,@Line2 ,2 ,@CreatedBy ,GETUTCDATE() ,@Pincode ,@CityId ,@CountryId ,@StateId)";

                        }

                        await connection.ExecuteAsync(AddresSql, addressList, transaction);
                        string PermanentAddresSql = string.Empty;
                        if (permanentAdd != null)
                        {
                            PermanentAddresSql = @"UPDATE [dbo].[PermanentAddress] 
                                                SET [Line1]=@Line1, [Line2]=@Line2, [CityId]=@CityId, [CountryId]=@CountryId, [StateId]=@StateId, [AddressType]=@AddressType, [ModifiedBy]=@ModifiedBy, [ModifiedOn]=GETUTCDATE(), [Pincode]=@Pincode
		                                        WHERE EmployeeId =@EmployeeId";
                        }
                        else
                        {
                            PermanentAddresSql = @"INSERT INTO [dbo].[PermanentAddress]
                                                      ([EmployeeId] ,[Line1] ,[Line2] ,[AddressType] ,[CreatedBy] ,[CreatedOn] ,[Pincode] ,[CityId] ,[CountryId] ,[StateId])
                                                       VALUES
                                                      (@EmployeeId ,@Line1 ,@Line2 ,1 ,@CreatedBy ,GETUTCDATE() ,@Pincode ,@CityId ,@CountryId ,@StateId)";
                        }
                        await connection.ExecuteAsync(PermanentAddresSql, permanentAddress, transaction);


                        transaction.Commit();
                        return result;
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }
            return 0;
        }

        public async Task<bool> PersonalEmailExistsAsync(string email)
        {
            var query = "SELECT COUNT(1) FROM [dbo].[EmployeeData] WHERE PersonalEmail = @email";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(query, new { email = email });
                return count > 0;
            }
        }

        public async Task<int> UpdateUserProfileImage(long userId, string fileName, string originalFileName, string modifiedBy)
        {
            int response = 0;
            var sqlUpdate = "Update [EmployeeData] SET FileName = @FileName, FileOriginalName = @FileOriginalName,ModifiedOn = GETUTCDATE(), ModifiedBy = @ModifiedBy WHERE Id=@UserId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                response = await connection.ExecuteAsync(sqlUpdate, new { FileName = fileName, FileOriginalName = originalFileName, ModifiedBy = modifiedBy, UserId = userId });
            }
            return response;
        }

        public async Task<EmployeeSearchResponseDto> GetEmployerList(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            try
            {
                var parameters = new DynamicParameters();


                parameters.Add("@EmployeeName", employeeSearchRequestDto.Filters.EmployeeName);
                parameters.Add("@DepartmentId", employeeSearchRequestDto.Filters.DepartmentId);
                parameters.Add("@DesignationId", employeeSearchRequestDto.Filters.DesignationId);
                parameters.Add("@RoleId", employeeSearchRequestDto.Filters.RoleId);
                parameters.Add("@Status", employeeSearchRequestDto.Filters.EmployeeStatus);
                parameters.Add("@EmployeeCode", employeeSearchRequestDto.Filters.EmployeeCode);
                parameters.Add("@EmploymentStatus", employeeSearchRequestDto.Filters.EmploymentStatus);
                parameters.Add("@SortColumnName", employeeSearchRequestDto.SortColumnName);
                parameters.Add("@SortColumnDirection", employeeSearchRequestDto.SortDirection);
                parameters.Add("@PageNumber", employeeSearchRequestDto.StartIndex);
                parameters.Add("@PageSize", employeeSearchRequestDto.PageSize);
                parameters.Add("@EmployeeEmail", employeeSearchRequestDto.Filters.EmployeeEmail);
                parameters.Add("@BranchId", employeeSearchRequestDto.Filters.BranchId);
                parameters.Add("@CountryId", employeeSearchRequestDto.Filters.CountryId);
                parameters.Add("@DOJRangeFrom", employeeSearchRequestDto.Filters.DOJFrom);
                parameters.Add("@DOJRangeTo", employeeSearchRequestDto.Filters.DOJTo);

                // Output parameter
                parameters.Add("@TotalRecords", dbType: DbType.Int32, direction: ParameterDirection.Output);

                // Execute the stored procedure
                var employeesList = await connection.QueryAsync<EmployeeResponseDto>(
                    "[dbo].[GetEmployees]",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return new EmployeeSearchResponseDto
                {
                    TotalRecords = parameters.Get<int>("@TotalRecords"),
                    EmployeeList = employeesList.ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing query: {ex.Message}");
                throw;
            }
        }
        public async Task<EmployeeListSearchResponseDto> GetEmployeesList(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                try
                {
                    var parameters = new DynamicParameters();


                    parameters.Add("@EmployeeName", employeeSearchRequestDto.Filters.EmployeeName);
                    parameters.Add("@DepartmentId", employeeSearchRequestDto.Filters.DepartmentId);
                    parameters.Add("@DesignationId", employeeSearchRequestDto.Filters.DesignationId);
                    parameters.Add("@RoleId", employeeSearchRequestDto.Filters.RoleId);
                    parameters.Add("@EmployeeStatus", employeeSearchRequestDto.Filters.EmployeeStatus);
                    parameters.Add("@EmployeeCode", employeeSearchRequestDto.Filters.EmployeeCode);
                    parameters.Add("@EmploymentStatus", employeeSearchRequestDto.Filters.EmploymentStatus);
                    parameters.Add("@SortColumnName", employeeSearchRequestDto.SortColumnName);
                    parameters.Add("@SortColumnDirection", employeeSearchRequestDto.SortDirection);
                    parameters.Add("@PageNumber", employeeSearchRequestDto.StartIndex);
                    parameters.Add("@PageSize", employeeSearchRequestDto.PageSize);
                    parameters.Add("@EmployeeEmail", employeeSearchRequestDto.Filters.EmployeeEmail);
                    parameters.Add("@BranchId", employeeSearchRequestDto.Filters.BranchId);
                    parameters.Add("@CountryId", employeeSearchRequestDto.Filters.CountryId);
                    parameters.Add("@DOJRangeFrom", employeeSearchRequestDto.Filters.DOJFrom);
                    parameters.Add("@DOJRangeTo", employeeSearchRequestDto.Filters.DOJTo);

                   
                    // Execute the stored procedure
                    var employeesList = await connection.QueryMultipleAsync(
                       "[dbo].[GetEmployeesList]",
                       parameters,
                       commandType: CommandType.StoredProcedure
                   );

                    var res = new EmployeeListSearchResponseDto();
                    res.TotalRecords = await employeesList.ReadSingleOrDefaultAsync<int>();
                    res.EmployeeList = (await employeesList.ReadAsync<EmployeeListResponseDto>()).ToList();
                    return res;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error executing query: {ex.Message}");
                    throw;
                }
            }
        }

        public async Task<IEnumerable<ReportingManagerResponseDto?>> GetReportingManagerListAsync(string name, int? RoleId)
        {

            var sql = @"Select E.Id, FirstName, MiddleName ,LastName, 
                        Email from EmployeeData as E 
                        INNER JOIN EmploymentDetail  as ED ON E.Id = ED.EmployeeId 
                        INNER JOIN UserRoleMapping as U ON U.EmployeeId = E.Id
                        Where (E.FirstName Like '%'+@Name+'%' OR E.MiddleName Like '%'+@Name+'%' OR E.LastName Like '%'+@Name+'%')
                        AND (@RoleId IS NULL OR @RoleId = 0 OR U.RoleId = @RoleId);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<ReportingManagerResponseDto?>(sql, new { Name = name, RoleId = RoleId });
                return result.ToList();
            }
        }

        public async Task<IEnumerable<University?>> GetUniversityListAsync()
        {
            var sql = "SELECT Id, UniversityName FROM University WHERE IsDeleted = 0 ";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<University?>(sql);
                return result.ToList();
            }
        }

        public Task<int> DeleteAsync(EmployeeData entity)
        {
            throw new NotImplementedException();
        }

        public async Task<DocumentType?> GetGovtDocumentTypeById(long id)
        {
            var sql = "SELECT Id, Name, IsExpiryDateRequired FROM DocumentType WHERE IsDeleted = 0 AND Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<DocumentType>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<bool> GetCurrentEmployerDocument(long currentEmployeeId, long employeeDocumentTypeId)
        {
            var query = @"SELECT COUNT(1) FROM [dbo].[CurrentEmployerDocument] 
                        WHERE EmployeeId = @PreviousEmployerId
                        AND EmployeeDocumentTypeId = @EmployeeDocumentTypeId AND IsDeleted = 0;";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(query, new { EmployeeId = currentEmployeeId, EmployeeDocumentTypeId = employeeDocumentTypeId });
                return count > 0;
            }
        }

        public async Task<bool> EmployeeDocumentTypeExistsAsync(UserDocumentRequestDto userDocumentRequestDto)
        {
            var query = "SELECT COUNT(1) FROM [dbo].[UserDocument] WITH (NOLOCK) WHERE EmployeeId = @employeeId AND DocumentTypeId = @documentTypeId and Id <> @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(query, userDocumentRequestDto);
                return count > 0;
            }
        }

        public async Task<IEnumerable<DepartmentResponseDto?>> GetDepartmentList()
        {
            var sql = "SELECT Id,Department Name FROM [dbo].[Department] WHERE IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<DepartmentResponseDto?>(sql);
                return result.ToList();
            }
        }

        public async Task<IEnumerable<TeamResponseDto?>> GetTeamList()
        {
            var sql = "SELECT Id,TeamName as Name FROM [dbo].[Team] WHERE IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<TeamResponseDto?>(sql);
                return result.ToList();
            }
        }
        public async Task<int> AddAsync(Departments department)
        {
            var sql = @"INSERT INTO [Department]
                        ([Department],[CreatedBy], [CreatedOn],[IsDeleted])
                        VALUES
                        (@Department, @CreatedBy, @CreatedOn, 0)";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync<int>(sql, department);
                return result;
            }
        }

        public async Task<int> AddTeamAsync(Teams teams)
        {
            var sql = @"INSERT INTO [dbo].[Team]([TeamName],[CreatedBy],[CreatedOn],[IsDeleted])
                        VALUES(@TeamName,@CreatedBy,GETUTCDATE(),0)";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, teams);
                return result;
            }
        }

        public async Task<TeamResponseDto?> GetTeamByIdAsync(long id)
        {
            var sql = @"SELECT Id,TeamName As Name FROM dbo.Team Where Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<TeamResponseDto>(sql, new { Id = id });
                return result;
            }
        }

        public async Task<int> UpdateTeam(Teams teams)
        {
            var sql = @"UPDATE [dbo].[Team]
                        SET [TeamName] = @TeamName,
                            [ModifiedBy]=@ModifiedBy,
                            [ModifiedOn]=GETUTCDATE()
                            WHERE Id = @id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, teams);
                return result;
            }
        }

        public async Task<int> DeleteTeamAsync(Teams teams)
        {
            var sql = "UPDATE [dbo].[Team] SET [ModifiedBy] = @ModifiedBy, [ModifiedOn] = GETUTCDATE(),IsDeleted = 1  WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = teams.Id, @modifiedBy = teams.ModifiedBy });
                return result;
            }
        }
        public async Task<int> UpdateDepartment(Departments department)
        {
            var sql = @"Update [Department] SET [Department]= @Department,
                               [ModifiedBy]=@ModifiedBy,
                               [ModifiedOn]=GETUTCDATE()
                                WHERE Id = @id;";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync<int>(sql, department);
                return result;
            }
        }
        public async Task<DepartmentResponseDto?> GetDepartmentById(long id)
        {
            var sql = @"SELECT Id,Department As Name FROM dbo.Department Where Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<DepartmentResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<int> DeleteDepartment(Departments departments)
        {
            var sql = @"UPDATE [Department] SET [ModifiedBy]=@ModifiedBy,[ModifiedOn]= GETUTCDATE(), IsDeleted =1 WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = departments.Id, @modifiedBy = departments.ModifiedBy });
                return result;
            }
        }
        public async Task<int> UpdateOfficialDetails(OfficialDetails officialDetails, BankDetails bankDetails)
        {
            var sqlUpdateOfficialDetails = @"UPDATE EmployeeData
          SET ESINo = @ESINo, HasESI = @HasESI, HasPF = @HasPF, UANNo = @UANNo, PassportNo = @PassportNo, PANNumber = @PANNumber, PassportExpiry = @PassportExpiry,
          AdharNumber = @AdharNumber, ModifiedBy = @ModifiedBy, ModifiedOn = GETUTCDATE(), PFDate = @PFDate, PFNumber = @PFNumber
          WHERE Id = @Id;";

            var sqlUpdateBankDetails = @"UPDATE BankDetails
          SET BankName = @BankName, EmployeeId = @EmployeeId, IFSCCode = @IFSCCode, 
              AccountNo = @AccountNo, BranchName = @BranchName, IsActive = @IsActive, ModifiedBy = @ModifiedBy, ModifiedOn = GETUTCDATE()
          WHERE EmployeeId = @EmployeeId;";

            var sqlInsertBankDetails = @"INSERT INTO BankDetails (BankName, EmployeeId, IFSCCode, AccountNo, BranchName, IsActive,CreatedBy,CreatedOn, ModifiedBy, ModifiedOn)
          VALUES (@BankName, @EmployeeId, @IFSCCode, @AccountNo, @BranchName, @IsActive,@CreatedBy, GETUTCDATE(), @ModifiedBy, GETUTCDATE());";

            var sqlCheckBankDetails = @"SELECT COUNT(1) FROM BankDetails WHERE EmployeeId = @EmployeeId;";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var parametersOfficialDetails = new DynamicParameters(officialDetails);
                        parametersOfficialDetails.Add("@PFDate", officialDetails.PFDate.HasValue ? officialDetails.PFDate.Value : null);
                        parametersOfficialDetails.Add("@PassportExpiry", officialDetails.PassportExpiry.HasValue ? officialDetails.PassportExpiry.Value : null);

                        var resultOfficialDetails = await connection.ExecuteAsync(sqlUpdateOfficialDetails, parametersOfficialDetails, transaction);

                        var bankDetailsExist = await connection.ExecuteScalarAsync<int>(sqlCheckBankDetails, new { EmployeeId = bankDetails.EmployeeId }, transaction);

                        int resultBankDetails;
                        if (bankDetailsExist > 0)
                        {
                            resultBankDetails = await connection.ExecuteAsync(sqlUpdateBankDetails, bankDetails, transaction);
                        }
                        else
                        {
                            resultBankDetails = await connection.ExecuteAsync(sqlInsertBankDetails, bankDetails, transaction);
                        }

                        transaction.Commit();
                        return resultOfficialDetails + resultBankDetails;
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }
        public async Task<OfficialDetailsResponseDto?> GetOfficialDetailsById(long id)
        {
            var sql = @"SELECT e.Id As EmployeeId,e.AdharNumber,e.PANNumber,e.ESINo,e.HasESI,e.HasPF,e.PFNumber,e.PFDate,e.UANNo,e.PassportNo,e.PassportExpiry,B.BankName,B.IFSCCode,B.BranchName,B.AccountNo FROM dbo.EmployeeData as e INNER JOIN BankDetails  as B ON e.Id = B.EmployeeId Where e.Id=@Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<OfficialDetailsResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<int> InsertUpdateExcelEmployeesData(List<EmployeeData> employeeDetailsList, List<BankDetails> bankDetailsList, List<Address> addressList, List<PermanentAddress> permanentAddressList, List<EmploymentDetail> employmentDetailsList)
        {

            var sql = @"INSERT INTO [dbo].[EmployeeData] ([FirstName]  ,[MiddleName] ,[LastName] ,[FatherName] ,[BloodGroup]  ,[Gender]
           ,[DOB] ,[Phone] ,[AlternatePhone] ,[PersonalEmail] ,[Nationality] ,[Interest] ,[MaritalStatus] ,[EmergencyContactPerson]
           ,[EmergencyContactNo] ,[CreatedBy] ,[CreatedOn] ,[IsDeleted],[EmployeeCode],[Status],[PANNumber],[AdharNumber],[PFNumber],[ESINo],[HasESI],[HasPF],[UANNo],[PassportNo],[PassportExpiry],[PFDate])
            VALUES
           (@FirstName  ,@MiddleName  ,@LastName ,@FatherName ,@BloodGroup ,@Gender ,@DOB  ,@Phone ,@AlternatePhone
           ,@PersonalEmail ,@Nationality ,@Interest ,@MaritalStatus ,@EmergencyContactPerson ,@EmergencyContactNo ,@CreatedBy ,@CreatedOn
           ,0,@EmployeeCode,@Status,@PANNumber,@AdharNumber,@PFNumber,@ESINo,@HasESI,@HasPF,@UANNo,@PassportNo,@PassportExpiry,@PFDate);
            SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
            ";

            var AddresSql = @"INSERT INTO [dbo].[Address]
           ([EmployeeId] ,[Line1] ,[Line2],[AddressType] ,[CreatedBy] ,[CreatedOn]  )
		    VALUES
           ( @EmployeeId,@Line1 ,@Line2,@AddressType ,@CreatedBy ,@CreatedOn )
             ";

            var PermanentAddresSql = @"INSERT INTO [dbo].[PermanentAddress]
            ([EmployeeId] ,[Line1] , [AddressType],[Pincode] ,[CreatedBy] ,[CreatedOn],[CountryId],[StateId],[CityId] )
            VALUES
            ( @EmployeeId,@Line1  ,@AddressType, @Pincode ,@CreatedBy ,@CreatedOn,@CountryId,@StateId,@CityId )";

            var BankDetailSql = @" INSERT INTO [dbo].[BankDetails] ([EmployeeId] ,[BankName],[BranchName],[IFSCCode] ,[AccountNO] ,[CreatedBy] ,[CreatedOn] ,[IsActive])
         VALUES (@EmployeeId ,@BankName,@BranchName,@IFSCCode ,@AccountNO ,@CreatedBy ,@CreatedOn ,1)";

            var EmploymentDetailSql = @" INSERT INTO [dbo].[EmploymentDetail] ([EmployeeId] ,[Email]
           ,[JoiningDate] ,[DesignationId] ,[CreatedBy] ,[CreatedOn] ,[DepartmentId],[JobType] ,[IsDeleted] ,[ReportingManagerName],[EmployeeStatus],[BranchId])
            VALUES
           (@EmployeeId ,@Email ,@JoiningDate ,@DesignationId ,@CreatedBy ,@CreatedOn ,@DepartmentId ,@JobType ,0 ,@ReportingManagerName,@EmployeeStatus,@BranchId)";

            var UserRoleMappingsql = @"INSERT INTO [dbo].[UserRoleMapping] ([RoleId] ,[EmployeeId] ,[CreatedBy] ,[CreatedOn] ,[IsDeleted])
                    VALUES
                    (@RoleId ,@EmployeeId ,@CreatedBy ,GETUTCDATE(),0)";

            List<RoleRequest> roleRequestLst = new();
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var employeeIds = new List<long>();
                        foreach (var employeeData in employeeDetailsList)
                        {
                            var names = employeeData.FirstName.Split(' ');

                            if (names.Length > 0)
                            {
                                employeeData.FirstName = names[0]; // First name

                                if (names.Length > 2)
                                {
                                    // Middle name is everything between the first and last names
                                    employeeData.MiddleName = string.Join(" ", names.Skip(1).Take(names.Length - 2));
                                }
                                else
                                {
                                    employeeData.MiddleName = string.Empty; // No middle name
                                }
                                if (names.Length > 1)
                                {

                                    employeeData.LastName = names[names.Length - 1]; // Last name
                                }
                            }


                            var employeeStatus = Helper.GetEnumIdFromString<EmployeeStatusType>(employeeData.EmployeeStatus);
                            employeeData.Status = employeeStatus;

                            var employeeId = await connection.ExecuteScalarAsync<long>(sql, employeeData, transaction);
                            employeeIds.Add(employeeId);
                            roleRequestLst.Add(new RoleRequest { EmployeeId = employeeId, CreatedBy = employeeData.CreatedBy, RoleId = 3 });
                        }
                        foreach (var employmentDetails in employmentDetailsList)
                        {
                            var branchId = Helper.GetEnumIdFromString<BranchLocation>(employmentDetails.BranchName);
                            employmentDetails.BranchId = (BranchLocation?)branchId;

                            var departmentIds = await connection.QueryAsync<int>("SELECT Id FROM dbo.Department Where Department = @DepartmentName and IsDeleted = 0",
                                new { DepartmentName = employmentDetails.DepartmentName }, transaction);
                            employmentDetails.DepartmentId = departmentIds.FirstOrDefault();

                            var designationIds = await connection.QueryAsync<int>("SELECT Id FROM dbo.Designation Where Designation = @Designation and IsDeleted = 0",
                                new { Designation = employmentDetails.Designation }, transaction);
                            employmentDetails.DesignationId = designationIds.FirstOrDefault();
                        }
                        foreach (var address in addressList)
                        {
                            // Split the address using spaces
                            var parts = address.Line1.Split(',', 2, StringSplitOptions.RemoveEmptyEntries);

                            // Initialize default values
                            address.Line1 = string.Empty;
                            address.Line2 = string.Empty;

                            if (parts.Length >= 1) // Ensure there are enough parts
                            {
                                address.Line1 = parts[0]; // First part is Line1
                                if (parts.Length == 2)
                                {
                                    address.Line2 = parts[1]; // Second part is Line2 

                                }
                            }
                            else
                            {
                                throw new InvalidExpressionException($"Address format is invalid: {address.Line1}");
                            }

                        }
                        foreach (var permanentAddress in permanentAddressList)
                        {
                            permanentAddress.CountryId = await connection.QuerySingleOrDefaultAsync<int>("SELECT Id FROM dbo.Country Where CountryName = @CountryName and IsDeleted = 0", new { CountryName = permanentAddress.Country }, transaction);
                            permanentAddress.StateId = await connection.QuerySingleOrDefaultAsync<int>("SELECT Id FROM dbo.State Where StateName = @StateName AND CountryId=@CountryId AND IsDeleted = 0", new { StateName = permanentAddress.State, CountryId = permanentAddress.CountryId }, transaction);
                            permanentAddress.CityId = await connection.QuerySingleOrDefaultAsync<int>(
                                "SELECT Id FROM dbo.City WHERE CityName = @CityName AND StateId = @StateId AND IsDeleted = 0",
                                new { CityName = permanentAddress.City, StateId = permanentAddress.StateId },
                                transaction);

                        }

                        for (int i = 0; i < addressList.Count; i++)
                        {
                            addressList[i].EmployeeId = employeeIds[i];
                            bankDetailsList[i].EmployeeId = employeeIds[i];
                            permanentAddressList[i].EmployeeId = employeeIds[i];
                            employmentDetailsList[i].EmployeeId = employeeIds[i];

                        }

                        var EmployeementDetail = await connection.ExecuteAsync(EmploymentDetailSql, employmentDetailsList, transaction);
                        await connection.ExecuteAsync(AddresSql, addressList, transaction);
                        await connection.ExecuteAsync(PermanentAddresSql, permanentAddressList, transaction);
                        await connection.ExecuteAsync(BankDetailSql, bankDetailsList, transaction);
                        await connection.ExecuteAsync(UserRoleMappingsql, roleRequestLst, transaction);

                        transaction.Commit();

                        return EmployeementDetail;
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }
            return 0;
        }
        public static string GetValidDate(DateTime value)
        {
            if (value == DateTime.MinValue || DateTime.Compare(DateTime.MinValue, value) == 0)
            {
                return string.Empty;
            }
            return value.ToString("yyyy-MM-dd");
        }
        public byte[] GenerateExcelFile(IEnumerable<EmployeeResponseDto> employees)
        {
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Employees");

                // Add header row
                worksheet.Cells[1, 1].Value = "Sl No";
                worksheet.Cells[1, 2].Value = "Code";
                worksheet.Cells[1, 3].Value = "Employee Name";
                worksheet.Cells[1, 4].Value = "Father's Name";
                worksheet.Cells[1, 5].Value = "Gender";
                worksheet.Cells[1, 6].Value = "DOB";
                worksheet.Cells[1, 7].Value = "Email";
                worksheet.Cells[1, 8].Value = "Current Address";
                worksheet.Cells[1, 9].Value = "Permanent Address";
                worksheet.Cells[1, 10].Value = "City";
                worksheet.Cells[1, 11].Value = "State";
                worksheet.Cells[1, 12].Value = "Pin";
                worksheet.Cells[1, 13].Value = "Country"; // Added Country
                worksheet.Cells[1, 14].Value = "Emergency No";
                worksheet.Cells[1, 15].Value = "DOJ";
                worksheet.Cells[1, 16].Value = "Confirmation Date";
                worksheet.Cells[1, 17].Value = "Job Type";
                worksheet.Cells[1, 18].Value = "Branch";
                worksheet.Cells[1, 19].Value = "PF No";
                worksheet.Cells[1, 20].Value = "PF Date";
                worksheet.Cells[1, 21].Value = "Bank Name";
                worksheet.Cells[1, 22].Value = "Bank Account No";
                worksheet.Cells[1, 23].Value = "PAN";
                worksheet.Cells[1, 24].Value = "ESI No";
                worksheet.Cells[1, 25].Value = "Department";
                worksheet.Cells[1, 26].Value = "Designation";
                worksheet.Cells[1, 27].Value = "Reporting Manager";
                worksheet.Cells[1, 28].Value = "Passport No";
                worksheet.Cells[1, 29].Value = "Passport Expiry";
                worksheet.Cells[1, 30].Value = "Telephone";
                worksheet.Cells[1, 31].Value = "Mobile No";
                worksheet.Cells[1, 32].Value = "Personal Email";
                worksheet.Cells[1, 33].Value = "Blood Group";
                worksheet.Cells[1, 34].Value = "Marital Status";
                worksheet.Cells[1, 35].Value = "UAN Number";
                worksheet.Cells[1, 36].Value = "Has PF";
                worksheet.Cells[1, 37].Value = "Has ESI";
                worksheet.Cells[1, 38].Value = "Aadhar Number";
                worksheet.Cells[1, 39].Value = "Employee Status";

                var serialNumber = 1;
                // Add data rows
                var row = 2;
                foreach (var employee in employees)
                {
                    worksheet.Cells[row, 1].Value = serialNumber++;
                    worksheet.Cells[row, 2].Value = employee.EmployeeCode;
                    worksheet.Cells[row, 3].Value = employee.EmployeeName;
                    worksheet.Cells[row, 4].Value = employee.FatherName;
                    worksheet.Cells[row, 5].Value = employee.Gender == 0 ? null : employee.Gender;
                    worksheet.Cells[row, 6].Value = GetValidDate(employee.DOB);
                    worksheet.Cells[row, 7].Value = employee.Email;
                    worksheet.Cells[row, 8].Value = employee.Address;
                    worksheet.Cells[row, 9].Value = employee.PermanentAddress;
                    worksheet.Cells[row, 10].Value = employee.CityName;
                    worksheet.Cells[row, 11].Value = employee.StateName;
                    worksheet.Cells[row, 12].Value = employee.PinCode;
                    worksheet.Cells[row, 13].Value = employee.Country; // Added Country
                    worksheet.Cells[row, 14].Value = employee.EmergencyContactNo;
                    worksheet.Cells[row, 15].Value = GetValidDate(employee.JoiningDate);
                    worksheet.Cells[row, 16].Value = GetValidDate(employee.ConfirmationDate);
                    worksheet.Cells[row, 17].Value = employee.JobType == 0 ? null : employee.JobType.ToString();
                    worksheet.Cells[row, 18].Value = employee.Branch;
                    worksheet.Cells[row, 19].Value = employee.PFNumber;
                    worksheet.Cells[row, 20].Value = GetValidDate(employee.PFDate);
                    worksheet.Cells[row, 21].Value = employee.BankName;
                    worksheet.Cells[row, 22].Value = employee.AccountNo;
                    worksheet.Cells[row, 23].Value = employee.PANNumber;
                    worksheet.Cells[row, 24].Value = employee.ESINo;
                    worksheet.Cells[row, 25].Value = employee.DepartmentName;
                    worksheet.Cells[row, 26].Value = employee.Designation;
                    worksheet.Cells[row, 27].Value = employee.ReportingManagerName;
                    worksheet.Cells[row, 28].Value = employee.PassportNo;
                    worksheet.Cells[row, 29].Value = GetValidDate(employee.PassportExpiry);
                    worksheet.Cells[row, 30].Value = employee.AlternatePhone;
                    worksheet.Cells[row, 31].Value = employee.Phone;
                    worksheet.Cells[row, 32].Value = employee.PersonalEmail;
                    worksheet.Cells[row, 33].Value = employee.BloodGroup;
                    worksheet.Cells[row, 34].Value = employee.MaritalStatus == 0 ? null : employee.MaritalStatus.ToString();
                    worksheet.Cells[row, 35].Value = employee.UANNo;
                    worksheet.Cells[row, 36].Value = employee.HasPF ? "Yes" : "No";
                    worksheet.Cells[row, 37].Value = employee.HasESI ? "Yes" : "No";
                    worksheet.Cells[row, 38].Value = employee.AdharNumber;
                    worksheet.Cells[row, 39].Value = employee.Status;
                    row++;
                }

                return package.GetAsByteArray();
            }
        }

        public Address? GetCurrentAddressByEmployeeId(long EmployeeId)
        {
            var query = "SELECT * FROM [dbo].[Address] WHERE EmployeeId = @EmployeeId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                try
                {
                    var addressCr = connection.QuerySingleOrDefault<Address?>(query, new { EmployeeId = EmployeeId });
                    return addressCr;
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Failed to get the current address.", ex);
                }


            }
        }
        public PermanentAddress? PermanentAddressByEmployeeId(long EmployeeId)
        {
            var query = "SELECT * FROM [dbo].[PermanentAddress] WHERE EmployeeId = @EmployeeId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var addressPr = connection.QuerySingleOrDefault<PermanentAddress>(query, new { EmployeeId = EmployeeId });
                return addressPr;
            }
        }
        public async Task<IEnumerable<EmployeeCodeResponseDto?>> GetAllEmployeeCodesAsync()
        {

            var sql = "Select E.EmployeeCode,ED.Email from EmployeeData AS E INNER JOIN EmploymentDetail as ED ON ED.EmployeeId = E.Id  Where E.IsDeleted=0 ";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<EmployeeCodeResponseDto?>(sql);

                return result;
            }
        }
        public async Task<IEnumerable<DesignationResponseDto?>> GetDesignationList()
        {
            var sql = "SELECT Id,Designation As Name  FROM [dbo].[Designation] WHERE IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<DesignationResponseDto?>(sql);
                return result.ToList();
            }
        }
        public async Task<DepartmentSearchResponseDto> GetDepartment(SearchRequestDto<DepartmentSearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();

            query.Append("SELECT COUNT(id)  AS TotalRecords FROM dbo.Department WHERE 1=1 ");

            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.Department))
            {
                query.Append(" and Department like '%'+@Department+'%'");
            }
            query.Append(" AND (@Status IS NULL OR IsDeleted IS NOT NULL)"); // Include all records

            var sqlQuery = $@"EXEC [dbo].[GetDepartments] @Department ,@Status,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                DepartmentSearchResponseDto departmentSearchResponseDto = new DepartmentSearchResponseDto();

                connection.Open();
                departmentSearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { requestDto!.Filters.Department, Status = requestDto!.Filters.Status });
                departmentSearchResponseDto.DepartmentList = await connection.QueryAsync<DepartmentResponseDto>(sqlQuery, new { requestDto.Filters.Department, Status = requestDto.Filters.Status, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });
                return departmentSearchResponseDto;
            }
        }
        public async Task<TeamSearchResponseDto> GetTeams(SearchRequestDto<TeamSearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();

            query.Append("SELECT COUNT(id)  AS TotalRecords FROM dbo.Team WHERE 1=1");

            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.TeamName))
            {
                query.Append(" and TeamName like '%'+@TeamName+'%'");
            }
            query.Append(" AND (@Status IS NULL OR IsDeleted IS NOT NULL)"); // Include all records

            var sqlQuery = $@"EXEC [dbo].[GetTeams] @TeamName, @Status,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                TeamSearchResponseDto teamSearchResponseDto = new TeamSearchResponseDto();

                connection.Open();
                teamSearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { requestDto!.Filters.TeamName, Status = requestDto!.Filters.Status });
                teamSearchResponseDto.TeamList = await connection.QueryAsync<TeamResponseDto>(sqlQuery, new { requestDto.Filters.TeamName, Status = requestDto!.Filters.Status, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });
                return teamSearchResponseDto;
            }
        }
        public async Task<int> AddDesignation(Designation designation)
        {
            var sql = @"INSERT INTO [Designation]
                        ([Designation],[CreatedBy], [CreatedOn],[IsDeleted])
                        VALUES
                        (@name, @CreatedBy, @CreatedOn, 0)";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync<int>(sql, designation);
                return result;
            }
        }
        public async Task<DesignationResponseDto?> GetDesignationById(long id)
        {
            var sql = @"SELECT Id,Designation As Name FROM dbo.Designation Where Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<DesignationResponseDto>(sql, new { Id = id });
                return result;
            }
        }
        public async Task<DesignationResponseDto?> GetDesignationByName(string Name)
        {
            var sql = @"SELECT Id,Designation As Name, IsDeleted As status FROM dbo.Designation Where Designation = @Name";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<DesignationResponseDto>(sql, new { Name = Name });
                return result;
            }
        }
        public async Task<DepartmentResponseDto?> GetDepartmentByName(string Name)
        {
            var sql = @"SELECT Id,Department As Name,IsDeleted As Status FROM dbo.Department Where Department = @Name";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<DepartmentResponseDto>(sql, new { Name = Name });
                return result;
            }
        }
        public async Task<TeamResponseDto?> GetTeamByNameAsync(string Name)
        {
            var sql = @"SELECT Id,TeamName As Name,IsDeleted As Status FROM dbo.Team Where TeamName = @Name";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<TeamResponseDto>(sql, new { Name = Name });
                return result;
            }
        }
        public async Task<int> UpdateDesignation(Designation designation)
        {
            var sql = @"Update [Designation] SET [Designation]= @name,
                               [ModifiedBy]=@ModifiedBy,
                               [ModifiedOn]=GETUTCDATE()
                                WHERE Id = @id;";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync<int>(sql, designation);
                return result;
            }
        }
        public async Task<DesignationSearchResponseDto> GetDesignation(SearchRequestDto<DesignationSearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();

            query.Append("SELECT COUNT(id)  AS TotalRecords FROM dbo.Designation WHERE 1=1 ");

            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.Designation))
            {
                query.Append(" and Designation like '%'+@Designation+'%'");
            }
            query.Append(" AND (@Status IS NULL OR IsDeleted IS NOT NULL)"); // Include all records

            var sqlQuery = $@"EXEC [dbo].[GetDesignation] @Designation ,@Status,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                DesignationSearchResponseDto designationSearchResponseDto = new DesignationSearchResponseDto();

                connection.Open();
                designationSearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { requestDto!.Filters.Designation, Status = requestDto!.Filters.Status });
                designationSearchResponseDto.DesignationList = await connection.QueryAsync<DesignationResponseDto>(sqlQuery, new { requestDto.Filters.Designation, Status = requestDto.Filters.Status, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });
                return designationSearchResponseDto;
            }
        }
        public async Task<string?> GetLatestEmpCode()
        {
            var sql = @"SELECT MAX(CAST(EmployeeCode AS bigint))+1 AS MaxNumericEmployeeCode
                        FROM EmployeeData  ED Inner join EmploymentDetail E ON ED.Id  = E.EmployeeId 
                        WHERE EmployeeCode NOT LIKE '%[^0-9]%'";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<string>(sql);
                return result;
            }
        }


    }
}