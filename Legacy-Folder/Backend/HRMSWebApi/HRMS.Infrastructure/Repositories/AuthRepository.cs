using HRMS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Infrastructure.Interface;
using HRMS.Models.Models.Auth;
using HRMS.Models.Models.Role;
using Newtonsoft.Json;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IConfiguration _configuration;
        public AuthRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> GetUserByEmailId(string emailId, string username)
        {
            var sql = "SELECT e.Id AS UserId, ed.Email AS UserEmail, e.FirstName, e.LastName,r.Id AS RoleId, r.Name AS RoleName , ed.IsReportingManager FROM EmployeeData e" +
                      " INNER JOIN EmploymentDetail ed ON ed.EmployeeId= e.Id " +
                      " INNER JOIN UserRoleMapping ur ON ur.EmployeeId= e.Id " +
                      " INNER JOIN Role r ON r.Id= ur.RoleId " +
                      " WHERE ed.Email = @Email OR ed.Email = @username AND ur.IsDeleted=0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<LoginResponseDto?>(sql, new { Email = emailId, username = username });
                return result;
            }
        }

        public async Task<EmployeeData?> GetByIdAsync(long id)
        {
            var sql = "SELECT * FROM EmployeeData WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<EmployeeData>(sql, new { Id = id });
                return result;
            }
        }

        public Task<IReadOnlyList<EmployeeData>> GetAllAsync()
        {
            throw new NotImplementedException();
        }
        public Task<int> UpdateAsync(EmployeeData entity)
        {
            throw new NotImplementedException();
        }

        public Task<int> AddAsync(EmployeeData entity)
        {
            throw new NotImplementedException();
        }
        public async Task<IEnumerable<MenuResponseDto>> GetMenuByRole(List<int> roleId)
        {
            var sqlQuery = @"
                SELECT DISTINCT M.NAME MainMenu, M.OrderNo,
                    M.ApiEndPoint MainMenuApiEndPoint,
                    (
                        SELECT SubMenu.NAME SubMenu,
                            SubMenu.ApiEndPoint SubMenuApiEndPoint
                        FROM MENU AS SubMenu
                        WHERE SubMenu.ParentMenuId = M.Id
                        AND (
                            NOT EXISTS (
                                SELECT ID
                                FROM MenuPermission sMP
                                WHERE sMP.MenuId = SubMenu.Id AND sMP.ReadPermissionId IS NOT NULL
                            )
                            OR EXISTS (
                                SELECT Id
                                FROM RolePermission sRP
                                WHERE sRP.RoleId IN @RoleId
                                AND sRP.IsActive = 1
                                AND sRP.PermissionId = (
                                    SELECT TOP 1 sMP.ReadPermissionId
                                    FROM MenuPermission sMP
                                    WHERE sMP.MenuId = SubMenu.Id AND sMP.ReadPermissionId IS NOT NULL
                                )
                            )
                        )
                        FOR JSON PATH
                    ) SubMenus
                FROM [dbo].[Menu] M
                INNER JOIN MenuPermission MP ON M.Id = MP.MenuId
                INNER JOIN Permission P ON P.Id = MP.ReadPermissionId AND P.IsDeleted = 0
                INNER JOIN RolePermission RP ON P.Id = RP.PermissionId AND RP.IsActive = 1
                WHERE RP.RoleId IN @RoleId
                AND M.IsDeleted = 0
                AND M.ParentMenuId IS NULL

                UNION

                SELECT 'Dashboard' MainMenu, 1 OrderNo, '/api/' MainMenuApiEndPoint, NULL SubMenus

                ORDER BY OrderNo;
            ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<MenuResponseDto, string, MenuResponseDto>(
                    sqlQuery,
                    (menu, subMenusJson) =>
                    {
                        if (!string.IsNullOrEmpty(subMenusJson))
                        {
                            menu.SubMenus = string.IsNullOrWhiteSpace(subMenusJson)
                            ? new List<SubMenuModel>()
                            : JsonConvert.DeserializeObject<List<SubMenuModel>>(subMenusJson) ?? new List<SubMenuModel>();

                        }
                        return menu;
                    },
                    new { RoleId = roleId },
                    splitOn: "subMenus"
                );
            }
        }
        public async Task<IEnumerable<ModulePermissionDto>> GetModulePermissionByRole(List<int> roleId)
        {
            // Get the first role ID from the list
            var firstRoleId = roleId.FirstOrDefault();

            var roleExistQuery = "SELECT COUNT(Id) FROM ROLE WHERE Id IN @RoleId";

            var sqlQuery = @"
        SELECT 
            P.Id AS PermissionId,
            P.Name AS PermissionName,
            M.Id AS ModuleId,
            M.ModuleName,

           
            (SELECT Name FROM Role WHERE Id = @FirstRoleId) AS RoleName, 

            MAX(CASE WHEN RP.Id IS NOT NULL THEN 1 ELSE 0 END) AS IsActive,
            P.Value AS PermissionValue

        FROM Permission P
        INNER JOIN Module M ON P.ModuleId = M.Id
        LEFT JOIN RolePermission RP 
            ON RP.PermissionId = P.Id AND RP.RoleId IN @RoleId
        GROUP BY 
            P.Id, P.Name, P.Value, M.Id, M.ModuleName
        ORDER BY M.ModuleName, P.Name;
    ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();

                var resultRoleExist = await connection.QuerySingleOrDefaultAsync<int>(
                    roleExistQuery, new { RoleId = roleId });

                if (resultRoleExist > 0)
                {
                    var result = await connection.QueryAsync<ModulePermissionDto>(
                        sqlQuery,
                        new
                        {
                            RoleId = roleId,
                            FirstRoleId = firstRoleId
                        });

                    return result.ToList();
                }
                else
                {
                    return Enumerable.Empty<ModulePermissionDto>();
                }
            }
        }


        public Task<int> DeleteAsync(EmployeeData entity)
        {
            throw new NotImplementedException();
        }
        public async Task<int> UpdateRefreshToken(RefreshToken refreshToken)
        {
            var sql = @"UPDATE [dbo].[EmployeeData] 
                 SET [RefreshToken]=@RefreshToken,
                     [RefreshTokenExpiryDate]=@RefreshTokenExpiryDate                            
                 WHERE ID=@Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new
                {
                    RefreshToken = refreshToken.TokenValue,
                    RefreshTokenExpiryDate = refreshToken.Expires,
                    Id = refreshToken.UserId
                });
                return result;
            }
        }
        public async Task<RefreshToken?> GetRefreshTokenByEmailId(string emailId)
        {
            var sql = @"SELECT e.RefreshToken TokenValue, e.RefreshTokenExpiryDate Expires
                 FROM EmployeeData e
                 INNER JOIN EmploymentDetail d on d.EmployeeId = e.Id
                 WHERE Email = @Email AND e.IsDeleted=0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QuerySingleOrDefaultAsync<RefreshToken?>(sql, new { Email = emailId });
            }
        }

    }
}
