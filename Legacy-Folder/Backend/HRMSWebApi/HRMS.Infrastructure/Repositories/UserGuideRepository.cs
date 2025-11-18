using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Dapper;
using HRMS.Domain;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.UserGuide;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;


namespace HRMS.Infrastructure.Repositories
{
    public class UserGuideRepository : IUserGuideRepository
    {
        private readonly IConfiguration _configuration;
        public UserGuideRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task AddUserGuideAsync(UserGuide entity)
        {
            var sql = @"
        INSERT INTO [dbo].[UserGuide] 
            (MenuId, RoleId, Title, Content, IsDeleted, Status, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn)
        VALUES 
            (@MenuId, @RoleId, @Title, @Content, 0, @Status, @CreatedOn, @CreatedBy, NULL, NULL);
        SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
    ";

            using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            connection.Open();

            var id = await connection.QuerySingleAsync<long>(sql, entity);
            entity.Id = id;
        }



        public async Task<IEnumerable<MenuResponseDto>> GetAllMenuNameAsync()
        {
            var sql = @"
        SELECT 
            M.Id AS Id,
            M.Name AS Name,
            S.Id AS Id,
            S.Name AS Name
        FROM dbo.Menu AS M
        LEFT JOIN dbo.Menu AS S
            ON S.ParentMenuId = M.Id
            AND (S.IsDeleted = 0 OR S.IsDeleted IS NULL)
        WHERE M.ParentMenuId IS NULL
          AND (M.IsDeleted = 0 OR M.IsDeleted IS NULL)
        ORDER BY M.Id, S.Id;
    ";

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            var menuDictionary = new Dictionary<int, MenuResponseDto>();

            var menus = await connection.QueryAsync<MenuResponseDto, SubMenuResponseDto, MenuResponseDto>(
                sql,
                (menu, submenu) =>
                {
                    if (!menuDictionary.TryGetValue(menu.Id, out var menuEntry))
                    {
                        menuEntry = menu;
                        menuEntry.SubMenus = new List<SubMenuResponseDto>();
                        menuDictionary.Add(menuEntry.Id, menuEntry);
                    }

                    if (submenu != null && submenu.Id != 0)
                    {
                        menuEntry.SubMenus.Add(submenu);
                    }

                    return menuEntry;
                },
                splitOn: "Id" 
            );

            return menuDictionary.Values;
        }




        public async Task<UserGuideResponseListDto> GetAllUserGuideAsync(SearchRequestDto<GetAllUserGuideRequestDto> request)
        {
            var filters = request.Filters;
            var parameters = new DynamicParameters();
            var where = "UG.IsDeleted = 0";

            if (!string.IsNullOrWhiteSpace(filters.MenuName))
            {
                where += " AND M.Name LIKE @MenuName";
                parameters.Add("@MenuName", $"%{filters.MenuName}%");
            }
            if (filters.Status.HasValue)
            {
                where += " AND UG.Status = @Status";
                parameters.Add("@Status", (int)filters.Status);
            }
            if (filters.CreatedOn.HasValue)
            {
                where += " AND CAST(UG.CreatedOn AS DATE) = @CreatedOn";
                parameters.Add("@CreatedOn", filters.CreatedOn.Value.ToDateTime(new TimeOnly(0, 0)));
            }
            if (filters.ModifiedOn.HasValue)
            {
                where += " AND CAST(UG.ModifiedOn AS DATE) = @ModifiedOn";
                parameters.Add("@ModifiedOn", filters.ModifiedOn.Value.ToDateTime(new TimeOnly(0, 0)));
            }
            if (!string.IsNullOrWhiteSpace(filters.Title))
            {
                where += " AND UG.Title LIKE @Title";
                parameters.Add("@Title", $"%{filters.Title}%");
            }

            // Pagination: page number starts from 1
            int page = request.StartIndex < 1 ? 1 : request.StartIndex;
            int size = request.PageSize <= 0 ? 10 : request.PageSize;
            int offset = (page - 1) * size;

            // Sorting
            string sortCol = string.IsNullOrWhiteSpace(request.SortColumnName) ? "UG.CreatedOn" : request.SortColumnName;
            string sortDir = request.SortDirection?.ToUpper() == "ASC" ? "ASC" : "DESC";

            string query = $@"
                SELECT 
                    UG.Id, M.Name AS MenuName, UG.RoleId, UG.Content, UG.Status,
                    UG.CreatedOn, UG.CreatedBy, UG.ModifiedBy, UG.ModifiedOn, UG.Title
                FROM UserGuide UG
                LEFT JOIN Menu M ON M.Id = UG.MenuId
                WHERE {where}
                ORDER BY {sortCol} {sortDir}
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

                SELECT COUNT(*) FROM UserGuide UG
                LEFT JOIN Menu M ON M.Id = UG.MenuId
                WHERE {where};
                                ";

            parameters.Add("@Offset", offset);
            parameters.Add("@PageSize", size);

            using var conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            using var multi = await conn.QueryMultipleAsync(query, parameters);

            return new UserGuideResponseListDto
            {
                UserGuideList = (await multi.ReadAsync<UserGuideResponseDto>()).ToList(),
                TotalRecords = await multi.ReadFirstAsync<int>()
            };
        }



        public async Task UpdateUserGuideAsync(UserGuide entity)
        {
            var sql = @"
        UPDATE [dbo].[UserGuide]
        SET 
            
            RoleId = @RoleId,
            Title = @Title,
            Content = @Content,
            Status = @Status,
            ModifiedBy = @ModifiedBy,
            ModifiedOn = @ModifiedOn
        WHERE Id = @Id
        AND (IsDeleted = 0 OR IsDeleted IS NULL)";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.ExecuteAsync(sql, new
                {
                    entity.MenuId,
                    entity.RoleId,
                    entity.Title,
                    entity.Content,
                    Status = entity.Status,
                    ModifiedBy = entity.ModifiedBy,
                    ModifiedOn = entity.ModifiedOn,
                    entity.Id
                });
            }
        }

        public async Task<UserGuideByMenuIdDto?> GetUserGuideByMenuIdAsync(long menuId)
        {
            var sql = @"
        SELECT 
            Id,
            Title,
            Content
        FROM [dbo].[UserGuide]
        WHERE MenuId = @MenuId
          AND Status = 1
          AND (IsDeleted = 0 OR IsDeleted IS NULL)
    ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<UserGuideByMenuIdDto>(sql, new { MenuId = menuId });
                return result;
            }
        }

        public async Task<bool> DeleteUserGuideByIdAsync(long userGuideId, string modifiedBy, DateTime modifiedOn)
        {
            var sql = @"
        UPDATE [dbo].[UserGuide]
        SET IsDeleted = 1,
            ModifiedOn = @ModifiedOn,
            ModifiedBy = @ModifiedBy
        WHERE Id = @UserGuideId AND IsDeleted = 0
    ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var parameters = new
                {
                    UserGuideId = userGuideId,
                    ModifiedOn = modifiedOn,
                    ModifiedBy = modifiedBy
                };

                var rowsAffected = await connection.ExecuteAsync(sql, parameters);
                return rowsAffected > 0;
            }
        }

        public async Task<UserGuideById?> GetUserGuideByIdAsync(long Id)
        {
            var sql = @"
        SELECT 
            Id,
            Title,
            Content,
            Status,
            MenuId,
            RoleId 
        FROM [dbo].[UserGuide]
        WHERE Id = @Id
          AND (IsDeleted = 0 OR IsDeleted IS NULL)
    ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<UserGuideById>(sql, new { Id = Id });
                return result;
            }
        }
    }
}









