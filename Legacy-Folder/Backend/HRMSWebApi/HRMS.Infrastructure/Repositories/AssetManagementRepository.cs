using HRMS.Domain.Entities;
using HRMS.Infrastructure.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using HRMS.Domain.Utility;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Asset;
using AssetCondition = HRMS.Domain.Enums.AssetCondition;

namespace HRMS.Infrastructure.Repositories
{
    public class AssetManagementRepository : IAssetManagementRepository
    {

        private readonly IConfiguration _configuration;
        public AssetManagementRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            SqlMapper.AddTypeHandler(new SqlDateOnlyTypeHandler());
            SqlMapper.AddTypeHandler(new SqlTimeOnlyTypeHandler());
        }

        public async Task<EmployeeAssetListResponseDto> GetAllEmployeeAssetAsync(SearchRequestDto<EmployeeAssetSearchRequestDto> requestDto)
        {
            var response = new EmployeeAssetListResponseDto();
            var parameters = new DynamicParameters();

            // Pagination 
            int offset = (requestDto.StartIndex - 1) * requestDto.PageSize;
            parameters.Add("Offset", offset < 0 ? 0 : offset);
            parameters.Add("PageSize", requestDto.PageSize);

            // Add filter 
            parameters.Add("AssetName", string.IsNullOrWhiteSpace(requestDto.Filters?.AssetName) ? null : requestDto.Filters.AssetName);

            // Set sort column and direction 
            string sortColumn = requestDto.SortColumnName;
            if (string.IsNullOrWhiteSpace(sortColumn) ||
                (sortColumn != "AssetName" && sortColumn != "AssetNumber" &&
                 sortColumn != "Brand" && sortColumn != "Model" &&
                 sortColumn != "Custodian" && sortColumn != "LastUpdate"))
            {
                sortColumn = "LastUpdate"; // default sort 
            }

            string sortDirection = requestDto.SortDirection?.ToUpper() == "ASC" ? "ASC" : "DESC";

            // SQL Query
            string sql = $@"
        SELECT 
            ea.Id,
            ea.AssetId AS AssetID,
            ea.IsActive,
            ita.AssetType AS AssetName,
            ita.SerialNumber AS AssetNumber,
            ita.Manufacturer AS Brand,
            ita.Model,
            ed.Email AS Custodian,
            ea.ModifiedOn AS LastUpdate
        FROM EmployeeAsset ea
        INNER JOIN ITAsset ita ON ea.AssetId = ita.Id
        LEFT JOIN EmploymentDetail ed ON ea.EmployeeId = ed.EmployeeId
        WHERE (@AssetName IS NULL OR ita.AssetType LIKE '%' + @AssetName + '%')
        ORDER BY {sortColumn} {sortDirection}
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

        SELECT COUNT(1)
        FROM EmployeeAsset ea
        INNER JOIN ITAsset ita ON ea.AssetId = ita.Id
        WHERE (@AssetName IS NULL OR ita.AssetType LIKE '%' + @AssetName + '%');
    ";

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            using var multi = await connection.QueryMultipleAsync(sql, parameters);
            response.EmployeeAssetList = (await multi.ReadAsync<EmployeeAssetResponseDto>()).ToList();
            response.TotalRecords = await multi.ReadSingleAsync<int>();

            return response;
        }


        public async Task<bool> UpsertEmployeeAssetAsync(EmployeeAsset employeeAsset)
        {
            var checkAssetSql = @"
        SELECT COUNT(1) 
        FROM EmployeeAsset 
        WHERE EmployeeId = @EmployeeId";

            var insertSql = @"
        INSERT INTO EmployeeAsset (EmployeeId, AssetId, AssignedOn, IsActive, CreatedBy, CreatedOn)
        VALUES (@EmployeeId, @AssetId, @AssignedOn, @IsActive, @CreatedBy, @CreatedOn)";

            var updateSql = @"
        UPDATE EmployeeAsset
        SET AssignedOn = @AssignedOn,
            AssetId = @AssetId,
            IsActive = @IsActive,
            ModifiedBy = @ModifiedBy,
            ModifiedOn = @ModifiedOn
        WHERE EmployeeId = @EmployeeId";

            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.OpenAsync();

                var assetExists = await connection.ExecuteScalarAsync<bool>(checkAssetSql, new
                {
                    employeeAsset.EmployeeId
                });

                var parameters = new
                {
                    employeeAsset.EmployeeId,
                    employeeAsset.AssetId,
                    employeeAsset.AssignedOn,
                    employeeAsset.IsActive,
                    employeeAsset.CreatedBy,
                    employeeAsset.CreatedOn,
                    employeeAsset.ModifiedBy,
                    employeeAsset.ModifiedOn
                };

                if (assetExists)
                {
                    await connection.ExecuteAsync(updateSql, parameters);
                }
                else
                {
                    await connection.ExecuteAsync(insertSql, parameters);
                }

                return true;
            }
        }
        public async Task<ITAssetListResponseDto> GetAllITAssetAsync(SearchRequestDto<ITAssetSearchRequestDto> requestDto)
        {
            var response = new ITAssetListResponseDto();
            var parameters = new DynamicParameters();

            // Pagination
            int startIndex = (requestDto.StartIndex - 1) * requestDto.PageSize;
            parameters.Add("StartIndex", startIndex < 0 ? 0 : startIndex); 
            parameters.Add("PageSize", requestDto.PageSize);

            // Filters
            parameters.Add("DeviceName", string.IsNullOrWhiteSpace(requestDto.Filters?.DeviceName) ? null : requestDto.Filters.DeviceName);
            parameters.Add("DeviceCode", string.IsNullOrWhiteSpace(requestDto.Filters?.DeviceCode) ? null : requestDto.Filters.DeviceCode);
            parameters.Add("Manufacturer", string.IsNullOrWhiteSpace(requestDto.Filters?.Manufacturer) ? null : requestDto.Filters.Manufacturer);
            parameters.Add("Model", string.IsNullOrWhiteSpace(requestDto.Filters?.Model) ? null : requestDto.Filters.Model);
            parameters.Add("AssetType", (requestDto.Filters?.AssetType != null && requestDto.Filters.AssetType != 0) ? (int?)requestDto.Filters.AssetType : null);
            parameters.Add("Status", (requestDto.Filters?.AssetStatus != null && requestDto.Filters.AssetStatus != 0) ? (int?)requestDto.Filters.AssetStatus : null);
            parameters.Add("Branch", (requestDto.Filters?.Branch != null && requestDto.Filters.Branch != 0) ? (int?)requestDto.Filters.Branch : null);
            parameters.Add("EmployeeCodes", string.IsNullOrWhiteSpace(requestDto.Filters?.EmployeeCodes) ? null : requestDto.Filters.EmployeeCodes);

            // Sorting
            string sortColumn = requestDto.SortColumnName;
            parameters.Add("SortColumn", string.IsNullOrWhiteSpace(sortColumn) ? null : sortColumn); 
            parameters.Add("SortDesc", requestDto.SortDirection?.ToUpper() == "ASC" ? 0 : 1);

            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            using var multi = await connection.QueryMultipleAsync("GetAllITAsset", parameters, commandType: CommandType.StoredProcedure);

            
            response.TotalRecords = await multi.ReadSingleAsync<int>();
            response.ITAssetList = (await multi.ReadAsync<ITAssetsListResponseDto>()).ToList();

            return response;
        }


        public async Task<bool> UpsertITAssetAsync(ITAsset createdAsset, bool? historyFlag, string? Note)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            const string checkSql = "SELECT COUNT(1) FROM ITAsset WHERE Id = @Id";

            var exists = await connection.ExecuteScalarAsync<bool>(checkSql, new { createdAsset.Id });

            if (exists)
            {
                const string updateSql = @"
            UPDATE ITAsset
            SET 
                DeviceName = @DeviceName,
                DeviceCode = @DeviceCode,
                SerialNumber = @SerialNumber,
                InvoiceNumber = @InvoiceNumber,
                Manufacturer = @Manufacturer,
                Model = @Model,
                AssetType = @AssetType,
                Status = @Status,
                AssetCondition = @AssetCondition, 
                Branch = @Branch,
                PurchaseDate = @PurchaseDate,
                WarrantyExpires = @WarrantyExpires,
                Specification = @Specification,
                Comments = @Comments,
                ProductFileOriginalName = @ProductFileOriginalName,
                ProductFileName = @ProductFileName,
                SignatureFileOriginalName = @SignatureFileOriginalName,
                SignatureFileName = @SignatureFileName,
                ModifiedBy = @ModifiedBy,
                ModifiedOn = @ModifiedOn
            WHERE Id = @Id";

                var parameters = new
                {
                    createdAsset.Id,
                    createdAsset.DeviceName,
                    createdAsset.DeviceCode,
                    createdAsset.SerialNumber,
                    createdAsset.InvoiceNumber,
                    createdAsset.Manufacturer,
                    createdAsset.Model,
                    createdAsset.AssetType,
                    createdAsset.Status,
                    createdAsset.AssetCondition,
                    createdAsset.Branch,
                    createdAsset.PurchaseDate,
                    createdAsset.WarrantyExpires,
                    createdAsset.Specification,
                    createdAsset.Comments,
                    createdAsset.ProductFileOriginalName,
                    createdAsset.ProductFileName,
                    createdAsset.SignatureFileOriginalName,
                    createdAsset.SignatureFileName,
                    createdAsset.ModifiedBy,
                    createdAsset.ModifiedOn
                };

                var affected = await connection.ExecuteAsync(updateSql, parameters);

                if (affected > 0)
                {
                    // Fetch the active employee for this asset
                    const string employeeQuery = @"
                SELECT TOP 1 EmployeeId 
                FROM EmployeeAsset 
                WHERE AssetId = @AssetId AND IsActive = 1";

                    long? employeeId = await connection.ExecuteScalarAsync<long?>(employeeQuery, new { AssetId = createdAsset.Id });

                    DateTime? assignedOn = null;

                    if (historyFlag == true && employeeId.HasValue)
                    {
                        const string assignedOnQuery = @"
                    SELECT TOP 1 AssignedOn
                    FROM EmployeeAsset
                    WHERE AssetId = @AssetId AND EmployeeId = @EmployeeId AND IsActive = 1";

                        assignedOn = await connection.ExecuteScalarAsync<DateTime?>(assignedOnQuery, new { AssetId = createdAsset.Id, EmployeeId = employeeId.Value });
                    }

                    if (historyFlag == true)
                    {
                        const string historySql = @"
                    INSERT INTO ITAssetHistory (
                        AssetId, EmployeeId, Status, AssetCondition,
                        Note, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, IssueDate
                    )
                    VALUES (
                        @AssetId, @EmployeeId, @Status, @AssetCondition,
                        @Note, @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn, @IssueDate
                    )";

                        await connection.ExecuteAsync(historySql, new
                        {
                            AssetId = createdAsset.Id,
                            EmployeeId = employeeId,
                            Status = createdAsset.Status,
                            AssetCondition = createdAsset.AssetCondition,
                            Note = Note,
                            CreatedBy = createdAsset.ModifiedBy,
                            CreatedOn = DateTime.UtcNow,
                            ModifiedBy = createdAsset.ModifiedBy,
                            ModifiedOn = DateTime.UtcNow,
                            IssueDate = assignedOn
                        });
                    }
                }

                return affected > 0;
            }
            else
            {
                const string insertSql = @"
            INSERT INTO ITAsset (
                DeviceName, DeviceCode, SerialNumber, InvoiceNumber, Manufacturer,
                Model, AssetType, Status, AssetCondition, Branch, PurchaseDate,
                WarrantyExpires, Specification, Comments,
                ProductFileOriginalName, ProductFileName, SignatureFileOriginalName, SignatureFileName,
                CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
            ) VALUES (
                @DeviceName, @DeviceCode, @SerialNumber, @InvoiceNumber, @Manufacturer,
                @Model, @AssetType, @Status, @AssetCondition, @Branch, @PurchaseDate,
                @WarrantyExpires, @Specification, @Comments,
                @ProductFileOriginalName, @ProductFileName, @SignatureFileOriginalName, @SignatureFileName,
                @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn
            )";

                var parameters = new
                {
                    createdAsset.DeviceName,
                    createdAsset.DeviceCode,
                    createdAsset.SerialNumber,
                    createdAsset.InvoiceNumber,
                    createdAsset.Manufacturer,
                    createdAsset.Model,
                    createdAsset.AssetType,
                    createdAsset.Status,
                    createdAsset.AssetCondition,
                    createdAsset.Branch,
                    createdAsset.PurchaseDate,
                    createdAsset.WarrantyExpires,
                    createdAsset.Specification,
                    createdAsset.Comments,
                    createdAsset.ProductFileOriginalName,
                    createdAsset.ProductFileName,
                    createdAsset.SignatureFileOriginalName,
                    createdAsset.SignatureFileName,
                    createdAsset.CreatedBy,
                    createdAsset.CreatedOn,
                    createdAsset.ModifiedBy,
                    createdAsset.ModifiedOn
                };

                var affected = await connection.ExecuteAsync(insertSql, parameters);

                return affected > 0;
            }
        }


        public async Task<IEnumerable<EmployeeITAssetResponseDto>> GetEmployeeAssetByIdAsync(long employeeId)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            var sql = @"
            SELECT
                ea.Id AS AssetId,
                ia.SerialNumber,
                ia.DeviceCode,
                ia.Manufacturer,
                ia.Model,
                ia.Status AS AssetStatus,
                ia.AssetType,
                ea.AssignedOn,
                ia.Branch,
                ISNULL(ea.ReturnCondition, ia.AssetCondition) AS AssetCondition,
                ea.ReturnDate,
                ea.CreatedBy AS AssignedBy
            FROM EmployeeAsset ea
            INNER JOIN ITAsset ia ON ia.Id = ea.AssetId
            WHERE ea.EmployeeId = @EmployeeId
            ORDER BY ea.AssignedOn DESC;
        ";


            var result = await connection.QueryAsync<EmployeeITAssetResponseDto>(sql, new { EmployeeId = employeeId });
            return result.ToList();
        }


        public async Task<int> InsertITAssetAsync(ITAsset asset)
        {
            var sql = @"INSERT INTO ITAsset (
                    DeviceName, DeviceCode, SerialNumber, InvoiceNumber, Manufacturer, Model, 
                    AssetType, Status, Branch,AssetCondition, PurchaseDate, WarrantyExpires, Specification, Comments, CreatedBy, CreatedOn,ModifiedOn,ModifiedBy
                ) VALUES (
                    @DeviceName, @DeviceCode, @SerialNumber, @InvoiceNumber, @Manufacturer, @Model,
                    @AssetType, @Status, @Branch,@AssetCondition, @PurchaseDate, @WarrantyExpires, @Specification, @Comments, @CreatedBy, @CreatedOn,@ModifiedOn,@ModifiedBy
                );
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.ExecuteScalarAsync<int>(sql, asset);
            }
        }

        public async Task<int> UpdateITAssetAsync(ITAsset asset)
        {
            var sql = @"UPDATE ITAsset SET 
                    DeviceName = @DeviceName,
                    DeviceCode = @DeviceCode,
                    SerialNumber = @SerialNumber,
                    InvoiceNumber = @InvoiceNumber,
                    Manufacturer = @Manufacturer,
                    Model = @Model,
                    AssetType = @AssetType,
                    Status = @Status,
                    Branch = @Branch,
                    PurchaseDate = @PurchaseDate,
                    WarrantyExpires = @WarrantyExpires,
                    Specification=@Specification,
                    AssetCondition=@AssetCondition,
                    Comments = @Comments,
                    ModifiedBy = @ModifiedBy,
                    ModifiedOn = @ModifiedOn
                WHERE Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.ExecuteAsync(sql, asset);
            }
        }

        public async Task<ITAsset?> GetITAssetByIdAsync(int id)
        {
            var sql = "SELECT * FROM ITAsset WHERE Id = @Id";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.QuerySingleOrDefaultAsync<ITAsset>(sql, new { Id = id });
            }
        }


        public async Task<ITAsset?> GetAssetBySerialNumberAsync(string serialNumber)
        {
            var sql = "SELECT * FROM ITAsset WHERE SerialNumber = @SerialNumber";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.QueryFirstOrDefaultAsync<ITAsset>(sql, new { SerialNumber = serialNumber });
            }
        }


        public async Task<int> InsertEmployeeAssetAsync(EmployeeAsset employeeAsset)
        {
            var sql = @"INSERT INTO EmployeeAsset (
                    EmployeeId, AssetId, AssignedOn, IsActive, CreatedBy, CreatedOn
                ) VALUES (
                    @EmployeeId, @AssetId, @AssignedOn, @IsActive, @CreatedBy, @CreatedOn
                );
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.ExecuteScalarAsync<int>(sql, employeeAsset);
            }
        }

        public async Task<int> GetEmployeeIdByEmailAsync(string email)
        {
            var sql = "SELECT EmployeeId FROM EmploymentDetail WHERE Email = @Email";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.ExecuteScalarAsync<int?>(sql, new { Email = email }) ?? 0;
            }
        }

        public async Task<List<string>> GetAllEmployeeEmailsAsync()
        {
            var sql = "SELECT Email FROM EmploymentDetail";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return (await connection.QueryAsync<string>(sql)).ToList();
            }
        }

        public async Task<ITAssetResponseDto?> GetITAssetByIdAsync(long AssetID)
        {
            string sql = @"
         SELECT
           ED2.Id AS EmployeeId,  IT.Id, IT.DeviceName, IT.DeviceCode, IT.SerialNumber, IT.InvoiceNumber,
            IT.Manufacturer, IT.Model, IT.AssetType, IT.Status AS AssetStatus, IT.Branch,
            IT.PurchaseDate, IT.WarrantyExpires, IT.Comments, IT.ModifiedOn, IT.Specification,
            IT.AssetCondition, IT.ProductFileOriginalName,
            IT.ProductFileName,
            IT.SignatureFileOriginalName,
            IT.SignatureFileName,
           
            ED2.Id AS EmployeeId, ED.Email,
            ED2.FirstName, ED2.MiddleName, ED2.LastName
            
 
        FROM ITAsset IT
        LEFT JOIN EmployeeAsset EA ON IT.Id = EA.AssetId AND EA.IsActive = 1
        LEFT JOIN EmploymentDetail ED ON EA.EmployeeId = ED.EmployeeId
        LEFT JOIN EmployeeData ED2 ON ED.EmployeeId = ED2.Id
        WHERE IT.Id = @AssetID";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();

                var result = await connection.QueryAsync<ITAssetResponseDto, CustodianDto, ITAssetResponseDto>(
                    sql,
                    (asset, custodian) =>
                    {
                        if (custodian != null)
                        {
                            custodian.FullName = string.Join(" ", new[] {
                        custodian.FullName,
                        custodian.FirstName,
                        custodian.MiddleName,
                        custodian.LastName
                            }.Where(s => !string.IsNullOrWhiteSpace(s)));

                            asset.Custodian = custodian;
                        }
                        return asset;
                    },
                    new { AssetId = AssetID },
                    splitOn: "EmployeeId"
                );

                return result?.FirstOrDefault();

            }
        }


        public async Task<IEnumerable<ITAssetHistoryResponseDto>> GetITAssetHistoryByIdAsync(long AssetID)
        {
            string sql = @"
                SELECT 
                    CONCAT(E.FirstName, ' ', NULLIF(E.MiddleName, '') + ' ', E.LastName) AS EmployeeName,
                    ED.Email AS Custodian,
                    H.Status AS AssetStatus,
                    H.AssetCondition AS AssetCondition,
                    H.Note,
                    H.ModifiedBy,
                    H.ModifiedOn,
                    H.IssueDate,
                    H.ReturnDate
                FROM ITAssetHistory H
                LEFT JOIN EmploymentDetail ED ON H.EmployeeId = ED.EmployeeId
                LEFT JOIN EmployeeData E ON E.Id = ED.EmployeeId
                WHERE H.AssetId = @AssetId
                ORDER BY H.CreatedOn DESC";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                var result = await connection.QueryAsync<ITAssetHistoryResponseDto>(sql, new { AssetId = AssetID });
                return result;
            }
        }

        public async Task<bool> AllocateAssetAsync(EmployeeAsset employeeAsset, string? note)
        {
            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        var checkSql = @"SELECT COUNT(1) FROM EmployeeAsset WHERE AssetId = @AssetId AND IsActive = 1";
                        var isAlreadyAllocated = await connection.ExecuteScalarAsync<int>(checkSql, new { employeeAsset.AssetId }, transaction);

                        if (isAlreadyAllocated > 0)
                            return false;

                        var insertAssetSql = @"INSERT INTO EmployeeAsset (
                                                    EmployeeId, AssetId, AssignedOn, IsActive, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
                                            ) VALUES (
                                                    @EmployeeId, @AssetId, @AssignedOn, @IsActive, @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn
                                            );";
                        var updateAssetSql = @"UPDATE ITAsset SET Status = @AssetStatus , AssetCondition=@AssetCondition ,ModifiedBy=@ModifiedBy,ModifiedOn=@ModifiedOn WHERE Id = @AssetId";

                        var assetParams = new
                        {
                            employeeAsset.EmployeeId,
                            employeeAsset.AssetId,
                            AssignedOn = employeeAsset.AssignedOn.ToDateTime(TimeOnly.MinValue),
                            employeeAsset.IsActive,
                            employeeAsset.CreatedBy,
                            employeeAsset.CreatedOn,
                            employeeAsset.ModifiedBy,
                            employeeAsset.ModifiedOn
                        };

                        var rowsAffected = await connection.ExecuteAsync(insertAssetSql, assetParams, transaction);

                        if (rowsAffected == 0)
                            return false;

                        var insertHistorySql = @"INSERT INTO ITAssetHistory (
                                                    AssetId, EmployeeId, Status, AssetCondition, Note, IssueDate , CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
                                                ) VALUES (
                                                    @AssetId, @EmployeeId, @Status, @AssetCondition, @Note, @IssueDate , @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn
                                                );";

                        var historyParams = new
                        {
                            employeeAsset.AssetId,
                            employeeAsset.EmployeeId,
                            Status = AssetStatus.Allocated,
                            AssetCondition = AssetCondition.Ok,
                            Note = note ?? "Asset allocated successfully.",
                            IssueDate = employeeAsset.AssignedOn.ToDateTime(TimeOnly.MinValue),
                            employeeAsset.CreatedBy,
                            employeeAsset.CreatedOn,
                            ModifiedBy = employeeAsset.ModifiedBy,
                            ModifiedOn = employeeAsset.ModifiedOn
                        };
                        var updateParams = new
                        {
                            AssetStatus = AssetStatus.Allocated,
                            AssetCondition = AssetCondition.Ok,
                            AssetId = employeeAsset.AssetId,
                            employeeAsset.ModifiedBy,
                            employeeAsset.ModifiedOn
                        };
                        await connection.ExecuteAsync(updateAssetSql, updateParams, transaction);

                        await connection.ExecuteAsync(insertHistorySql, historyParams, transaction);

                        await transaction.CommitAsync();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        throw new InvalidOperationException("An error occurred while allocating the asset: " + ex.Message);
                    }
                }
            }
        }

        public async Task<bool> DeallocateAssetAsync(EmployeeAsset employeeAsset, string? note)
        {
            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.OpenAsync();

                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        var updateEmployeeAssetSql = @"
                            UPDATE EmployeeAsset 
                            SET ReturnDate = @ReturnDate,
                            IsActive = @IsActive ,
                            ReturnCondition=@AssetCondition
                            WHERE EmployeeId = @EmployeeId AND AssetId = @AssetId";

                        var assetParams = new
                        {
                            employeeAsset.EmployeeId,
                            employeeAsset.AssetId,
                            employeeAsset.ReturnDate,
                            employeeAsset.IsActive,
                            employeeAsset.AssetCondition
                        };

                        await connection.ExecuteAsync(updateEmployeeAssetSql, assetParams, transaction);

                        var updateAssetSql = @"
                            UPDATE ITAsset 
                            SET Status = @AssetStatus 
                            WHERE Id = @AssetId";

                        await connection.ExecuteAsync(updateAssetSql, new
                        {
                            AssetStatus = employeeAsset.AssetStatus,
                            AssetId = employeeAsset.AssetId
                        }, transaction);

                        var insertHistorySql = @"INSERT INTO ITAssetHistory (
                                                    AssetId, EmployeeId, Status, AssetCondition, Note, IssueDate , ReturnDate, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
                                                ) VALUES (
                                                    @AssetId, @EmployeeId, @Status, @AssetCondition, @Note, @IssueDate , @ReturnDate, @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn
                                                );";

                        var historyParams = new
                        {
                            employeeAsset.AssetId,
                            employeeAsset.EmployeeId,
                            Status = employeeAsset.AssetStatus,
                            employeeAsset.AssetCondition,
                            Note = note ?? "Asset deallocated successfully.",
                            IssueDate = employeeAsset.AssignedOn,
                            ReturnDate = employeeAsset.ReturnDate,
                            employeeAsset.CreatedBy,
                            employeeAsset.CreatedOn,
                            ModifiedBy = employeeAsset.ModifiedBy,
                            ModifiedOn = employeeAsset.ModifiedOn
                        };

                        await connection.ExecuteAsync(insertHistorySql, historyParams, transaction);

                        await transaction.CommitAsync();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        throw new InvalidOperationException("An error occurred while deallocating the asset.", ex);

                    }
                }
            }
        }
        public async Task<DateOnly?> GetEmployeeAssetIssueDateAsync(long EmployeeId, long AssetId)
        {
            var sql = @"SELECT AssignedOn
            FROM EmployeeAsset
            WHERE AssetId = @AssetId AND EmployeeId = @EmployeeId AND IsActive = 1";

            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return await connection.QuerySingleOrDefaultAsync<DateOnly?>(sql, new { AssetId, EmployeeId });
            }
        }



        public async Task<long> InsertITAssetHistory(ITAssetHistory iTAssetHistory)
        {
            string sql = @"
                INSERT INTO [dbo].[ITAssetHistory]
                (
                    AssetId, EmployeeId, Status, AssetCondition, Note, IssueDate,
                    CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
                )
                VALUES
                (
                    @AssetId, @EmployeeId, @Status, @AssetCondition, @Note,@IssueDate,
                    @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn
                );
                SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";
            using (IDbConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                long insertedId = await connection.ExecuteScalarAsync<long>(sql, iTAssetHistory);
                return insertedId;
            }
        }



    }
}


