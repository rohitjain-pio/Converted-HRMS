import { httpInstance } from "@/api/httpInstance";
import {
    UpdateOfficialDetailResponse,
  GetOfficialDetailByIdResponse,
  UpdateOfficialDetailArgs,
} from "@/services/OfficialDetails/types";

const baseRoute = "/OfficialDetails";

export const getOfficialDetailById = async (userId: string) => {
  return httpInstance.get(
    `${baseRoute}/${userId}`
  ) as Promise<GetOfficialDetailByIdResponse>;
};

export const updateOfficialDetail = async (
  payload: UpdateOfficialDetailArgs
) => {
  return httpInstance.post(
    `${baseRoute}/UpdateOfficialDetails`,
    payload
  ) as Promise<UpdateOfficialDetailResponse>;
};
