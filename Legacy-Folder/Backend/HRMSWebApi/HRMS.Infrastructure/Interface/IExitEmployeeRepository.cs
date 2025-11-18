using HRMS.Domain.Entities;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.UserProfile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Infrastructure.Interface
{
    public interface IExitEmployeeRepository
    {
        Task<int> AddResignationAsync(Resignation resignation);
        Task<ResignationResponseDto?> GetEmployeeDetailsForResignationAsync(long id);
        Task<ResignationResponseDto?> GetResignationByAsync(long id);
        Task<ResignationExistResponseDto?> GetResignationExistAsync(long id);
        Task<Resignation?> GetResignationByIdAsync(int resignationId);
        Task<bool> UpdateResignationAsync(Resignation resignation);
        Task<bool> RequestEarlyReleaseAsync(EarlyReleaseRequestDto request, ResignationHistory historyDto);

        Task<IsResignationExistResponseDTO?> IsResignationExistAsync(long id);
    }
}
