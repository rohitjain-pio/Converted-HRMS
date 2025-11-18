using HRMS.API.Athorization;
using HRMS.Domain.Contants;
using HRMS.Models.Models.Asset;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Application.Services;
using System.Net;
using HRMS.Domain.Enums;



namespace HRMS.API.Controllers
{
    [Route("api/AssetManagement")]
    [ApiController]
    public class AssetManagementController : ControllerBase
    {

        private readonly IAssetManagementService _assetManagementService;
        public AssetManagementController(IAssetManagementService assetManagementService)
        {
            _assetManagementService = assetManagementService;

        }

        /// <summary>
        /// List of EmployeeAsset
        /// </summary>
        /// <response code="200">Return list of EmployeeAsset </response> 
        [HttpPost]
        [Route("GetEmployeeAssetList")]
        [HasPermission(Permissions.ReadAsset)]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeAssetListResponseDto>), 200)]

        public async Task<IActionResult> GetEmployeeAssetList(SearchRequestDto<EmployeeAssetSearchRequestDto> searchRequestDto)
        {
            var response = await _assetManagementService.GetEmployeeAssetList(searchRequestDto);
            return StatusCode(response.StatusCode, response);
        }
         
        /// <summary>
        /// Upsert a new EmployeeAsset record
        /// </summary>
        /// <param name="employeeAssetDto">EmployeeAsset data to Update and add</param>
        /// <response code="201">Returns the created EmployeeAsset</response>
        /// <response code="400">If the input is invalid</response>
        [HttpPost]
        [Route("UpsertEmployeeAsset")]
        // [ProducesResponseType(typeof(ApiResponseModel<EmployeeAssetResponseDto>), 201)]
        [HasPermission(Permissions.CreateAsset)]
        public async Task<IActionResult> UpsertEmployeeAsset([FromBody] EmployeeAssetCreateDto employeeAssetDto)
        {
            var response = await _assetManagementService.UpsertEmployeeAssetAsync(employeeAssetDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// List of GetAssetList
        /// </summary>
        /// <response code="200">Return list of Assets </response> 
        [HttpPost]
        [Route("GetAssetList")]
        [ProducesResponseType(typeof(ApiResponseModel<ITAssetListResponseDto>), 200)]
        [HasPermission(Permissions.ReadAsset)]
        public async Task<IActionResult> GetAssetList(SearchRequestDto<ITAssetSearchRequestDto> searchRequestDto)
        {
            var response = await _assetManagementService.GetAssetList(searchRequestDto);
            return StatusCode(response.StatusCode, response);
        }
         
        /// <summary>
        /// Upsert a new ITAsset record
        /// </summary>
        /// <param name="requestDto">ITAsset data to Update and add</param>
        /// <response code="201">Returns the created ITAsset</response>
        /// <response code="400">If the input is invalid</response>
        [HttpPost]
        [Route("UpsertITAsset")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.CreateAsset)]
        public async Task<IActionResult> UpsertITAsset([FromForm] ITAssetRequestDto requestDto)
        {     
            var response = await _assetManagementService.UpsertITAssetAsync(requestDto);
            if (requestDto.isAllocated != null)
            {
                await _assetManagementService.AllocateAssetById(requestDto);
            } 
            return StatusCode(response.StatusCode, response);  
        }

        /// <summary>
        /// Retrieves the list of IT assets assigned to a specific employee.
        /// </summary>
        /// <param name="employeeId">The ID of the employee whose assets are to be retrieved.</param>
        /// <returns>A list of IT assets assigned to the employee.</returns>
        /// <response code="200">Returns the list of assigned assets.</response>
        /// <response code="404">If no assets are found for the given employee.</response>
        [HttpGet]
        [Route("GetEmployeeAsset/{employeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<EmployeeITAssetResponseDto>>), 200)]
        [HasPermission(Permissions.ViewAsset)]
        public async Task<IActionResult> GetEmployeeAsset(long employeeId)
        {
            var response = await _assetManagementService.GetEmployeeAssetById(employeeId);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Retrieves  IT assets By Id.
        /// </summary>
        /// <param name="AssetId">The ID of the Asset who are to be retrieved.</param>
        /// <returns>IT asset.</returns>
        /// <response code="200">Returns the Asset by Id.</response>
        /// <response code="404">If no assets are found for the given AssetId.</response>
        [HttpGet]
        [Route("GetAssetById/{AssetId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<ITAssetResponseDto>), 200)]
        [HasPermission(Permissions.ViewAsset)]
        public async Task<IActionResult> GetAssetById(long AssetId)
        {
            var response = await _assetManagementService.GetITAssetById(AssetId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves  ITAsset History assigned By Id.
        /// </summary>
        /// <param name="AssetId">The ID of the Asset whose History are to be retrieved.</param>
        /// <returns>A list of ITAsset History assigned to the employee.</returns>
        /// <response code="200">Returns the list of ITAssets History.</response>
        /// <response code="404">If no ITAssetHistory are found.</response>
        [HttpGet]
        [Route("GetAssetHistoryById/{AssetId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<ITAssetHistoryResponseDto>>), 200)]
        [HasPermission(Permissions.ViewAsset)]
        public async Task<IActionResult> GetAssetHistoryById(long AssetId)
        {
            var response = await _assetManagementService.GetITAssetHistoryById(AssetId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Import excel file
        /// </summary>
        /// <response code="200">Import excel file</response>
        [HttpPost]
        [Route("ImportExcel")]
        [HasPermission(Permissions.CreateAsset)]
        public async Task<IActionResult> ImportExcel(IFormFile excelfile,  bool importConfirmed=true)
        {
            
            var response = await _assetManagementService.ImportExcelForAsset(excelfile, importConfirmed);
            return StatusCode(response.StatusCode, response);
        }
        
    }
}
