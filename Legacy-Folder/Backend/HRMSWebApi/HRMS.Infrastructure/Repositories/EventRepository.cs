using System.Data;
using Microsoft.Data.SqlClient;
using System.IO;
using System.Text;
using Dapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.Event;
using Microsoft.Extensions.Configuration;


namespace HRMS.Infrastructure.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly IConfiguration _configuration;
        public EventRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public Task<int> AddAsync(Event entity)
        {
            throw new NotImplementedException();
        }

        public async Task<int> AddEventAsync(Event addEvent, List<EventDocument> eventDocumentList)
        {
            var sql = @"INSERT INTO dbo.Events(Title
                            ,EventCategoryId
                            ,EmpGroupId
                            ,Content
                            ,EventUrl1
                            ,EventUrl2
                            ,EventUrl3
                            ,Venue
                            ,StatusId
                            ,CreatedBy
                            ,CreatedOn
                            ,IsDeleted
                            ,BannerFileName
                            ,EventFeedbackSurveyLink
                            ,StartDate
                            ,EndDate)
                            VALUES(@Title,@EventCategoryId,@EmpGroupId,@Content,@EventUrl1,@EventUrl2,@EventUrl3,@Venue,@StatusId,
                            @CreatedBy,@CreatedOn,0,@BannerFileName,@EventFeedbackSurveyLink,@StartDate,@EndDate);
                            Select CAST(SCOPE_IDENTITY()As INT);";

            var eventDocSql = @"INSERT INTO [dbo].[EventDocument]
                                ([EventId]
                                ,[CreatedBy]
                                ,[CreatedOn]
                                ,[FileName]
                                ,[OriginalFileName])

                            VALUES
                                (@EventId
                                ,@CreatedBy
                                ,@CreatedOn
                                ,@FileName
                                ,@OriginalFileName)";
            
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        int  result = 0;
                        var eventId = await connection.ExecuteScalarAsync<long>(sql, addEvent, transaction);
                       
                        if (eventDocumentList != null && eventDocumentList.Any())
                        {
                            eventDocumentList.ForEach(item =>
                            {
                                item.EventId = eventId;
                            });
                            result = await connection.ExecuteAsync(eventDocSql, eventDocumentList, transaction);
                        }

                        transaction.Commit();
                        return eventDocumentList.Any() ? result : eventId > 0 ? 1 : 0;
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }
            return 0;
        }

        public async Task<int> UpdateEventAsync(Event updateEvent, List<EventDocument> eventDocumentList)
        {
            var sql = @"UPDATE dbo.Events SET
                            Title = @Title
                            ,EventCategoryId = @EventCategoryId
                            ,EmpGroupId = @EmpGroupId
                            ,Content = @Content
                            ,EventUrl1 = @EventUrl1
                            ,EventUrl2 = @EventUrl2
                            ,EventUrl3 = @EventUrl3
                            ,Venue = @Venue
                            ,StatusId = @StatusId
                            ,ModifiedBy = @ModifiedBy
                            ,ModifiedOn = @ModifiedOn 
                            ,EventFeedbackSurveyLink = @EventFeedbackSurveyLink
                            ,StartDate = @StartDate
                            ,EndDate = @EndDate";
                            
            if (!string.IsNullOrWhiteSpace(updateEvent.BannerFileName))
            {
                sql += ",BannerFileName = @BannerFileName";
            }
            sql += " WHERE Id=@Id";

            var eventDocSql = @"INSERT INTO [dbo].[EventDocument]
                                ([EventId]
                                ,[CreatedBy]
                                ,[CreatedOn]
                                ,[FileName]
                                ,[OriginalFileName])
                            VALUES
                                (@EventId
                                ,@CreatedBy
                                ,@CreatedOn
                                ,@FileName
                                ,@OriginalFileName)";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        int result = 0;
                        await connection.ExecuteScalarAsync<long>(sql, updateEvent, transaction);

                        if (eventDocumentList != null && eventDocumentList.Any())
                        {
                            result = await connection.ExecuteAsync(eventDocSql, eventDocumentList, transaction);
                        }
                        
                        transaction.Commit();
                        return eventDocumentList.Any() ? result : updateEvent.Id > 0 ? 1 : 0;
                    }
                    catch (Exception )
                    {
                        transaction.Rollback();
                    }
                }
            }
            return 0;
        }

        public async Task<EventSearchResponseDto> GetEvents(SearchRequestDto<EventSearchRequestDto> requestDto)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT COUNT(id)  AS TotalRecords FROM dbo.Events WHERE IsDeleted = 0 ");

            if (requestDto != null && requestDto.Filters.StatusId != 0)
            {
                query.Append(" and StatusId = @StatusId");
            }
            if (requestDto != null && !string.IsNullOrEmpty(requestDto.Filters.EventName))
            {
                query.Append(" and Title like '%'+@EventName+'%'");
            }

            var sqlQuery = $@"EXEC [dbo].[GetEvents] @EventName,@StatusId,@SortColumnName,@SortColumnDirection,@StartIndex,@PageSize";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                EventSearchResponseDto eventSearchResponseDto = new EventSearchResponseDto();

                connection.Open();
                eventSearchResponseDto.TotalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToString(), new { requestDto!.Filters.StatusId, requestDto!.Filters.EventName });
                eventSearchResponseDto.EventList = await connection.QueryAsync<EventlistResponseDto>(sqlQuery, new { requestDto.Filters.StatusId, requestDto.Filters.EventName, requestDto.SortColumnName, SortColumnDirection = requestDto.SortDirection, requestDto.StartIndex, requestDto.PageSize });
                return eventSearchResponseDto;
            }
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(long id)
        {
            var sql = @"SELECT E.Id,
                                E.Title as EventName,
                                E.StartDate,
                                FORMAT(E.StartDate, 'hh:mm tt') as StartTime,
                                E.EndDate,
                                E.Venue,
                                E.Content,
                                S.StatusValue AS Status,
                                E.EventUrl1 As Link1,
                                E.EventUrl2 As Link2,
                                E.EventUrl3 As Link3,
                                G.GroupName as EmployeeGroup,
                                E.BannerFileName,
                                E.CreatedBy,
                                E.CreatedOn,
                                E.EventFeedbackSurveyLink ,
                                E.EmpGroupId,
                                E.EventCategoryId,
                                E.StatusId
                        FROM dbo.Events E
                        INNER JOIN dbo.[Group] G ON e.EmpGroupId = G.Id
                        INNER JOIN [dbo].[Status] S ON E.StatusId = S.Id
                        Where E.Id = @Id and E.IsDeleted = 0;

                         Select Id,
                                EventId,
                                FileName,
                                OriginalFileName,
                                CreatedOn
                                From [EventDocument]
                                Where IsDeleted = 0 AND EventId=@Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                using (var multi = await connection.QueryMultipleAsync(sql, new { Id = id }))
                {
                    var events = await multi.ReadSingleOrDefaultAsync<EventResponseDto>();
                    if (events != null)
                    {
                        events.eventDocument = (await multi.ReadAsync<EventDocumentResponseDto>());
                    }
                    return events;
                }
            }
        }

        public Task<IReadOnlyList<Event>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<int> UpdateAsync(Event entity)
        {
            throw new NotImplementedException();

        }

        public Task<Event?> GetByIdAsync(long id)
        {
            throw new NotImplementedException();
        }

        public async Task<int> DeleteAsync(Event events)
        {
            var sql = "UPDATE [dbo].[Events] SET [ModifiedBy]=@ModifiedBy,[ModifiedOn] = GETUTCDATE(), IsDeleted=1  WHERE Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { @id = events.Id, @modifiedBy = events.ModifiedBy });
                return result;
            }
        }

        public async Task<EventDocumentResponseDto?> GetEventDocumentByIdAsync(long id)
        {
            var sql = @" Select Id,
                            EventId,
                            FileName,
                            OriginalFileName,
                            CreatedOn
                            From [EventDocument]
                            Where Id=@id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                EventSearchResponseDto eventSearchResponseDto = new EventSearchResponseDto();

                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<EventDocumentResponseDto>(sql.ToString(), new { id });
                return result;
            }
        }

        public async Task<int> DeleteEventDocumentAsync(EventDocument eventDocument)
        {
            var sql = "UPDATE [dbo].[EventDocument] SET [ModifiedBy]=@ModifiedBy,[ModifiedOn] = GETUTCDATE(), IsDeleted=1  WHERE EventId = @EventId AND Id = @Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { eventDocument.Id ,eventDocument.EventId, eventDocument.ModifiedBy });
                return result;
            }
        }


        public async Task<IEnumerable<EventCategory?>> GetEventCategoryListAsync()
        {
            var sql = "SELECT Id,Category FROM EventCategory WHERE IsActive = 1 AND IsDeleted = 0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<EventCategory?>(sql);
                return result;
            }
        }

        public async Task<int> UpdateEventStatusAsync(Event events)
        {
            var sql = @"UPDATE [dbo].[Events] SET [ModifiedBy]=@ModifiedBy,[ModifiedOn] = GETUTCDATE(), StatusId=@StatusId WHERE Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(sql, new { Id =events.Id ,events.StatusId, events.ModifiedBy });
                return result;
            }
        }
    }
}