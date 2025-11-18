import { httpInstance } from "@/api/httpInstance";
import {
  AssignGoalByManagerRequest,
  AssignGoalByManagerResponse,
  DeleteGoalResponse,
  GetEmployeeRatingByManagerResponse,
  GetEmployeesByManagerResponse,
  GetEmployeeSelfRatingResponse,
  GetEmployeesGoalArgs,
  getEmployeesGoalResponse,
  GetGoalByIdResponse,
  GetGoalListArgs,
  GetGoalListResponse,
  ManagerRatingHistoryRequest,
  GetManagerRatingHistoryResponse,
  SubmitKPIPlanResponse,
  SubmitManagerReviewResponse,
  updateManagerRating,
  UpdateManagerRatingResponse,
  UpdateSelfRatingPayload,
  UpdateSelfRatingResponse,
  UpsertGoalResponse,
  UpsertRequestGoal,
} from "@/services/KPI/types";

const baseRoute = "/KPI";

export const getEmployeeSelfRating = async (args: {
  employeeId?: number;
  planId?: number;
}) => {
  const { employeeId, planId } = args;

  if (typeof employeeId === "undefined" && typeof planId === "undefined") {
    console.error("At least one of `employeeId` or `planId` must be provided.");
    throw new Error(
      "At least one of `employeeId` or `planId` must be provided."
    );
  }

  const params = new URLSearchParams();

  if (typeof employeeId !== "undefined") {
    params.append("employeeId", String(employeeId));
  }

  if (typeof planId !== "undefined") {
    params.append("planId", String(planId));
  }

  return httpInstance.get(
    `${baseRoute}/GetEmployeeSelfRating?${params.toString()}`
  ) as Promise<GetEmployeeSelfRatingResponse>;
};
export const updateEmployeeRatingByManager = (args: updateManagerRating) => {
  return httpInstance.post(
    `${baseRoute}/UpdateEmployeeRatingByManager`,
    args
  ) as Promise<UpdateManagerRatingResponse>;
};

export const getGoalList = async (args: GetGoalListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetGoalList`,
    args
  ) as Promise<GetGoalListResponse>;
};
export const assignGoalByManager = async (args: AssignGoalByManagerRequest) => {
  return httpInstance.post(
    `${baseRoute}/AssignGoalByManager`,
    args
  ) as Promise<AssignGoalByManagerResponse>;
};
export const getEmployeesByManager = async (params: { name?: string }) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeesByManager
 `,
    {
      params,
    }
  ) as Promise<GetEmployeesByManagerResponse>;
};
export const getEmployeesGoalList = async (args: GetEmployeesGoalArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEmployeesKPI`,
    args
  ) as Promise<getEmployeesGoalResponse>;
};
export const deleteGoal = async (id: number) => {
  return httpInstance.post(
    `${baseRoute}/DeleteGoal/${id}`
  ) as Promise<DeleteGoalResponse>;
};
export const addGoal = async (args: UpsertRequestGoal) => {
  return httpInstance.post(
    `${baseRoute}/CreateGoal`,
    args
  ) as Promise<UpsertGoalResponse>;
};
export const updateGoal = async (args: UpsertRequestGoal) => {
  return httpInstance.post(
    `${baseRoute}/UpdateGoal`,
    args
  ) as Promise<UpsertGoalResponse>;
};

export const getGoalById = async (goalId: number) => {
  return httpInstance.get(
    `${baseRoute}/getGoalById/${goalId}`
  ) as Promise<GetGoalByIdResponse>;
};

export const updateEmployeeSelfRating = async (
  payload: UpdateSelfRatingPayload
) => {
  return httpInstance.post(
    `${baseRoute}/UpdateEmployeeSelfRating`,
    payload
  ) as Promise<UpdateSelfRatingResponse>;
};

export const submitKPIPlan = async (planId: number) => {
  return httpInstance.post(
    `${baseRoute}/SubmitKPIPlanByEmployee/${planId}`
  ) as Promise<SubmitKPIPlanResponse>;
};
export const submitManagerPlan = async (planId: number) => {
  return httpInstance.post(
    `${baseRoute}/SubmitKPIPlanByManager/${planId}`
  ) as Promise<SubmitManagerReviewResponse>;
};
export const getManagerRatingHistory = async (params: ManagerRatingHistoryRequest) => {
  return httpInstance.post(
    `${baseRoute}/GetManagerRatingHistoryByGoal`,params
  ) as Promise<GetManagerRatingHistoryResponse>;
};
export const getEmployeeRatingByManager = async (employeeId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeRatingByManager/${employeeId}`
  ) as Promise<GetEmployeeRatingByManagerResponse>;
};
