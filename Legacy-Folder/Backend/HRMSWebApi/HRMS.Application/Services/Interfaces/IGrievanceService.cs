using HRMS.Models.Models.Grievance;
using HRMS.Domain.Enums;
using HRMS.Models;

namespace HRMS.Application.Services.Interfaces
{
    public interface IGrievanceService
    {
        Task<ApiResponseModel<CrudResult>> AddGrievance(GrievanceRequestDTO request);
        Task<ApiResponseModel<CrudResult>> UpdateGrievance(GrievanceRequestDTO request);
        Task<ApiResponseModel<CrudResult>> DeleteGrievance(long grievanceTypeId);
        Task<ApiResponseModel<GrievanceListResponseDTO>> GetAllGrievances();
        Task<ApiResponseModel<GrievanceResponseDTO>> GetGrievanceTypeById(long grievanceTypeId);
        Task<ApiResponseModel<EmployeeGrievanceResponseList>> GetEmployeeGrievancesAsync(long EmployeeId, SearchRequestDto<EmployeeGrievanceFilterDto> request);
        Task<ApiResponseModel<SubmitEmployeeGrievanceDto>> SubmitGrievanceAsync(EmployeeGrievanceCreateDto request);
        Task<ApiResponseModel<EmployeeGrievanceDetail>> GetEmployeeGrievancesDetailAsync(long TicketId);
        Task<ApiResponseModel<EmployeeListGrievanceResponseList>> GetAllEmployeeGrievancesAsync(SearchRequestDto<EmployeeListGrievanceFilterDto> request);
        Task<ApiResponseModel<EmployeeGrievanceRemarksDetail>> GetEmployeeGrievanceRemarksDetailAsync(long ticketId);
        Task<ApiResponseModel<bool>> UpdateGrievanceAsync(UpdateGrievanceRemarksRequestDto request);
        Task<ApiResponseModel<bool>> UpdateRemarksAllowedAsync(int grievanceTypeId, int level);
        Task<byte[]> GetGrievanceReportInExcel(SearchRequestDto<EmployeeListGrievanceFilterDto> requestDto);
        Task<ApiResponseModel<GrievanceTypeListDto>> GetAllGrievancesTypeAsync();
        Task<ApiResponseModel<bool>> GrievanceViewAllowedAsync(long grievanceId);
    }
}
