import { httpInstance } from "@/api/httpInstance";
import { GetEmployeeGroupApiResponse } from "@/services/EmployeeGroups/types";

const baseRoute = "/EmployeeGroup";

export const getEmployeeGroups = async () => {
  return httpInstance.get(
    `${baseRoute}`
  ) as Promise<GetEmployeeGroupApiResponse>;
};
