using HRMS.Domain.Entities;
using HRMS.DownTownDataSync.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using HRMS.Models.Models.Downtown;
using static Dapper.SqlMapper;
using HRMS.Models.Models.EmployeeGroup;
using Microsoft.Data.SqlClient;


namespace HRMS.DownTownDataSync.Repositories
{
    public class DowntownDataSyncRepository: IDowntownDataSyncRepository
    {
        private readonly IConfiguration _configuration;
     
        public DowntownDataSyncRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<int> AddAsync(DowntownData entity)
        {
            var sql = @"INSERT INTO [dbo].[DowntownData] ([First_Name] ,[Last_Name] ,[Photo] ,[Gender] ,[DOB] ,[Phone] ,[Alternate_Phone_Number] ,[Email] ,[Address] ,[Country] ,[Joining_date] ,[Branch_title] ,[Team_id] ,[Team_Title] ,[Designation] ,[Status] ,[IsSynched] ,[Created_at] ,[Updated_at] ,[deleted_at])
                    VALUES
                    (@First_Name ,@Last_Name ,@Photo ,@Gender ,@DOB ,@Phone ,@Alternate_Phone_Number ,@Email ,@Address ,@Country ,@Joining_date ,@Branch_title ,@Team_id ,@Team_title ,@Designation ,@Status ,0 ,@Created_at ,@Updated_at ,@deleted_at)";
           
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, entity);
                return result;
            }
        }

        public async Task<int> AddEmployeeDataAsync(EmployeeRequest entity, Address address)
        {
            entity.CreatedOn = DateTime.UtcNow;
            entity.CreatedBy = "Admin";

            var sql = @"INSERT INTO [dbo].[EmployeeData] ([FirstName]  ,[MiddleName] ,[LastName] ,[FatherName] ,[BloodGroup]  ,[Gender]
           ,[DOB] ,[Status] ,[Phone] ,[AlternatePhone] ,[PersonalEmail] ,[Nationality] ,[Interest] ,[EmergencyContactPerson]
           ,[EmergencyContactNo] ,[CreatedBy] ,[CreatedOn] ,[IsDeleted])
            VALUES
           (@FirstName  ,@MiddleName  ,@LastName ,@FatherName ,@BloodGroup ,@Gender ,@DOB ,@Status ,@Phone ,@AlternatePhone
           ,@PersonalEmail ,@Nationality ,@Interest ,@EmergencyContactPerson ,@EmergencyContactNo ,@CreatedBy ,@CreatedOn
           ,0);
            SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
            ";

            var AddresSql = @"INSERT INTO [dbo].[Address]
           ([EmployeeId] ,[Line1] ,[Line2] ,[CityId] ,[CountryId] ,[StateId] ,[AddressType] ,[CreatedBy] ,[CreatedOn] ,[Pincode])
		    VALUES
           ( @EmployeeId,@Line1 ,@Line2 ,@CityId ,@CountryId ,@StateId ,@AddressType ,@CreatedBy ,@CreatedOn ,@Pincode )
             ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var employeeId = await connection.ExecuteScalarAsync<long>(sql, entity, transaction);
                        address.EmployeeId = employeeId;

                        var result = await connection.ExecuteAsync(AddresSql, address, transaction);

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

        public async Task<int> AddEmployeementDetailsAsync(DowntownEmployeeDataRequestDto employmentDetail)
        {
            employmentDetail.CreatedOn = DateTime.UtcNow;
            employmentDetail.CreatedBy = "Admin";

            var query = @"INSERT INTO [EmploymentDetail]
               ([EmployeeId] ,[Email] ,[JoiningDate] ,[BranchId] ,[Designation] ,[EmploymentStatus] ,[LinkedInUrl] ,[DepartmentId]
               ,[BackgroundVerificationstatus] ,[CriminalVerification] ,[DepartmentName]  
               ,[TotalExperienceYear ]
               ,[TotalExperienceMonth]
               ,[RelevantExperienceYear]
               ,[RelevantExperienceMonth]
               ,[JobType]
               ,[ConfirmationDate]
               ,[TeamId] 
               ,[TeamName]
               ,[ExtendedConfirmationDate]
               ,[isProbExtended]
               ,[ProbExtendedWeeks]
               ,[isConfirmed],[ProbationMonths] 
                ,[CreatedBy] ,[CreatedOn] 
               )
                VALUES
               (@EmployeeId ,@Email ,@JoiningDate ,@BranchId ,@Designation ,@EmploymentStatus ,@LinkedInUrl ,@DepartmentId
               ,@BackgroundVerificationstatus ,@CriminalVerification ,@DepartmentName 
               ,@TotalExperienceYear
               ,@TotalExperienceMonth
               ,@RelevantExperienceYear
               ,@RelevantExperienceMonth
               ,@JobType
               ,@ConfirmationDate
               ,@TeamId ,@TeamName
               ,@ExtendedConfirmationDate
               ,@isProbExtended
               ,@ProbExtendedWeeks
               ,@isConfirmed,@ProbationMonths 
                ,@CreatedBy ,@CreatedOn
                )";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(query, employmentDetail);
                return result;
            }
        }

        public async Task<int> AddRoleMappingAsync(RoleRequest entity)
        {
            entity.CreatedBy = "Admin";
            var sql = @"INSERT INTO [dbo].[UserRoleMapping] ([RoleId] ,[EmployeeId] ,[CreatedBy] ,[CreatedOn] ,[IsDeleted])
                    VALUES
                    (@RoleId ,@EmployeeId ,@CreatedBy ,GETUTCDATE(),0)";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, entity);
                return result;
            }
        }

        public async Task<int> GetContryIdAsync(string countryName)
        {
            var sql = "SELECT Id FROM [dbo].[Country] Where CountryName = @CountryName";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<int>(sql, new { CountryName = countryName});
                return result;
            }
        }

        public async Task<IEnumerable<DowntownData>> GetDowntownEmployeeData()
        {
            var sql = "SELECT Id,First_Name,Last_Name,Photo,Gender,FORMAT(DOB, 'MM/dd/yyyy') DOB,Phone,Alternate_Phone_Number,Email,Address,Country,Joining_date,Branch_title,Team_id,Team_Title,Designation,Status,IsSynched FROM [DowntownData]";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryAsync<DowntownData>(sql);
                return result;
            }
        }

        public async Task<DowntownData?> GetEmployeeDataByEmailAsync(string email)
        {
            var sql = "SELECT Id,First_Name,Last_Name,Photo,Gender,DOB,Phone,Alternate_Phone_Number,Email,Address,Country,Joining_date,Branch_title,Team_id,Team_Title,Designation,Status,IsSynched FROM [DowntownData] Where Email = @email";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<DowntownData?>(sql, new { Email = email });
                return result;
            }
        }

        public async Task<int> GetEmployeeDetailsByEmailAsync(string email)
        {
            var sql = "SELECT Id FROM [dbo].[EmployeeData] Where PersonalEmail = @PersonalEmail";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<int>(sql, new {PersonalEmail = email});
                return result;
            }
        }

        public async Task<int> UpdateIsSynchedAsync(string email)
        {
            var sql = "update [dbo].[DowntownData] set [IsSynched] = 1 where Email = @Email and IsSynched = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<int>(sql, new { Email = email });
                return result;
            }
        }
    }
}
