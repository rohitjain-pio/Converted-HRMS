using HRMS.Infrastructure.Interface;
using HRMS.Models.Models.SystemNotification;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models.Models.Employees;
using HRMS.Domain.Contants;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.Grievance;
using HRMS.Models.Models.EmailNotificationTemplate;
using HRMS.Domain.Enums;
using HRMS.Models.Models.KPI;

namespace HRMS.Infrastructure.Repositories
{
    public class EmailNotificationRepository : IEmailNotificationRepository
    {
        private readonly IConfiguration _configuration;
        public EmailNotificationRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<IEnumerable<AnniversaryDto>> GetAnniversaryData()
        {
            var baseUrl = "https://";
            var defaultPhotoUrl = "https://avatar.iran.liara.run/public/16";

            var sql = @"
        SELECT 
            D.Email,
            FirstName, 
            MiddleName, 
            LastName,
            DATEDIFF(YEAR, JoiningDate, GETUTCDATE()) AS YearsOfService,
            de.Designation,
            CASE 
                WHEN E.FileName IS NULL OR E.FileName = '' 
                    THEN @DefaultPhotoUrl
                ELSE CONCAT(@BaseUrl, E.FileName)
            END AS ProfilePhoto
        FROM [dbo].[EmployeeData] E
        INNER JOIN [dbo].[EmploymentDetail] D ON E.Id = D.EmployeeId
        INNER JOIN [dbo].[Designation] de ON de.Id = D.DesignationId
        WHERE 
            DAY(JoiningDate) = DAY(GETUTCDATE())
            AND MONTH(JoiningDate) = MONTH(GETUTCDATE())
            AND YEAR(JoiningDate) <> YEAR(GETUTCDATE())
            AND E.IsDeleted = 0";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<AnniversaryDto>(sql, new { BaseUrl = baseUrl, DefaultPhotoUrl = defaultPhotoUrl });
                return result;
                
            }
        }


        public async Task<IEnumerable<BirthdayDto>> GetBithdayData()
        {
            var baseUrl = $"https://";
            var defaultPhotoUrl = "https://avatar.iran.liara.run/public/16";

            var sql = @"SELECT D.Email,FirstName, MiddleName, LastName,DOB,de.Designation,
            CASE 
                WHEN E.FileName IS NULL OR E.FileName = '' 
                    THEN @DefaultPhotoUrl
                ELSE CONCAT(@BaseUrl, E.FileName)
            END AS ProfilePhoto
                       FROM [dbo].[EmployeeData]  E
                       INNER JOIN [dbo].[EmploymentDetail] D ON E.Id = D.EmployeeId
					   INNER JOIN [dbo].Designation de ON de.Id = D.DesignationId
                       WHERE DAY(E.DOB) = DAY(GETUTCDATE()) AND MONTH(E.DOB) = MONTH(GETUTCDATE()) AND E.IsDeleted =0";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<BirthdayDto>(sql, new { BaseUrl = baseUrl, DefaultPhotoUrl = defaultPhotoUrl });

            }
        }
        public async Task<int> AddNotificationAsync(EmailNotification notification)
        {
            var sql = @"IF NOT EXISTS(SELECT 1 FROM EmailNotification WHERE TemplateId = @TemplateId AND ToEmail= @ToEmail AND CAST(CreatedOn AS DATE)= CAST(@CreatedOn AS DATE))
                         BEGIN
                             INSERT INTO dbo.EmailNotification(TemplateId
                            ,ToEmail
                            ,FromEmail
                            ,Subject
                            ,Body
                            ,CC
                            ,SentStatus
                            ,CreatedOn
                            ,SentOn)
                            VALUES(@TemplateId,@ToEmail,@FromEmail,@Subject,@Body,@CC,@SentStatus,@CreatedOn,@SentOn)
                          END";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                try
                {
                    connection.Open();
                    return await connection.ExecuteAsync(sql, notification);
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Error in Adding", ex);
                }

            }
        }


        public async Task<EmailTemplateResponseDto?> GetNotificationTemplateByName(string name)
        {
            var sql = @"SELECT Id,TemplateName,Description,Content from [dbo].[NotificationTemplate] WHERE TemplateName=@name";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QuerySingleOrDefaultAsync<EmailTemplateResponseDto>(sql, new { name = name });
            }
        }
        public async Task<IEnumerable<EmailNotification>> GetNotificationAsync()
        {
            var sql = @"SELECT ID
                            ,TemplateId
                            ,ToEmail
                            ,FromEmail
                            ,Subject
                            ,Body
                            ,CC
                            ,SentStatus
                            ,CreatedOn
                            ,SentOn
                           FROM dbo.EmailNotification WHERE SentStatus=0;";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<EmailNotification>(sql);
            }
        }
        public async Task<int> MarkAsSentAsync(long Id)
        {
            var query = @"UPDATE EmailNotification SET SentOn = GETUTCDATE(),SentStatus =1 WHERE ID =@Id";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.ExecuteAsync(query, new { @id = Id });
            }
        }
        public async Task<IEnumerable<WelcomeDto>> GetWelcomeData(string email)
        {
            var baseUrl = $"https://";
            var defaultPhotoUrl = "https://avatar.iran.liara.run/public/16";

            var sql = @"
            SELECT 
                D.Email,
                E.FirstName,
                E.MiddleName,
                E.LastName,
                de.Designation,
                CASE 
                WHEN E.FileName IS NULL OR E.FileName = '' 
                    THEN @DefaultPhotoUrl
                ELSE CONCAT(@BaseUrl, E.FileName)
            END AS ProfilePhoto,
                Dept.Department AS Departmentname,
                D.BranchId AS Branch
            FROM [dbo].[EmployeeData] E
            INNER JOIN [dbo].[EmploymentDetail] D ON E.Id = D.EmployeeId
            INNER JOIN [dbo].[Designation] de ON de.Id = D.DesignationId
            INNER JOIN [dbo].[Department] Dept ON Dept.Id = D.DepartmentId
          WHERE D.Email = @EmailId AND E.IsDeleted = 0
          AND CAST(D.JoiningDate AS DATE) = CAST(GETUTCDATE() AS DATE);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                var result = await connection.QueryAsync<WelcomeDto>(sql, new { BaseUrl = baseUrl, DefaultPhotoUrl = defaultPhotoUrl, EmailId = email });
                return result;
            }
        }

        public async Task<IEnumerable<ResignationDto>> GetApprovedResignationsAsync(long resignationId)
        {
            var sql = @"
          SELECT 
            D.Email,
            E.FirstName, 
            E.MiddleName,
            E.LastName,
            R.LastWorkingDay,
            R.Reason,
            Dept.Department AS DepartmentName,
            RM.FirstName + ' ' + RM.LastName AS ReportingManagerName,
            ED.Email AS ReportingManagerEmail
        FROM dbo.Resignation R
        INNER JOIN dbo.EmployeeData E ON R.EmployeeId = E.Id
        INNER JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
        LEFT JOIN dbo.Department Dept ON R.DepartmentID = Dept.Id
        LEFT JOIN dbo.EmployeeData RM ON R.ReportingManagerId = RM.Id
		LEFT JOIN dbo.EmploymentDetail ED ON RM.Id = ED.EmployeeId
        WHERE R.Status = 3  -- ResignationApproved status
          AND E.IsDeleted = 0
          AND R.Id = @resignationId;
";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<ResignationDto>(sql, new { ResignationId = resignationId });
            }
        }

        public async Task<IEnumerable<GrievanceDto>> GetGrievanceData(string TicketNo)
        {

            var sql = @"
        SELECT 
            D.Email,
            E.FirstName, 
            E.MiddleName,
            E.LastName         
        FROM dbo.EmployeeGrievance EG
        LEFT JOIN dbo.EmployeeData E ON EG.EmployeeId = E.Id
        LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
        WHERE  EG.TicketNo = @TicketNo
          ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString(ConnectionStrings.DefaultConnection)))
            {
                connection.Open();
                return await connection.QueryAsync<GrievanceDto>(sql, new { TicketNo = TicketNo });
            }
        }

        public async Task<IEnumerable<GrievanceOwnerEmail>> GetGrievanceOwner(string TicketNo)
        {
            var sql = @"
                SELECT DISTINCT
                    D.Email AS OwnerEmail
                FROM dbo.EmployeeGrievance EG
                LEFT JOIN dbo.GrievanceOwner GO ON GO.GrievanceTypeId = EG.GrievanceTypeId
                LEFT JOIN dbo.EmployeeData E ON GO.OwnerID = E.Id
                LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
                WHERE EG.TicketNo = @TicketNo
                AND GO.IsDeleted = 0
            ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.QueryAsync<GrievanceOwnerEmail>(sql, new { TicketNo });
            }
        }


        public async Task<AppliedLeaveDto> GetAppliedLeaveAsync(long employeeId, int leaveId)
        {
            var sql = @"
            SELECT TOP 1
                D.Email,
                E.FirstName, 
                E.MiddleName,
                E.LastName,
                AL.StartDate,
                AL.StartDateSlot,
                AL.EndDate,
                AL.EndDateSlot,
                AL.TotalLeaveDays,
                ED.Email AS ReportingManagerEmail 
            FROM dbo.AppliedLeaves AL
            LEFT JOIN dbo.EmployeeData E ON AL.EmployeeId = E.Id
            LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
            LEFT JOIN dbo.EmployeeData RM ON AL.ReportingManagerId = RM.Id
            LEFT JOIN dbo.EmploymentDetail ED ON RM.Id = ED.EmployeeId
            WHERE AL.Status = 1
            AND AL.EmployeeId = @EmployeeId
            AND AL.LeaveId = @LeaveId
            ORDER BY AL.CreatedOn DESC;";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();

                var result = await connection.QueryFirstOrDefaultAsync<AppliedLeaveDto>(sql, new
                {
                    EmployeeId = employeeId,
                    LeaveId = leaveId
                });

                return result;
            }
        }

        public async Task<ApprovalLeaveDto> GetApprovalLeaveAsync(int appliedLeaveId)
        {
            var sql = @"
            SELECT 
                D.Email,
                E.FirstName, 
                E.MiddleName,
                E.LastName,
                AL.CreatedOn,
                AL.StartDate,
                AL.StartDateSlot,
                AL.EndDate,
                AL.EndDateSlot,
                AL.TotalLeaveDays,
                Al.Reason,
                Al.LeaveId
            FROM dbo.AppliedLeaves AL
            LEFT JOIN dbo.EmployeeData E ON AL.EmployeeId = E.Id
            LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
            WHERE AL.Id = @AppliedLeaveId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();

                var result = await connection.QueryFirstOrDefaultAsync<ApprovalLeaveDto>(sql, new
                {
                    AppliedLeaveId = appliedLeaveId
                });

                return result;

            }

        }

        public async Task<RejectedLeaveDto> GetRejectedLeaveAsync(int appliedLeaveId)
        {
            var sql = @"
            SELECT 
                D.Email,
                E.FirstName, 
                E.MiddleName,
                E.LastName,
                AL.CreatedOn,
                AL.StartDate,
                AL.StartDateSlot,
                AL.EndDate,
                AL.EndDateSlot,
                AL.TotalLeaveDays,
                AL.Reason,
                Al.RejectReason,
                Al.LeaveId
            FROM dbo.AppliedLeaves AL
            LEFT JOIN dbo.EmployeeData E ON AL.EmployeeId = E.Id
            LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
            WHERE AL.Id = @AppliedLeaveId";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();

                var result = await connection.QueryFirstOrDefaultAsync<RejectedLeaveDto>(sql, new
                {
                    AppliedLeaveId = appliedLeaveId
                });

                return result;
            }
        }

        public async Task<ResignationDto> GetResignationAsync(long employeeId)
        {
            var sql = @"
            SELECT 
            D.Email,
            E.FirstName, 
            E.MiddleName,
            E.LastName,
            R.LastWorkingDay,
            R.Reason,
            R.CreatedOn,
            Dept.Department AS DepartmentName,
             RM.FirstName + ' ' + RM.LastName AS ReportingManagerName,
             ED.Email AS ReportingManagerEmail         
        FROM dbo.Resignation R
        LEFT JOIN dbo.EmployeeData E ON R.EmployeeId = E.Id
        LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
        LEFT JOIN dbo.Department Dept ON R.DepartmentID = Dept.Id
        LEFT JOIN dbo.EmployeeData RM ON R.ReportingManagerId = RM.Id
        LEFT JOIN dbo.EmploymentDetail ED ON RM.Id = ED.EmployeeId
        WHERE R.EmployeeId = @EmployeeId ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<ResignationDto>(sql, new
                {
                    EmployeeId = employeeId
                });

                return result;
            }
        }

        public async Task<ResignationDto> GetResignationByIdAsync(long resignationId)
        {
            var sql = @"
            SELECT 
            D.Email,
            E.FirstName, 
            E.MiddleName,
            E.LastName,
            R.LastWorkingDay,
            R.Reason,
            R.CreatedOn,
            R.RejectResignationReason,
            R.EarlyReleaseDate,
            Dept.Department AS DepartmentName,
            E.PersonalEmail,
             RM.FirstName + ' ' + RM.LastName AS ReportingManagerName,
             ED.Email AS ReportingManagerEmail         
        FROM dbo.Resignation R
        LEFT JOIN dbo.EmployeeData E ON R.EmployeeId = E.Id
        LEFT JOIN dbo.EmploymentDetail D ON E.Id = D.EmployeeId
        LEFT JOIN dbo.Department Dept ON R.DepartmentID = Dept.Id
        LEFT JOIN dbo.EmployeeData RM ON R.ReportingManagerId = RM.Id
        LEFT JOIN dbo.EmploymentDetail ED ON RM.Id = ED.EmployeeId
        WHERE R.Id = @ResignationId ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryFirstOrDefaultAsync<ResignationDto>(sql, new
                {
                    ResignationId = resignationId
                });

                return result;
            }
        }

        public async Task<IEnumerable<EmailId>> GetAllEmailByRole(Roles role)
        {
            var sql = @"

           SELECT DISTINCT E.Email 
           FROM EmploymentDetail E 
           LEFT JOIN UserRoleMapping UR ON UR.EmployeeId = E.EmployeeId
           WHERE UR.RoleId = @Role
            ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.QueryAsync<EmailId>(sql, new { Role = role });
            }

        }

        public async Task<KPIEmail?> KPICompleteData(long planId)
        {
            var sql = @"
        SELECT 
            ed.Email,
            emp.FirstName,
            emp.MiddleName,
            emp.LastName,
            CONCAT(
                mgr.FirstName, 
                COALESCE(CONCAT(' ', mgr.MiddleName), ''), 
                ' ', 
                mgr.LastName
            ) AS ReportingManagerName,
            k.ReviewDate
        FROM KPIPLan k
        LEFT JOIN EmployeeData emp ON emp.Id = k.EmployeeId
        LEFT JOIN EmploymentDetail ed ON emp.Id = ed.EmployeeId
        LEFT JOIN EmployeeData mgr ON mgr.Id = ed.ReportingMangerId
        WHERE k.Id = @planId AND k.IsReviewed = 1;
    ";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.QuerySingleOrDefaultAsync<KPIEmail>(sql, new { planId });
            }
        }


    }
}
