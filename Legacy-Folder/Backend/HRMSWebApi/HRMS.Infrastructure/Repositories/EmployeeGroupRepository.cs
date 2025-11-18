using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.EmployeeGroup;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Data;
using Microsoft.Data.SqlClient;

namespace HRMS.Infrastructure.Repositories
{
    public class EmployeeGroupRepository : IEmployeeGroupRepository 
    {
        private readonly IConfiguration _configuration;
        public EmployeeGroupRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
       
        public async Task<IEnumerable<Group>> GetEmployeeGroups()
        {
            var sql = "SELECT Id,GroupName FROM [Group] WHERE IsDeleted = 0 AND Status = 1 order by GroupName ASC";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<Group>(sql);
                return result;
            }
        }
        public async Task<int> CreateGroup(Group employeeGroupRequest)
        {
            var sqlQuery = $@"EXEC [dbo].[SaveEmployeeGroup] @Id,@GroupName,@Description,@Status,@CreatedBy,@employeeIds";
            var employeeIdsJson = JsonConvert.SerializeObject(employeeGroupRequest.EmployeeIds);
           
            using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {               
               connection.Open();                
                return await connection.ExecuteAsync(sqlQuery, new { employeeGroupRequest.Id, employeeGroupRequest.GroupName, employeeGroupRequest.Description, employeeGroupRequest.Status, employeeGroupRequest.CreatedBy, @employeeIds=employeeIdsJson });              
            }
        }

        public async Task<bool> GroupNameExistsAsync(string groupName)
        {
            var query = "SELECT COUNT(1) FROM [Group] WHERE GROUPNAME = @GroupName";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var count = await connection.ExecuteScalarAsync<int>(query, new { GroupName = groupName });
                return count>0;
            }          
        }
        public async Task<int> DeleteAsync(long id)
        {
            var sql = "UPDATE [dbo].[Group] SET IsDeleted = 1  WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id = id });
                return result;
            }
        }

        public async Task<Group?> GetEmployeeGroupById(long id)
        {
            var sql = "SELECT Id, GroupName FROM [Group] WHERE IsDeleted = 0 and Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Group>(sql, new {Id = id});
                return result;
            }
        }
        public async Task<int> UpdateGroup(Group groupRequest)
        {
            var sqlQuery = $@"EXEC [dbo].[SaveEmployeeGroup] @Id,@GroupName,@Description,@Status,@CreatedBy,@employeeIds";
            var employeeIdsJson = JsonConvert.SerializeObject(groupRequest.EmployeeIds);

            using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();                
                return await connection.ExecuteAsync(sqlQuery, new { groupRequest.Id, groupRequest.GroupName, groupRequest.Description, groupRequest.Status, groupRequest.CreatedBy, @employeeIds = employeeIdsJson });
            }
        }
        public async Task<IEnumerable<EmployeeDto>> GetAllEmployees()
        {
            var sql = @"SELECT ID,LTRIM(RTRIM(
                                  CONCAT(FirstName, 
                                  CASE 
                                      WHEN COALESCE(MiddleName, '') ='' THEN ''
                                      ELSE ' '+ MiddleName
                                  END,
                                  ' ', LastName))) AS FullName
                         FROM [EmployeeData] WHERE IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<EmployeeDto>(sql);
            }
        }
        public async Task<EmployeeGroupResponseDto?> GetEmployeeGroupDetailsById(long id)
        {
            var sql = @"SELECT 
                g.ID, g.GroupName, g.Description,
                CASE WHEN g.Status = 1 THEN 'Active' ELSE 'InActive' END AS Status,
                g.CreatedBy, g.CreatedOn, g.ModifiedBy, g.ModifiedOn,
                e.Id As ID,LTRIM(RTRIM(
                              CONCAT(
                                 e.FirstName,
                                 CASE 
                                     WHEN COALESCE(e.MiddleName, '') ='' THEN ''
                                     ELSE ' ' + e.MiddleName
                                 END,
                                 ' ', e.LastName))) AS FullName
                FROM [Group] g
                LEFT JOIN [UserGroupMapping] ugm ON g.ID = ugm.GroupId AND ugm.IsDeleted = 0
                LEFT JOIN [EmployeeData] e ON ugm.EmployeeId = e.ID AND e.IsDeleted=0
                WHERE g.ID = @GroupId AND g.IsDeleted=0";
            var groupDictionary = new Dictionary<long, EmployeeGroupResponseDto>();

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                await connection.QueryAsync<EmployeeGroupResponseDto, EmployeeDto, EmployeeGroupResponseDto>(
                    sql,
                    (group, employee) =>
                    {                       
                        if (!groupDictionary.TryGetValue(group.Id, out var currentGroup))
                        {
                            currentGroup = group;
                            groupDictionary.Add(currentGroup.Id, currentGroup);
                        }
                        if(employee != null)
                        {                           
                            currentGroup.Employee.Add(employee);
                        }
                        return currentGroup;
                    },
                    new {GroupId = id},
                    splitOn: "ID"
                    );
                return groupDictionary?.Values?.FirstOrDefault();                
            }
        }

        public async Task<EmployeeGroupSearchResponseDto> GetEmployeeGroupList(SearchRequestDto<EmployeeGroupSearchRequestDto> requestDto)
        {           
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var query = $"SELECT COUNT(1) FROM [Group] WHERE (@GroupName IS NULL OR GroupName LIKE '%'+ @GroupName +'%') AND (@Status IS NULL OR Status = @Status) AND IsDeleted=0;";
                var sqlQuery = $@"EXEC [dbo].[GetEmployeeGroupList] @GroupName,@Status,@SortColumnName,@SortDirection,@PageNumber,@PageSize";
                               
                var totalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { requestDto.Filters.GroupName, requestDto.Filters.Status });
                var groupList =  await connection.QueryAsync<EmployeeGroupSearchDto>(sqlQuery, new
                {
                    requestDto.Filters.GroupName,
                    requestDto.Filters.Status,
                    requestDto.SortColumnName,
                    requestDto.SortDirection,
                    PageNumber=requestDto.StartIndex,
                    requestDto.PageSize
                });
               
                return new EmployeeGroupSearchResponseDto
                {
                    EmployeeGroupList = groupList,
                    TotalRecords = totalRecords
                };
            }
        }
        public async Task<bool> ValidateEmployeeIdsAsync(List<long> EmployeeIds)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
               string employeeIdsJson = JsonConvert.SerializeObject(EmployeeIds);
                string query = @"
                            SELECT COUNT(1)
                            FROM OPENJSON(@EmployeeIds) AS ids
                            WHERE ids.value NOT IN(SELECT ID FROM EmployeeData)";
                int invalidCount = await connection.ExecuteScalarAsync<int>(query, new { @employeeIds = employeeIdsJson });
                return invalidCount > 0;
            }
        }
        public async Task<bool> ValidateGroupIdAsync(long id)
        {
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();               
                string query = @"
                            SELECT COUNT(1)
                            FROM [Group]
                            WHERE ID=@Id";
                int invalidCount = await connection.ExecuteScalarAsync<int>(query, new { @Id = id });
                return invalidCount > 0;
            }
        }
    }
}
