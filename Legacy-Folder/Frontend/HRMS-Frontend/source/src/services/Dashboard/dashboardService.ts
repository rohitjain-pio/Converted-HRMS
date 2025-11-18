import { httpInstance } from "@/api/httpInstance";
import {
  GetBirthdayResponse,
  GetEmployeeCountParams,
  GetEmployeeCountResponse,
  GetHolidayResponse,
  GetPublishedCompanyPoliciesParams,
  GetPublishedCompanyPoliciesResponse,
  GetUpcomingEventsResponse,
  GetWorkAnniversaryResponse,
} from "@/services/Dashboard/types";

const baseRoute = "/Dashboard";

export const getEmployeeCount = async ({
  from,
  to,
  days = 0,
}: GetEmployeeCountParams) => {
  return httpInstance.post(`${baseRoute}/GetEmployeesCount`, {
    from, to, days 
  }) as Promise<GetEmployeeCountResponse>;
};

export const getBirthdayList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetBirthdayList`
  ) as Promise<GetBirthdayResponse>;
};

export const getWorkAnniversaryList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetWorkAnniversaryList`,
    {}
  ) as Promise<GetWorkAnniversaryResponse>;
};

export const getHolidayList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetHolidayList`,
    {}
  ) as Promise<GetHolidayResponse>;
};

export const getUpcomingHolidayList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetUpcomingHolidayList`
  ) as Promise<GetHolidayResponse>;
};

export const getUpcomingEvents = async () => {
  return httpInstance.get(
    `${baseRoute}/GetUpcomingEvents`,
    {}
  ) as Promise<GetUpcomingEventsResponse>;
};

export const getPublishedCompanyPolicies = async ({
  from,
  to,
  days = 0,
}: GetPublishedCompanyPoliciesParams) => {
  const params = days > 0 ? { days } : { from, to };

  return httpInstance.post(
    `${baseRoute}/GetPublishedCompanyPolicies`,
    params
  ) as Promise<GetPublishedCompanyPoliciesResponse>;
};
