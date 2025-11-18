using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models;
using HRMS.Domain.Enums;
using HRMS.Domain.Contants;

namespace HRMS.Infrastructure.Repositories
{
    public class NotificationTemplateRepository : INotificationTemplateRepository
    {
        private readonly IConfiguration _configuration;
        public NotificationTemplateRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<EmailTemplateSearchResponseDto> FilterEmailTemplatesAsync(SearchRequestDto<EmailTemplateSearchRequestDto> requestDto)
        {
            var query = @"EXEC [GetNotificationTemplates] @TemplateName,@SenderName,@SenderEmail,@TemplateType,@SortColumnName,@SortColumnDirection,@PageNumber,@PageSize";

            using IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            connection.Open();
            var param = new
            {
                TemplateName = requestDto.Filters.TemplateName ?? "",
                SenderName = requestDto.Filters.SenderName ?? "",
                SenderEmail = requestDto.Filters.SenderEmail ?? "",
                TemplateType = requestDto.Filters.TemplateType,
                PageNumber = requestDto.StartIndex,
                PageSize = requestDto.PageSize,
                SortColumnName = string.IsNullOrWhiteSpace(requestDto.SortColumnName) ? "1" : requestDto.SortColumnName,
                SortColumnDirection = string.Equals(requestDto.SortDirection.ToLower(), "desc") ? "DESC" : "ASC"
            };
            var result = new EmailTemplateSearchResponseDto();
            using (var multi = await connection.QueryMultipleAsync(query, param))
            {

                var totalRecordsList = await multi.ReadAsync<int>();
                result.TotalRecords = totalRecordsList.First();

                var emailTemplatesList = await multi.ReadAsync<EmailTemplateResponseDto>();
                result.emailTemplates = emailTemplatesList.ToList();

            }
            return result;
        }
        public async Task<int> AddAsync(NotificationTemplate entity)
        {
            var sql = @"INSERT INTO [dbo].[NotificationTemplate]
                ([TemplateName] ,[Subject] ,[Content] ,[CreatedBy] ,[CreatedOn], [Type],[Status],[SenderName],[SenderEmail],[CCEmails],[IsDeleted],N.[ToEmail],N.[BCCEmails])
                VALUES(@TemplateName,@Subject ,@Content ,@CreatedBy,@CreatedOn,@Type,@Status,@SenderName,@SenderEmail,@CCEmails, 0,@ToEmail,@BCCEmails)";
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            var result = await connection.ExecuteAsync(sql, entity);
            return result;
        }

        public async Task<int> UpdateAsync(NotificationTemplate entity)
        {
            var sql = @"UPDATE [dbo].[NotificationTemplate] 
                        SET [TemplateName] = @TemplateName,
                            [Subject] = @Subject,
                            [Content] = @Content,
                            [ModifiedBy] = @ModifiedBy,
                            [ModifiedOn] = @ModifiedOn,
                            [Type] = @Type,
                            [SenderName] = @SenderName,
                            [SenderEmail] = @SenderEmail,
                            [CCEmails] = @CCEmails,
                            [BCCEmails]=@BCCEmails
                        WHERE Id = @Id";

            if (entity.Status == EmailTemplateStatus.Active)
            {
                await ChangeEmailTemplateStatus(entity.Id, EmailTemplateStatus.Active);
            }

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            var result = await connection.ExecuteAsync(sql, entity);
            return result;
        }

        public async Task<int> DeleteAsync(long Id)
        {
            var sql = "UPDATE [NotificationTemplate] SET IsDeleted = 1 WHERE Id = @Id";
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            var result = await connection.ExecuteAsync(sql, new { Id = Id });
            return result;
        }

        public async Task ChangeEmailTemplateStatus(long id, EmailTemplateStatus status)
        {
            var disabledSql = @"UPDATE NT SET NT.Status = 0 FROM NotificationTemplate NT WHERE NT.[Type] = (SELECT NT2.[Type] FROM NotificationTemplate NT2 WHERE NT2.Id = @Id) AND NT.Id != @Id AND NT.Status IS NOT NULL;";
            var toggleSql = @"UPDATE [NotificationTemplate] SET [Status] = @Status WHERE Id = @Id;";
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            using (var transaction = await connection.BeginTransactionAsync())
            {
                try
                {
                    var param = new { Id = id, Status = (int)status };
                    await connection.ExecuteAsync(disabledSql, param, transaction);
                    await connection.ExecuteAsync(toggleSql, param, transaction);
                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
        public async Task<bool> IsAnotherTemplateActive(EmailTemplateTypes type, long currentId)
        {
            var sql = @"SELECT COUNT(1) FROM NotificationTemplate 
                        WHERE [Type] = @Type AND [Status] = 1 AND [Id] != @Id AND [IsDeleted] = 0";
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            var count = await connection.ExecuteScalarAsync<int>(sql, new { Type = type, Id = currentId });
            return count > 0;
        }

        public async Task<NotificationTemplate?> GetByIdAsync(long id)
        {
            var sql = @"SELECT 
                        N.Id, N.TemplateName, N.Subject, N.Content, N.[Type], N.[Status], N.[SenderName], N.[SenderEmail], N.[CCEmails], N.[ToEmail],N.[BCCEmails] 
                        FROM NotificationTemplate N 
                        WHERE N.Id = @Id AND N.IsDeleted = 0";
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            return await connection.QuerySingleOrDefaultAsync<NotificationTemplate>(sql, new { Id = id });
        }
        public async Task<NotificationTemplate?> GetDefaultEmailTemplateAsync(EmailTemplateTypes type)
        {
            var sql = @"SELECT TOP 1
                        N.Id, N.TemplateName, N.Subject, N.Content, N.[Type], N.[Status], N.[SenderName], N.[SenderEmail], N.[CCEmails] ,N.[ToEmail],N.[BCCEmails]
                        FROM NotificationTemplate N 
                        WHERE N.[Type] = @TemplateType";
            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();
            return await connection.QuerySingleOrDefaultAsync<NotificationTemplate>(sql, new { TemplateType = type });
        }


        public async Task<NotificationTemplate?> GetNotificationTemplateByType(EmailTemplateTypes type)
        {
            var sql = @"
        SELECT TOP 1 
            N.Id, 
            N.TemplateName, 
            N.Subject, 
            N.Content, 
            N.[Type], 
            N.[Status], 
            N.[SenderName], 
            N.[SenderEmail], 
            N.[CCEmails], 
            N.[ToEmail], 
            N.[BCCEmails]
        FROM NotificationTemplate N
        WHERE N.[Type] = @TemplateType 
          AND N.IsDeleted = 0 
          AND N.[Status] = 1
        ORDER BY N.CreatedOn DESC";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));
            await connection.OpenAsync();

            return await connection.QuerySingleOrDefaultAsync<NotificationTemplate>(sql, new
            {
                TemplateType = (int)type
            });
        }



        public Task<int> DeleteAsync(NotificationTemplate entity)
        {
            throw new NotImplementedException();
        }
        public Task<IReadOnlyList<NotificationTemplate>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteTemplateAsync(long id)
        {
            var sql = @"UPDATE NotificationTemplate 
                SET IsDeleted = 1 
                WHERE Id = @id";

            using var connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection));

            var affectedRows = await connection.ExecuteAsync(sql, new { id });

            return affectedRows > 0;
        }


    }
}
