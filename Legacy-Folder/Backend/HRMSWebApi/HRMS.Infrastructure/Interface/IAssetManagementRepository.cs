using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.Asset;


namespace HRMS.Infrastructure.Interface
{
    public interface IAssetManagementRepository
    {
        Task<EmployeeAssetListResponseDto> GetAllEmployeeAssetAsync(SearchRequestDto<EmployeeAssetSearchRequestDto> requestDto);
        Task<int> InsertITAssetAsync(ITAsset asset);
        Task<int> UpdateITAssetAsync(ITAsset asset);
        Task<ITAsset?> GetITAssetByIdAsync(int id);
        Task<ITAsset?> GetAssetBySerialNumberAsync(string serialNumber);
        Task<int> InsertEmployeeAssetAsync(EmployeeAsset employeeAsset);
        Task<int> GetEmployeeIdByEmailAsync(string email);
        Task<List<string>> GetAllEmployeeEmailsAsync();
        Task<bool> UpsertEmployeeAssetAsync(EmployeeAsset employeeAsset);
        Task<ITAssetListResponseDto> GetAllITAssetAsync(SearchRequestDto<ITAssetSearchRequestDto> requestDto);
        Task<bool> UpsertITAssetAsync(ITAsset createdAsset, bool? historyFlag, string? Note);
        Task<IEnumerable<EmployeeITAssetResponseDto>> GetEmployeeAssetByIdAsync(long employeeId);
        Task<ITAssetResponseDto?> GetITAssetByIdAsync(long AssetID);
        Task<IEnumerable<ITAssetHistoryResponseDto>> GetITAssetHistoryByIdAsync(long AssetID);
        Task<bool> AllocateAssetAsync(EmployeeAsset employeeAsset, string? note);
        Task<bool> DeallocateAssetAsync(EmployeeAsset employeeAsset, string? note);
        Task<long> InsertITAssetHistory(ITAssetHistory iTAssetHistory);       
        Task<DateOnly?> GetEmployeeAssetIssueDateAsync(long EmployeeId, long AssetId);

    }
}