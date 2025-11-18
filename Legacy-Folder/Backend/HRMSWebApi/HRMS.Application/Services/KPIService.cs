using System.Net;
using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Http;

namespace HRMS.Application.Services
{
    public class KPIService : TokenService, IKPIService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailNotificationService _email;

        public KPIService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, IEmailNotificationService email) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _email = email;
        }

        private async Task<EnsureKPIResponseDto> EnsureKPIPlanAsync(long employeeId)
        {
            var kpiPlan = await _unitOfWork.KPIRepository.GetKPIPlanByEmployeeIdAsync(employeeId);
            long planId;
            

            if (kpiPlan == null)
            {
                var newKpiPlan = new KPIPlan
                {
                    EmployeeId = employeeId,
                    CreatedBy = UserEmailId!,
                    CreatedOn = DateTime.UtcNow
                };
                planId = await _unitOfWork.KPIRepository.CreateKPIPlanAsync(newKpiPlan);
            }
            else
            {
                planId = kpiPlan.Id;
                
            }

            return new EnsureKPIResponseDto
            {
                PlanId = planId,
                // LastAppraisal = lastAppraisal,
                // NextAppraisal = nextAppraisal
            };
        }

        private async Task AssignGoalToEmployeeAsync(long planId, long goalId)
        {
            var detail = new KPIDetails
            {
                PlanId = planId,
                GoalId = goalId,
                CreatedBy = UserEmailId!,
                CreatedOn = DateTime.UtcNow,
                IsDeleted = false
            };

            await _unitOfWork.KPIRepository.AssignGoalToEmployeeAsync(detail);
        }


        public async Task<ApiResponseModel<CrudResult>> AddGoal(GoalRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidRequest, CrudResult.Failed);
            }

            var goal = _mapper.Map<KPIGoals>(requestDto);
            goal.CreatedBy = UserEmailId!;
            var goalId = await _unitOfWork.KPIRepository.AddGoalAsync(goal);

            if (!string.IsNullOrWhiteSpace(requestDto.EmployeeIds))
            {
                var employeeIds = requestDto.EmployeeIds
                    .Split(",", StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => long.TryParse(id, out var empId) ? empId : (long?)null)
                    .Where(id => id.HasValue)
                    .Select(id => id.Value)
                    .ToArray();

                foreach (var empId in employeeIds)
                {
                    var kpiPlan = await EnsureKPIPlanAsync(empId);
                    await AssignGoalToEmployeeAsync(kpiPlan.PlanId, goalId);

                }
            }


            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.GoalAdded, CrudResult.Success);
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteGoalById(long goalId)
        {
            var response = await _unitOfWork.KPIRepository.DeleteGoalAsync(goalId);
            return response == 0
                ? new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.RecordNotExist, CrudResult.Failed)
                : new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.GoalDeleted, CrudResult.Success);
        }

        public async Task<ApiResponseModel<KPIGoals>> GetById(long goalId)
        {
            var response = await _unitOfWork.KPIRepository.GetByIdAsync(goalId);
            return new ApiResponseModel<KPIGoals>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
        }

        public async Task<ApiResponseModel<GetEmpListResponseDto>> GetEmployeesKPI(SearchRequestDto<GetEmpByManagerRequestDto> requestDto)
        {
            var employees = await _unitOfWork.KPIRepository.GetEmployeesKPIAsync(RoleId!, SessionUserId!, requestDto);
            return new ApiResponseModel<GetEmpListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, employees);
        }

        public async Task<ApiResponseModel<KPIGoalsSearchResponseDto>> GetGoalList(SearchRequestDto<KPIGoalRequestDto> requestDto)
        {
            var response = await _unitOfWork.KPIRepository.GetGoalListAsync(requestDto);
            return new ApiResponseModel<KPIGoalsSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateGoalAsync(GoalRequestDto request)
        {
            var existingGoal = await _unitOfWork.KPIRepository.GetByIdAsync(request.Id);
            if (existingGoal == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

            var goal = _mapper.Map<KPIGoals>(request);
            goal.ModifiedBy = UserEmailId!;
            await _unitOfWork.KPIRepository.UpdateGoalAsync(goal);

            if (!string.IsNullOrWhiteSpace(request.EmployeeIds))
            {

                var newEmployeeIds = request.EmployeeIds
                    .Split(",", StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => long.TryParse(id, out var empId) ? empId : (long?)null)
                    .Where(id => id.HasValue)
                    .Select(id => id.Value)
                    .ToHashSet();

                var currentEmployeeIds = (await _unitOfWork.KPIRepository.GetAssignedEmployeeIdsAsync(request.Id)).ToHashSet();
                var employeesToAssign = newEmployeeIds.Except(currentEmployeeIds).ToList();
                var employeesToRevoke = currentEmployeeIds.Except(newEmployeeIds).ToList();
                foreach (var empId in employeesToAssign)
                {
                    var kpiPlan = await EnsureKPIPlanAsync(empId);
                    await AssignGoalToEmployeeAsync(kpiPlan.PlanId, goal.Id);
                }

                foreach (var empId in employeesToRevoke)
                {
                    var kpiPlan = await EnsureKPIPlanAsync(empId);
                    var detail = new KPIDetails
                    {
                        PlanId = kpiPlan.PlanId,
                        GoalId = goal.Id,
                        ModifiedBy = UserEmailId!
                    };
                    await _unitOfWork.KPIRepository.RevokeGoalFromEmployeeAsync(detail);
                }
            }
            else
            {

                var currentEmployeeIds = await _unitOfWork.KPIRepository.GetAssignedEmployeeIdsAsync(request.Id);
                foreach (var empId in currentEmployeeIds)
                {
                    var kpiPlan = await EnsureKPIPlanAsync(empId);
                    var detail = new KPIDetails
                    {
                        PlanId = kpiPlan.PlanId,
                        GoalId = goal.Id,
                        ModifiedBy = UserEmailId!
                    };
                    await _unitOfWork.KPIRepository.RevokeGoalFromEmployeeAsync(detail);
                }
            }

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.GoalUpdated, CrudResult.Success);
        }
        public async Task<ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>> GetEmployeesByManager()
        {
            var employees= await _unitOfWork.KPIRepository.GetEmployeesByManagerAsync(SessionUserId, RoleId);
            return new ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, employees);
        }

        public async Task<ApiResponseModel<IEnumerable<GetSelfRatingResponseDto>>> GetEmployeeSelfRating(long? PlanId, long? EmployeeId)
        {
            var response = await _unitOfWork.KPIRepository.GetSelfRatingAsync(PlanId, EmployeeId);
            if (response == null)
            {
                return new ApiResponseModel<IEnumerable<GetSelfRatingResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.RecordNotExist, response);
            }
            return new ApiResponseModel<IEnumerable<GetSelfRatingResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, response);


        }

        public async Task<ApiResponseModel<CrudResult>> UpdateEmployeeSelfRating(UpdateEmployeeSelfRatingRequestDto requestDto)
        {

            var existingKpiDetail = await _unitOfWork.KPIRepository.GetKpiDetailAsync(requestDto.goalId, requestDto.PlanId);

            if (existingKpiDetail != null && existingKpiDetail.Status == true)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.AlreadySubmit, CrudResult.Failed);
            }


            var kpiDetail = _mapper.Map<KPIDetails>(requestDto);
            kpiDetail.ModifiedBy = UserEmailId!;
            kpiDetail.ModifiedOn = DateTime.UtcNow;
            switch (requestDto.quarter)
            {
                case "Q1":
                    kpiDetail.Q1_Note = requestDto.note;
                    kpiDetail.Q1_Rating = requestDto.rating;
                    break;
                case "Q2":
                    kpiDetail.Q2_Note = requestDto.note;
                    kpiDetail.Q2_Rating = requestDto.rating;
                    break;
                case "Q3":
                    kpiDetail.Q3_Note = requestDto.note;
                    kpiDetail.Q3_Rating = requestDto.rating;
                    break;
                case "Q4":
                    kpiDetail.Q4_Note = requestDto.note;
                    kpiDetail.Q4_Rating = requestDto.rating;
                    break;
            }

            var result = await _unitOfWork.KPIRepository.UpdateSelfRatingAsync(kpiDetail, requestDto.quarter);

            if (result == 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.CannotUpdate, CrudResult.Failed);
            }

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateEmployeeRatingByManager(ManagerRatingUpdateRequestDto requestDto)
        {
            var kpiDetail = _mapper.Map<KPIDetails>(requestDto);
            kpiDetail.ModifiedBy = UserEmailId!;
            kpiDetail.ModifiedOn = DateTime.UtcNow;

            var result = await _unitOfWork.KPIRepository.UpdateEmployeeRatingByManagerAsync(kpiDetail);

            if (result == 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.RecordNotExist, CrudResult.Failed);
            }
            var history = new ManagerRatingHistory
            {
                PlanId = requestDto.PlanId,
                GoalId = requestDto.GoalId,
                ManagerId = (long)SessionUserId!,
                ManagerRating = requestDto.ManagerRating,
                ManagerComment = requestDto.ManagerNote,
                CreatedBy = UserEmailId!,
                CreatedOn = DateTime.UtcNow,
            };
            await _unitOfWork.KPIRepository.AddManagerRatingHistoryAsync(history);

            
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<CrudResult>> SubmitKPIPlanByEmployee(long planId)
        {
            var response = await _unitOfWork.KPIRepository.SubmitKPIPlanByEmployeeAsync(planId);
            if (response == 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.AlreadySubmit, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Submitted, CrudResult.Success);
        }

        public async Task<ApiResponseModel<CrudResult>> AssignGoalByManager(AssignGoalByManagerRequestDto requestDto)
        {
            long planId;

            if (requestDto.PlanId.HasValue && requestDto.PlanId.Value > 0)
            {
                planId = requestDto.PlanId.Value;
            }
            else
            {
                var kpiPlan = await EnsureKPIPlanAsync(requestDto.EmployeeId);
                planId = kpiPlan.PlanId;
            }

            await AssignGoalToEmployeeAsync(planId, requestDto.GoalId);

            var result = await _unitOfWork.KPIRepository.UpdateKPIDetailsAsync(planId, requestDto);
            if (result == 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.AlreadyAssigned, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.AssignedSuccessfully, CrudResult.Success);
        }
        

        public async Task<ApiResponseModel<CrudResult>> SubmitKPIPlanByManager(long planId)
        {
            var response = await _unitOfWork.KPIRepository.SubmitKPIPlanByManagerAsync(planId);
            if (response == 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.AlreadyReviewed, CrudResult.Success);
            }

            //email send to admin 
            await _email.KPIComplete(planId);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Reviewed, CrudResult.Success);
        }

        public async Task<ApiResponseModel<IEnumerable<ManagerRatingHistoryByGoalResponseDto>>> GetManagerRatingHistoryByGoal(GetRatingHistoryRequestDto requestDto)
        {
            var response = await _unitOfWork.KPIRepository.GetManagerRatingHistoryByGoalAsync(requestDto);
            if (response == null)
            {
                return new ApiResponseModel<IEnumerable<ManagerRatingHistoryByGoalResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.RecordNotExist, null);
            }
            return new ApiResponseModel<IEnumerable<ManagerRatingHistoryByGoalResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
        }

        public async Task<ApiResponseModel<IEnumerable<GetEmployeeRatingByManagerResponseDto>>> GetEmployeeRatingByManager(long EmployeeId)
        {
            var response = await _unitOfWork.KPIRepository.GetEmployeeRatingByManagerAsync(EmployeeId);
            if (response == null || !response.Any())
            {
                return new ApiResponseModel<IEnumerable<GetEmployeeRatingByManagerResponseDto>>((int)HttpStatusCode.OK,ErrorMessage.RecordNotExist,response);
            }

            return new ApiResponseModel<IEnumerable<GetEmployeeRatingByManagerResponseDto>>((int)HttpStatusCode.OK,SuccessMessage.Success,response);
        }
    }
}