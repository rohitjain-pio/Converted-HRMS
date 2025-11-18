using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using HRMS.Models.Models.Role;
using Dapper;
using static Dapper.SqlMapper;
using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Domain.Contants;


namespace HRMS.Infrastructure.Repositories
{
    public class RolePermissionRepository : IRolePermissionRepository
    {
        private readonly IConfiguration _configuration;
        public RolePermissionRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RoleSearchResponseDto> GetRoles(SearchRequestDto<RoleRequestSearchDto> roleRequestSearchDto)
        {
            RoleSearchResponseDto RoleSearchResponse = new RoleSearchResponseDto();

            var sql = @"SELECT COUNT(Id) AS TotalRecords FROM [Role] WHERE IsActive = 1 AND Name LIKE  '%RoleName%'";
            var sqlQuery = $@"EXEC [dbo].[GetRoleListWithUserCount] @RoleName,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                RoleSearchResponse.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(sql, new { roleRequestSearchDto.Filters.RoleName });
                RoleSearchResponse.RoleResponseList = await connection.QueryAsync<RoleResponseDto>(sqlQuery, new { roleRequestSearchDto.Filters.RoleName, roleRequestSearchDto.SortColumnName, SortColumnDirection = roleRequestSearchDto.SortDirection, roleRequestSearchDto.StartIndex, roleRequestSearchDto.PageSize });
                return RoleSearchResponse;
            }
        }

        public async Task<IEnumerable<ModulePermissionDto>> GetModulePermissionByRole(int roleId)
        {
            var roleExistQuery = "SELECT Count(Id) FROM ROLE WHERE Id=@RoleId";

            var sqlQuery = @"SELECT P.Id AS PermissionId,P.Name AS PermissionName,M.Id AS ModuleId,M.ModuleName,R.Id AS RoleId, R.Name RoleName,
                CASE WHEN RP.Id IS NOT NULL THEN 1 ELSE 0 END AS IsActive FROM Permission P 
                JOIN Module M ON P.ModuleId = M.Id LEFT JOIN RolePermission RP ON RP.PermissionId = P.Id AND RP.RoleId = @RoleId
                LEFT JOIN Role R ON RP.RoleId = R.Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var resultRoleExist = await connection.QuerySingleOrDefaultAsync<int>(roleExistQuery, new { RoleId = roleId });
                if (resultRoleExist > 0)
                {
                    var result = await connection.QueryAsync<ModulePermissionDto>(sqlQuery, new { RoleId = roleId });
                    return result.ToList();
                }
                else
                {
                    return Enumerable.Empty<ModulePermissionDto>();
                }
            }
        }

        public async Task<int> SaveRolePermission(int roleId, IEnumerable<int> permissionIdList)
        {
            using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                var permissionIds = new DataTable();
                permissionIds.Columns.Add("PermissionId", typeof(int));
                foreach (int permissionId in permissionIdList)
                {
                    permissionIds.Rows.Add(permissionId);
                }

                await connection.OpenAsync();
                SqlCommand command = new SqlCommand("SaveRolePermissions", connection);

                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add("@RoleId", SqlDbType.Int).Value = roleId;

                SqlParameter param = new SqlParameter("@PermissionIds", permissionIds);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "dbo.PermissionIdTableType";
                command.Parameters.Add(param);
                var result = await command.ExecuteNonQueryAsync();
                return result;
            }
        }
        public async Task<int> CreateRoleName(Role role)
        {
            var sqlQuery = "Insert Into [Role] ([Name],[IsActive],[CreatedBy],[CreatedOn]) Values (@Name,1,@CreatedBy,GETUTCDATE()); Select SCOPE_IDENTITY();";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteScalarAsync(sqlQuery, role);
                return Convert.ToInt32(result);
            }
        }
        public async Task<int> UpdateRoleName(int roleId, string roleName)
        {
            var sqlQuery = "UPDATE [Role] SET [Name] = @RoleName WHERE [Id] = @RoleId";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sqlQuery, new { RoleId = roleId, RoleName = roleName });
                return result;
            }
        }
        public async Task<IEnumerable<ModuleDto?>> GetPermissionList()
        {
            var sql = "SELECT M.Id As ModuleId,M.ModuleName,M.IsActive,(SELECT P.Id As PermissionId,P.Name As PermissionName,M.IsActive FROM PERMISSION P where P.ModuleId = M.Id FOR JSON PATH) AS PermissionJson FROM  Module M";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<ModuleDto>(sql);
                return result.ToList();
            }
        }
        public async Task<IEnumerable<RolesListResponseDto?>> GetRoles()
        {
            var sql = "SELECT Id,Name FROM Role";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<RolesListResponseDto>(sql);
                return result.ToList();
            }
        }

    }
}
