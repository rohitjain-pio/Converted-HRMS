using HRMS.Domain.Entities;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.EmployeeGroup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.DownTownDataSync.Repositories.Interfaces
{
    public interface IDowntownDataSyncRepository
    {
        Task<int> AddAsync(DowntownData entity);
        Task<IEnumerable<DowntownData>> GetDowntownEmployeeData();      
        Task<int> AddEmployeeDataAsync(EmployeeRequest entity, Address address);
        Task<int> AddEmployeementDetailsAsync(DowntownEmployeeDataRequestDto employmentDetail);
        Task<DowntownData?> GetEmployeeDataByEmailAsync(string email);
        Task<int> GetEmployeeDetailsByEmailAsync(string email);
        Task<int> GetContryIdAsync(string countryName);
        Task<int> UpdateIsSynchedAsync(string email);
        Task<int> AddRoleMappingAsync(RoleRequest entity);
    }
}
