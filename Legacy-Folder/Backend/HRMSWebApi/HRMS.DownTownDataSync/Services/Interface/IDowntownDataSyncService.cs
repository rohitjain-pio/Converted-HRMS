using HRMS.Domain.Enums;
using HRMS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.DownTownDataSync.Services.Interface
{
    public interface IDowntownDataSyncService
    {
        Task<ApiResponseModel<CrudResult>> SyncDownTownDataAsync(); 
        Task<ApiResponseModel<CrudResult>> ProcessAndSaveDataAync();

    }
}
