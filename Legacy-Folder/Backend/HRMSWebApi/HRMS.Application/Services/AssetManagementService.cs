using HRMS.Domain.Entities;
using System.Data;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using System.Net;
using AutoMapper;
using HRMS.Infrastructure;
using Microsoft.AspNetCore.Http;
using HRMS.Models.Models.Asset;
using OfficeOpenXml;
using System.Text.Json;
using AssetCondition = HRMS.Domain.Enums.AssetCondition;
using System.Globalization;
using HRMS.Application.Clients;
using HRMS.Domain.Configurations;
using Microsoft.Extensions.Options;




namespace HRMS.Application.Services
{
    public class AssetManagementService : TokenService, IAssetManagementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private readonly BlobStorageClient _blobStorageClient;
        private readonly AppConfigOptions _appConfig;


        public AssetManagementService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, BlobStorageClient blobStorageClient, IOptions<AppConfigOptions> appConfig)
            : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
             _appConfig = appConfig.Value;
            _blobStorageClient = blobStorageClient;

        }

        public async Task<ApiResponseModel<EmployeeAssetListResponseDto>> GetEmployeeAssetList(SearchRequestDto<EmployeeAssetSearchRequestDto> requestDto)
        {
            var assets = await _unitOfWork.AssetManagementRepository.GetAllEmployeeAssetAsync(requestDto);
            if (assets != null)
            {
                return new ApiResponseModel<EmployeeAssetListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, assets);
            }


            return new ApiResponseModel<EmployeeAssetListResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);

        }
        public async Task<ApiResponseModel<CrudResult>> UpsertEmployeeAssetAsync(EmployeeAssetCreateDto employeeAssetDto)
        {
            var createdAsset = _mapper.Map<EmployeeAsset>(employeeAssetDto);
            createdAsset.CreatedBy = UserEmailId!;
            createdAsset.CreatedOn = DateTime.UtcNow;
            createdAsset.ModifiedOn = DateTime.UtcNow;
            createdAsset.ModifiedBy = UserEmailId!;

            var result = await _unitOfWork.AssetManagementRepository.UpsertEmployeeAssetAsync(createdAsset);
            if (result)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Created, SuccessMessage.Success, CrudResult.Success);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<ITAssetListResponseDto>> GetAssetList(SearchRequestDto<ITAssetSearchRequestDto> requestDto)
        {
            var assets = await _unitOfWork.AssetManagementRepository.GetAllITAssetAsync(requestDto);
            if (assets != null)
            {
                return new ApiResponseModel<ITAssetListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, assets);
            }

            return new ApiResponseModel<ITAssetListResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);

        }
        public async Task<ApiResponseModel<CrudResult>> UpsertITAssetAsync(ITAssetRequestDto requestDto)
        {
            var createdAsset = _mapper.Map<ITAsset>(requestDto);

            createdAsset.Status = requestDto.AssetStatus;
            createdAsset.CreatedBy = UserEmailId!;
            createdAsset.CreatedOn = DateTime.UtcNow;
            createdAsset.ModifiedBy = UserEmailId!;
            createdAsset.ModifiedOn = DateTime.UtcNow;

            string? productFileName = null;
            string? signatureFileName = null;
            var existingAsset = await _unitOfWork.AssetManagementRepository.GetITAssetByIdAsync(createdAsset.Id);
            try
            {
                // Upload Product File if present
                if (requestDto.ProductFileOriginalName != null)
                {
                    if (requestDto.ProductFileOriginalName.Length > _appConfig.UserDocFileMaxSize)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                    }
        
                    productFileName = await _blobStorageClient.UploadFile(
                        requestDto.ProductFileOriginalName,
                        (long)SessionUserId!,
                        BlobContainerConstants.UserDocumentContainer);

                    createdAsset.ProductFileName = productFileName;
                    createdAsset.ProductFileOriginalName = requestDto.ProductFileOriginalName.FileName;
                }
                else if(existingAsset != null && existingAsset.ProductFileName != null)
                {
                    createdAsset.ProductFileName = existingAsset.ProductFileName;
                    createdAsset.ProductFileOriginalName = existingAsset.ProductFileOriginalName;
                }

                // Upload Signature File if present
                if (requestDto.SignatureFileOriginalName != null)
                {

                    if (requestDto.SignatureFileOriginalName.Length > _appConfig.UserDocFileMaxSize)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                    }
                    signatureFileName = await _blobStorageClient.UploadFile(
                        requestDto.SignatureFileOriginalName,
                        (long)SessionUserId!,
                        BlobContainerConstants.UserDocumentContainer);

                    createdAsset.SignatureFileName = signatureFileName;
                    createdAsset.SignatureFileOriginalName = requestDto.SignatureFileOriginalName.FileName;
                }
                else if(existingAsset != null && existingAsset.SignatureFileName != null)
                {
                    createdAsset.SignatureFileName = existingAsset.SignatureFileName;
                    createdAsset.SignatureFileOriginalName = existingAsset.SignatureFileOriginalName;
                }

                bool historyFlag = false;


                if (existingAsset != null &&
                    (existingAsset.AssetCondition != createdAsset.AssetCondition ||
                     existingAsset.AssetStatus != createdAsset.Status) &&
                    requestDto.isAllocated == null)
                {
                    historyFlag = true;
                }

                string? note = requestDto.Note;
                var result = await _unitOfWork.AssetManagementRepository.UpsertITAssetAsync(createdAsset, historyFlag, note);

                if (result)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Created, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {

                    if (productFileName != null)
                    {
                        await _blobStorageClient.DeleteFile(productFileName, BlobContainerConstants.UserDocumentContainer);
                    }
                    if (signatureFileName != null)
                    {
                        await _blobStorageClient.DeleteFile(signatureFileName, BlobContainerConstants.UserDocumentContainer);
                    }

                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
                }
            }
            catch (Exception ex)
            {
                // Cleanup uploaded files in case of exceptions
                if (productFileName != null)
                {
                    await _blobStorageClient.DeleteFile(productFileName, BlobContainerConstants.UserDocumentContainer);
                }
                if (signatureFileName != null)
                {
                    await _blobStorageClient.DeleteFile(signatureFileName, BlobContainerConstants.UserDocumentContainer);
                }

                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, $"{ErrorMessage.ErrorInProcessingRequest} {ex.Message}", CrudResult.Failed);
            }
        }




        public async Task<ApiResponseModel<IEnumerable<EmployeeITAssetResponseDto>>> GetEmployeeAssetById(long employeeId)
        {
            var employeeAsset = await _unitOfWork.AssetManagementRepository.GetEmployeeAssetByIdAsync(employeeId);
            if (employeeAsset != null)
            {
                return new ApiResponseModel<IEnumerable<EmployeeITAssetResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, employeeAsset);
            }
            return new ApiResponseModel<IEnumerable<EmployeeITAssetResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }





        public async Task<ApiResponseModel<ITAssetResponseDto>> GetITAssetById(long AssetID)
        {
            var ITAsset = await _unitOfWork.AssetManagementRepository.GetITAssetByIdAsync(AssetID);
            if (ITAsset != null)
            {
                return new ApiResponseModel<ITAssetResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, ITAsset);
            }
            return new ApiResponseModel<ITAssetResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<IEnumerable<ITAssetHistoryResponseDto>>> GetITAssetHistoryById(long AssetID)
        {
            var ITAsset = await _unitOfWork.AssetManagementRepository.GetITAssetHistoryByIdAsync(AssetID);

            if (ITAsset != null)
            {
                return new ApiResponseModel<IEnumerable<ITAssetHistoryResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, ITAsset);
            }
            return new ApiResponseModel<IEnumerable<ITAssetHistoryResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<CrudResult>> ImportExcelForAsset(IFormFile ITAssetExcel, bool importConfirmed)
        {
            if (ITAssetExcel == null || ITAssetExcel.Length == 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, CrudResult.Failed);

            if (ITAssetExcel.Length > _appConfig.ExcelImportMaxSize)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidExcelFileMaxSize, CrudResult.Failed);

            var extension = Path.GetExtension(ITAssetExcel.FileName).ToLower();
            if (!FileValidations.AllowedExtensions.Contains(extension))
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalideExcelFile, CrudResult.Failed);

            OfficeOpenXml.ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var assets = new List<ImportAssetExcelDto>();
            var invalidRecords = new List<(int Row, string Reason)>();
            var duplicateRecords = new List<(int Row, string SerialNumber, string DeviceName)>();
            var validRecords = new List<(int Row, string SerialNumber, string DeviceName)>();

            try
            {
                var existingEmployeeEmails = await _unitOfWork.AssetManagementRepository.GetAllEmployeeEmailsAsync();

                using (var stream = new MemoryStream())
                {
                    await ITAssetExcel.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets.First();
                        var rowCount = worksheet.Dimension.Rows;
                        var headerRow = worksheet.Cells[1, 1, 1, worksheet.Dimension.Columns].ToList();
                        var headerMap = headerRow.ToDictionary(cell => cell.Text.Trim().ToLower(), cell => cell.Start.Column);

                        var requiredHeaders = new List<string>
                        {
                            "user name",
                            "assignment date",
                            "device name",
                            "device code",
                            "serial number",
                            "invoice number",
                            "manufacturer",
                            "model",
                            "asset type",
                            "status",
                            "location",
                            "purchase date",
                            "warranty expires",
                            "os",
                            "processor",
                            "ram",
                            "hdd 1",
                            "hdd 2",
                            "comments"
                        };

                        string unavailableHeaders = ValidateHeaders(headerMap, requiredHeaders);

                        if (!string.IsNullOrEmpty(unavailableHeaders))
                        {
                            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, unavailableHeaders, CrudResult.Failed);
                        }
                        else
                        {
                            for (int row = 2; row <= rowCount; row++)
                            {
                                bool isRowEmpty = worksheet.Cells[row, 1, row, worksheet.Dimension.Columns]
                                .All(cell => string.IsNullOrWhiteSpace(cell.Text) || cell.Value == null);

                                if (isRowEmpty)
                                    continue;
                                var userName = worksheet.Cells[row, headerMap["user name"]].Text;
                                var assignmentOnText = worksheet.Cells[row, headerMap["assignment date"]].Text;
                                var serialNumber = worksheet.Cells[row, headerMap["serial number"]].Text;
                                var deviceName = worksheet.Cells[row, headerMap["device name"]].Text;

                                if (string.IsNullOrWhiteSpace(serialNumber))
                                    invalidRecords.Add((row, "Missing Serial Number"));

                                if (string.IsNullOrWhiteSpace(deviceName))
                                    invalidRecords.Add((row, "Missing Device Name"));

                                // Validate userName only if provided
                                bool hasValidUser = false;
                                if (!string.IsNullOrWhiteSpace(userName))
                                {
                                    if (!existingEmployeeEmails.Any(a => a.ToLower().Trim().Equals(userName.ToLower().Trim())))
                                        invalidRecords.Add((row, $"Invalid User Name: {userName}"));
                                    else
                                        hasValidUser = true;
                                }

                                DateOnly assignedOn = DateOnly.MinValue;
                                if (hasValidUser)
                                {
                                    if (string.IsNullOrWhiteSpace(assignmentOnText) || !DateOnly.TryParse(assignmentOnText, new CultureInfo("en-US"), DateTimeStyles.None, out assignedOn))
                                    {
                                        invalidRecords.Add((row, $"Invalid or Missing Assignment Date: {assignmentOnText}"));
                                    }
                                }
                                else if (!string.IsNullOrWhiteSpace(assignmentOnText))
                                {
                                    invalidRecords.Add((row, $"Assignment Date provided without valid User Name: {assignmentOnText}"));
                                }

                                var purchaseDateText = worksheet.Cells[row, headerMap["purchase date"]].Text;
                                DateOnly purchaseDate = DateOnly.FromDateTime(DateTime.Today);
                                if (!string.IsNullOrWhiteSpace(purchaseDateText) && !DateOnly.TryParse(purchaseDateText, new CultureInfo("en-US"), DateTimeStyles.None, out purchaseDate))
                                    invalidRecords.Add((row, $"Invalid Purchase Date Format: {purchaseDateText}"));
                                if (string.IsNullOrWhiteSpace(purchaseDateText))
                                    invalidRecords.Add((row, $"Missing Purchase Date: {purchaseDateText}"));

                                // Validate that assignedOn is not earlier than purchaseDate
                                if (hasValidUser && assignedOn != DateOnly.MinValue && assignedOn < purchaseDate)
                                    invalidRecords.Add((row, $"Assignment Date ({assignedOn}) cannot be earlier than Purchase Date ({purchaseDate})"));

                                var warrantyExpiresText = worksheet.Cells[row, headerMap["warranty expires"]].Text;
                                DateTime? warrantyExpires = null;
                                if (!string.IsNullOrWhiteSpace(warrantyExpiresText))
                                {
                                    if (DateTime.TryParse(warrantyExpiresText, new CultureInfo("en-US"), DateTimeStyles.None, out var warrantyDate))
                                    {
                                        warrantyExpires = warrantyDate;
                                        // Validate that warrantyExpires is not earlier than purchaseDate
                                        if (warrantyExpires <= purchaseDate.ToDateTime(TimeOnly.MinValue))
                                            invalidRecords.Add((row, $"Warranty Expiry Date ({warrantyExpires}) cannot be earlier or equal to Purchase Date ({purchaseDate})"));
                                        if (hasValidUser && assignedOn != DateOnly.MinValue && warrantyExpires < assignedOn.ToDateTime(TimeOnly.MinValue))
                                            invalidRecords.Add((row, $"Warranty Expiry Date ({warrantyExpires}) cannot be earlier than Assignment Date ({assignedOn})"));
                                    }
                                    else
                                        invalidRecords.Add((row, $"Invalid Warranty Expiry Date Format: {warrantyExpiresText}"));
                                }

                                var ramText = worksheet.Cells[row, headerMap["ram"]].Text;
                                int? ram = null;
                                if (!string.IsNullOrWhiteSpace(ramText))
                                {
                                    if (int.TryParse(ramText, out var ramVal))
                                        ram = ramVal;
                                    else
                                        invalidRecords.Add((row, $"Invalid RAM Format: {ramText}"));
                                }

                                AssetType assetType = default;
                                var assetTypeText = worksheet.Cells[row, headerMap["asset type"]].Text;
                                if (!string.IsNullOrWhiteSpace(assetTypeText) && !Enum.TryParse(assetTypeText, true, out assetType))
                                    invalidRecords.Add((row, $"Invalid Asset Type: {assetTypeText}"));
                                if (string.IsNullOrWhiteSpace(assetTypeText))
                                    invalidRecords.Add((row, $"Missing Asset Type: {assetTypeText}"));

                                AssetStatus assetStatus = default;
                                var statusText = worksheet.Cells[row, headerMap["status"]].Text;
                                if (hasValidUser)
                                {
                                    if (!string.IsNullOrWhiteSpace(statusText) && !Enum.TryParse(statusText, true, out assetStatus))
                                        invalidRecords.Add((row, $"Invalid Asset Status: {statusText}"));
                                    else if (!string.IsNullOrWhiteSpace(statusText) && assetStatus != AssetStatus.Allocated)
                                        invalidRecords.Add((row, $"Asset Status must be 'Allocated' when User Name is provided: {statusText}"));
                                    else
                                        assetStatus = AssetStatus.Allocated;
                                }
                                else
                                {
                                    if (!string.IsNullOrWhiteSpace(statusText) && !Enum.TryParse(statusText, true, out assetStatus))
                                        invalidRecords.Add((row, $"Invalid Asset Status: {statusText}"));
                                    else if (!string.IsNullOrWhiteSpace(statusText) && assetStatus != AssetStatus.InInventory)
                                        invalidRecords.Add((row, $"Asset Status must be 'InInventory' when User Name is missing: {statusText}"));
                                    else
                                        assetStatus = AssetStatus.InInventory;
                                }

                                if (!string.IsNullOrWhiteSpace(serialNumber))
                                {
                                    var existing = await _unitOfWork.AssetManagementRepository.GetAssetBySerialNumberAsync(serialNumber);
                                    if (existing != null && existing.Status == AssetStatus.Allocated && assetStatus == AssetStatus.InInventory)
                                    {
                                        invalidRecords.Add((row, ErrorMessage.AllocationError));
                                    }
                                }

                                BranchLocation locationResult;
                                BranchLocation? location = null;
                                var locationText = worksheet.Cells[row, headerMap["location"]].Text;

                                if (!string.IsNullOrWhiteSpace(locationText))
                                {
                                    if (Enum.TryParse(locationText, true, out locationResult))
                                        location = locationResult;
                                    else
                                        invalidRecords.Add((row, $"Invalid Location: {locationText}"));
                                }


                                if (invalidRecords.Any(r => r.Row == row))
                                    continue;

                                var asset = new ImportAssetExcelDto
                                {
                                    UserName = userName,
                                    AssignedOn = assignedOn,
                                    DeviceName = deviceName,
                                    DeviceCode = worksheet.Cells[row, headerMap["device code"]].Text,
                                    SerialNumber = serialNumber,
                                    InvoiceNumber = worksheet.Cells[row, headerMap["invoice number"]].Text,
                                    Manufacturer = worksheet.Cells[row, headerMap["manufacturer"]].Text,
                                    Model = worksheet.Cells[row, headerMap["model"]].Text,
                                    AssetType = assetType,
                                    Status = assetStatus,
                                    Location = location,
                                    PurchaseDate = purchaseDate,
                                    WarrantyExpires = warrantyExpires,
                                    OperatingSystem = worksheet.Cells[row, headerMap["os"]].Text,
                                    Processor = worksheet.Cells[row, headerMap["processor"]].Text,
                                    RAM = ram,
                                    HDD1 = worksheet.Cells[row, headerMap["hdd 1"]].Text,
                                    HDD2 = worksheet.Cells[row, headerMap["hdd 2"]].Text,
                                    Comments = worksheet.Cells[row, headerMap["comments"]].Text
                                };


                                if (assets.Any(a => a.SerialNumber!.Equals(serialNumber, StringComparison.OrdinalIgnoreCase)))
                                {
                                    duplicateRecords.Add((row, serialNumber, deviceName));
                                    continue;
                                }

                                assets.Add(asset);
                                validRecords.Add((row, serialNumber, deviceName));
                            }
                        }
                    }
                }

                if (!importConfirmed)
                {
                    var response = new
                    {
                        validRecordsCount = validRecords.Count,
                        validRecords = validRecords.Select(e => new { row = e.Row, e.SerialNumber, e.DeviceName }).ToList(),
                        duplicateCount = duplicateRecords.Count,
                        duplicateRecords = duplicateRecords.Select(e => new { row = e.Row, e.SerialNumber, e.DeviceName }).ToList(),
                        invalidCount = invalidRecords.Count,
                        invalidRecords = invalidRecords.Select(e => new { row = e.Row, reason = e.Reason }).ToList(),

                    };
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, JsonSerializer.Serialize(response), CrudResult.Success);
                }


                if (assets.Any())
                {
                    int successfulImports = 0;
                    int successfulUpdated = 0;
                    int totalIterations = 0;

                    foreach (var asset in assets)
                    {
                        var existingAsset = await _unitOfWork.AssetManagementRepository.GetAssetBySerialNumberAsync(asset.SerialNumber!);
                        var employeeId = string.IsNullOrWhiteSpace(asset.UserName)
                            ? 0
                            : await _unitOfWork.AssetManagementRepository.GetEmployeeIdByEmailAsync(asset.UserName);

                        ITAsset itAsset;
                        long assetId;

                        if (existingAsset != null)
                        {
                            var previousStatus = existingAsset.Status;

                            existingAsset.DeviceName = asset.DeviceName;
                            existingAsset.DeviceCode = asset.DeviceCode;
                            existingAsset.InvoiceNumber = asset.InvoiceNumber;
                            existingAsset.Manufacturer = asset.Manufacturer;
                            existingAsset.Model = asset.Model;
                            existingAsset.AssetType = asset.AssetType;
                            existingAsset.Status = asset.Status; // Status already set to Allocated or InInventory
                            existingAsset.Branch = asset.Location;
                            existingAsset.PurchaseDate = asset.PurchaseDate;
                            existingAsset.WarrantyExpires = asset.WarrantyExpires.HasValue ? DateOnly.FromDateTime(asset.WarrantyExpires.Value) : null;
                            existingAsset.Specification = asset.OperatingSystem + " " + asset.Processor + " " + asset.RAM + " " + asset.HDD1 + " " + asset.HDD2;
                            existingAsset.Comments = asset.Comments;
                            existingAsset.ModifiedBy = UserEmailId;
                            existingAsset.ModifiedOn = DateTime.UtcNow;
                            await _unitOfWork.AssetManagementRepository.UpdateITAssetAsync(existingAsset);
                            successfulUpdated++;
                            assetId = existingAsset.Id;

                            // Handle the case where the asset was previously InInventory and is now being allocated
                            if (previousStatus == AssetStatus.InInventory && asset.Status == AssetStatus.Allocated && employeeId != 0)
                            {
                                var employeeAsset = new EmployeeAsset
                                {
                                    EmployeeId = employeeId,
                                    AssetId = assetId,
                                    AssignedOn = asset.AssignedOn,
                                    IsActive = true,
                                    CreatedBy = UserEmailId!,
                                    CreatedOn = DateTime.UtcNow,
                                    ModifiedBy = UserEmailId,
                                    ModifiedOn = DateTime.UtcNow
                                };

                                var ITAssetHistory = new ITAssetHistory
                                {
                                    EmployeeId = employeeId,
                                    AssetId = assetId,
                                    Note = "Imported from Excel",
                                    IssueDate = asset.AssignedOn,
                                    Status = asset.Status,
                                    CreatedBy = UserEmailId!,
                                    CreatedOn = DateTime.UtcNow,
                                    ModifiedBy = UserEmailId,
                                    ModifiedOn = DateTime.UtcNow
                                };

                                await _unitOfWork.AssetManagementRepository.InsertEmployeeAssetAsync(employeeAsset);
                                await _unitOfWork.AssetManagementRepository.InsertITAssetHistory(ITAssetHistory);
                            }
                        }
                        else
                        {
                            itAsset = new ITAsset
                            {
                                DeviceName = asset.DeviceName,
                                DeviceCode = asset.DeviceCode,
                                SerialNumber = asset.SerialNumber,
                                InvoiceNumber = asset.InvoiceNumber,
                                Manufacturer = asset.Manufacturer,
                                Model = asset.Model,
                                AssetType = asset.AssetType,
                                Status = asset.Status, // Status already set to Allocated or InInventory
                                Branch = asset.Location,
                                PurchaseDate = asset.PurchaseDate,
                                WarrantyExpires = asset.WarrantyExpires.HasValue
                                    ? DateOnly.FromDateTime(asset.WarrantyExpires.Value)
                                    : null,
                                Specification = asset.OperatingSystem + " " + asset.Processor + " " + asset.RAM + " " + asset.HDD1 + " " + asset.HDD2,
                                Comments = asset.Comments,
                                CreatedBy = UserEmailId!,
                                CreatedOn = DateTime.UtcNow,
                                ModifiedBy = UserEmailId,
                                ModifiedOn = DateTime.UtcNow
                            };
                            assetId = await _unitOfWork.AssetManagementRepository.InsertITAssetAsync(itAsset);
                            successfulImports++;

                            // Only create EmployeeAsset if there is a valid employeeId
                            if (employeeId != 0)
                            {
                                var employeeAsset = new EmployeeAsset
                                {
                                    EmployeeId = employeeId,
                                    AssetId = assetId,
                                    AssignedOn = asset.AssignedOn,
                                    IsActive = true,
                                    CreatedBy = UserEmailId!,
                                    CreatedOn = DateTime.UtcNow,
                                    ModifiedBy = UserEmailId,
                                    ModifiedOn = DateTime.UtcNow

                                };

                                var ITAssetHistory = new ITAssetHistory
                                {
                                    EmployeeId = employeeId,
                                    AssetId = assetId,
                                    Note = "Imported from Excel",
                                    IssueDate = asset.AssignedOn,
                                    Status = asset.Status,

                                    CreatedBy = UserEmailId!,
                                    CreatedOn = DateTime.UtcNow,
                                    ModifiedBy = UserEmailId,
                                    ModifiedOn = DateTime.UtcNow

                                };

                                await _unitOfWork.AssetManagementRepository.InsertEmployeeAssetAsync(employeeAsset);
                                await _unitOfWork.AssetManagementRepository.InsertITAssetHistory(ITAssetHistory);

                            }
                        }

                        totalIterations++;
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK,
                    $"{successfulImports} {(successfulImports < 2 ? "record" : "records")} imported, {successfulUpdated} {(successfulUpdated < 2 ? "record" : "records")} updated.",
                    CrudResult.Success);

                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, "No valid records to import.", CrudResult.Failed);
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, $"Error: {ex.Message}", CrudResult.Failed);
            }
        }




        public static string ValidateHeaders(Dictionary<string, int> headerMap, List<string> requiredHeaders)
        {
            var missingHeaders = requiredHeaders
                .Where(header => !headerMap.ContainsKey(header))
                .ToList();

            if (missingHeaders.Any())
            {
                return $"Missing required column(s): {string.Join(", ", missingHeaders)}";
            }
            return "";
        }

        public async Task<ApiResponseModel<CrudResult>> AllocateAssetById(ITAssetRequestDto requestDto)
        {
            var employeeAsset = _mapper.Map<EmployeeAsset>(requestDto);
            employeeAsset.AssignedOn = DateOnly.FromDateTime(DateTime.UtcNow);
            employeeAsset.CreatedBy = UserEmailId!;
            employeeAsset.CreatedOn = DateTime.UtcNow;
            employeeAsset.EmployeeId = requestDto.EmployeeId ?? 0;
            employeeAsset.AssetId = requestDto.Id;
            employeeAsset.ModifiedBy = UserEmailId!;
            employeeAsset.ModifiedOn = DateTime.UtcNow;

            bool response = false;

            if (requestDto.isAllocated != null && requestDto.isAllocated == true)
            {
                if (requestDto.AssetCondition == AssetCondition.Ok && requestDto.AssetStatus == AssetStatus.InInventory)
                {
                    employeeAsset.IsActive = true;
                    response = await _unitOfWork.AssetManagementRepository.AllocateAssetAsync(employeeAsset, requestDto.Note);
                }
            }
            else
            {
                employeeAsset.IsActive = false;
                employeeAsset.ReturnDate = DateOnly.FromDateTime(DateTime.UtcNow);
                response = await _unitOfWork.AssetManagementRepository.DeallocateAssetAsync(employeeAsset, requestDto.Note);
            }

            if (response)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.AlreadyAllocated, CrudResult.Failed);
        }

    }
}
