using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Asset;
using Microsoft.AspNetCore.Http;

namespace HRMS.Application.Services.Interfaces
{
    public interface IAssetManagementService
    {
        Task<ApiResponseModel<EmployeeAssetListResponseDto>> GetEmployeeAssetList(SearchRequestDto<EmployeeAssetSearchRequestDto> requestDto);
        Task<ApiResponseModel<CrudResult>> UpsertEmployeeAssetAsync(EmployeeAssetCreateDto employeeAssetDto);
        Task<ApiResponseModel<ITAssetListResponseDto>> GetAssetList(SearchRequestDto<ITAssetSearchRequestDto> requestDto);
        Task<ApiResponseModel<CrudResult>> UpsertITAssetAsync(ITAssetRequestDto requestDto);
        Task<ApiResponseModel<IEnumerable<EmployeeITAssetResponseDto>>> GetEmployeeAssetById(long employeeId);
        Task<ApiResponseModel<CrudResult>> ImportExcelForAsset(IFormFile ITAssetExcel, bool importConfirmed);
        Task<ApiResponseModel<CrudResult>> AllocateAssetById(ITAssetRequestDto requestDto);
        Task<ApiResponseModel<ITAssetResponseDto>> GetITAssetById(long AssetID);
        Task<ApiResponseModel<IEnumerable<ITAssetHistoryResponseDto>>> GetITAssetHistoryById(long AssetID);
    }
}



