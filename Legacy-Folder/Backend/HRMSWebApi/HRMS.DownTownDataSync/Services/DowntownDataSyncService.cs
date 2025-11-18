using AutoMapper;
using Azure;
using HRMS.Application.Clients;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.DownTownDataSync.Repositories.Interfaces;
using HRMS.DownTownDataSync.Services.Interface;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.Downtown;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.DownTownDataSync.Services
{
    public class DowntownDataSyncService : IDowntownDataSyncService
    {
        private readonly IMapper _mapper;
        private readonly DownTownClient _downTownClient;
        private readonly IDowntownDataSyncRepository _downtownDataSynchedRepository;
        public DowntownDataSyncService(IMapper mapper, DownTownClient downTownClient, IDowntownDataSyncRepository downtownDataSynchedRepository)
        {
            _mapper = mapper;
            _downTownClient = downTownClient;
            _downtownDataSynchedRepository = downtownDataSynchedRepository;
        }
        public async Task<ApiResponseModel<CrudResult>> SyncDownTownDataAsync()
        {
            try
            {
                var response = await _downTownClient.GetEmployeeDataListAsync();
                if (response.data.users.Count > 0)
                {
                    Console.WriteLine("Data found from downtown client.");
                    foreach (var employee in response.data.users)
                    { 
                        var employeeData = await _downtownDataSynchedRepository.GetEmployeeDataByEmailAsync(employee.email);
                        if (employeeData == null)
                        {                            
                            var downtownEmployeeData = _mapper.Map<DowntownData>(employee);                        
                            downtownEmployeeData.Status = employee.status_data.title;
                            downtownEmployeeData.Team_Title = string.IsNullOrEmpty(employee.team?.title) ? null : employee.team.title;
                            // downtownEmployeeData.Designation = employee.designation?.Designation;
                            downtownEmployeeData.Country = employee.country?.country_name;
                            downtownEmployeeData.Gender = employee.gender_data?.title;
                            downtownEmployeeData.Branch_title = employee.company_branch_data?.title;
                            downtownEmployeeData.deleted_at = employee.deleted_at != null ? employee.deleted_at : null;
                           
                            await _downtownDataSynchedRepository.AddAsync(downtownEmployeeData);
                        }

                    }
                    Console.WriteLine("Data added in downtown temp table.");
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    Console.WriteLine("Downtown data not found.");
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, response.message, CrudResult.Failed);
                }
            }
            catch (Exception ex)
            {               
              Console.WriteLine(ex.Message);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);

        }

        public async Task<ApiResponseModel<CrudResult>> ProcessAndSaveDataAync()
        {
            try
            {
                var result = await _downtownDataSynchedRepository.GetDowntownEmployeeData();
                if (result != null && result.Any())
                {
                    Console.WriteLine("Data found from downtownt temp table.");
                    foreach (var item in result)
                    {
                        var employeeId = await _downtownDataSynchedRepository.GetEmployeeDetailsByEmailAsync(item.Email);
                        if (employeeId <= 0)
                        {
                            if (item.IsSynched == false)
                            {
                                if (item.Status == "Ex Employee")
                                {
                                    item.Status = "ExEmployee";
                                }
                                else if (item.Status == "On Notice")
                                {
                                    item.Status = "OnNotice";
                                }
                                var downtownEmployeeData = _mapper.Map<EmployeeRequest>(item);
                                var downtownEmployeeAddress = _mapper.Map<Address>(item);
                                var countryId = await _downtownDataSynchedRepository.GetContryIdAsync(item.Country);
                                downtownEmployeeAddress.CountryId = countryId;
                                await _downtownDataSynchedRepository.AddEmployeeDataAsync(downtownEmployeeData,downtownEmployeeAddress);

                                var employmentDetailData = _mapper.Map<DowntownEmployeeDataRequestDto>(item);
                                var empId = await _downtownDataSynchedRepository.GetEmployeeDetailsByEmailAsync(item.Email);
                                //var branchId = await _downtownDataSynchedRepository.GetBranchIdAsync(item.Branch_title);
                                employmentDetailData.EmployeeId = empId;
                                //employmentDetailData.BranchId = branchId;
                                await _downtownDataSynchedRepository.AddEmployeementDetailsAsync(employmentDetailData);
                                var role = new RoleRequest();
                                role.RoleId = 3;
                                role.EmployeeId = empId;
                                await _downtownDataSynchedRepository.AddRoleMappingAsync(role);
                                await _downtownDataSynchedRepository.UpdateIsSynchedAsync(item.Email);
                            }
                            else
                            {
                                Console.WriteLine($"{item.First_Name} Employee Data is already synched into hrms db tables.");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"{item.First_Name} Employee Data is already exists into hrms db tables.");
                        }

                    }
                    Console.WriteLine("Data add in employeedata table and employeementdetails table in hrms db.");
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    Console.WriteLine("Data not found from downtown temp table.");
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NoEmployeeFound, CrudResult.Failed);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
    }
}
