import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBirthdayList,
  GetBirthdayResponse,
  getEmployeeCount,
  GetEmployeeCountResponse,
  getHolidayList,
  GetHolidayResponse,
  getPublishedCompanyPolicies,
  GetPublishedCompanyPoliciesResponse,
  getUpcomingEvents,
  GetUpcomingEventsResponse,
  GetUpcomingEventsResult,
  getUpcomingHolidayList,
  getWorkAnniversaryList,
  GetWorkAnniversaryResponse,
  ICompanyPolicyDocument,
  IEmployeeBirthday,
  IEmployeeCount,
  IHoliday,
  IWorkAnniversary,
} from "@/services/Dashboard";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";

export type Flag = "India" | "USA";

export const useDashboardData = (
  from: string,
  to: string,
  days: number,
  isSubmit: boolean,
  setisSubmit: Dispatch<SetStateAction<boolean>>,
  isCustomDayRange: boolean,
  isFetchBirthdays = false,
  isFetchWorkAnniversaries = false,
  isFetchHolidays = false,
  isFetchUpcomingHolidays = false,
  isFetchUpcomingEvents = false
) => {
  const { EVENTS, COMPANY_POLICY, EMPLOYMENT_DETAILS } = permissionValue;
  const [dashboardData, setDashboardData] = useState({
    employeeCount: {} as IEmployeeCount,
    birthdayData: [] as IEmployeeBirthday[],
    workAnniversaryData: [] as IWorkAnniversary[],
    holidayData: { india: [], usa: [] } as {
      india: IHoliday[];
      usa: IHoliday[];
    },
    filteredHolidays: [] as IHoliday[],
    upcomingHolidayData: { india: [], usa: [] } as {
      india: IHoliday[];
      usa: IHoliday[];
    },
    filteredUpcomingHolidays: [] as IHoliday[],
    upcomingEvents: [] as GetUpcomingEventsResult[],
    publishedCompanyPolicies: [] as ICompanyPolicyDocument[],
  });

  const [holidayCalendarFlag, setHolidayCalendarFlag] = useState<Flag>("India");

  const { execute: fetchEmployeeCount, isLoading: isEmployeeCountLoading } =
    useAsync<GetEmployeeCountResponse>({
      requestFn: () => {
        setisSubmit(false);
        return getEmployeeCount({ from, to, days })
      },
      onSuccess: ({ data }) =>
        setDashboardData((prev) => ({
          ...prev,
          employeeCount: data.result || [],
        })),
      onError: methods.throwApiError,
    });

  const { execute: fetchBirthdays, isLoading: isBirthdayLoading } =
    useAsync<GetBirthdayResponse>({
      requestFn: getBirthdayList,
      onSuccess: ({ data }) =>
        setDashboardData((prev) => ({
          ...prev,
          birthdayData: data.result || [],
        })),
      onError: methods.throwApiError,
    });

  const {
    execute: fetchWorkAnniversaries,
    isLoading: isWorkAnniversaryLoading,
  } = useAsync<GetWorkAnniversaryResponse>({
    requestFn: getWorkAnniversaryList,
    onSuccess: ({ data }) =>
      setDashboardData((prev) => ({
        ...prev,
        workAnniversaryData: data.result || [],
      })),
    onError: methods.throwApiError,
  });

  const { execute: fetchHolidays, isLoading: isHolidayLoading } =
    useAsync<GetHolidayResponse>({
      requestFn: getHolidayList,
      onSuccess: ({ data }) => {
        if (data?.result) {
          setDashboardData((prev) => ({
            ...prev,
            holidayData: { india: data.result.india, usa: data.result.usa },
            filteredHolidays: data.result.india,
          }));
        }
      },
    });

  const {
    execute: fetchUpcomingHolidays,
    isLoading: isUpcomingHolidaysLoading,
  } = useAsync<GetHolidayResponse>({
    requestFn: getUpcomingHolidayList,
    onSuccess: ({ data }) => {
      if (data?.result) {
        setDashboardData((prev) => ({
          ...prev,
          upcomingHolidayData: {
            india: data.result.india,
            usa: data.result.usa,
          },
          filteredUpcomingHolidays: data.result.india,
        }));
      }
    },
  });

  const { execute: fetchUpcomingEvents, isLoading: isUpcomingEventsLoading } =
    useAsync<GetUpcomingEventsResponse>({
      requestFn: getUpcomingEvents,
      onSuccess: ({ data }) =>
        setDashboardData((prev) => ({
          ...prev,
          upcomingEvents: data.result || [],
        })),
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const {
    execute: fetchPublishedCompanyPolicies,
    isLoading: isPublishedCompanyPoliciesLoading,
  } = useAsync<GetPublishedCompanyPoliciesResponse>({
    requestFn: () => getPublishedCompanyPolicies({ from, to, days: 0 }),
    onSuccess: ({ data }) =>
      setDashboardData((prev) => ({
        ...prev,
        publishedCompanyPolicies: data.result || [],
      })),
    onError: methods.throwApiError,
  });

  const handleFlagChange = (flag: Flag) => {
    setDashboardData((prev) => ({
      ...prev,
      filteredHolidays:
        flag === "India" ? prev.holidayData.india : prev.holidayData.usa,
      filteredUpcomingHolidays:
        flag === "India"
          ? prev.upcomingHolidayData.india
          : prev.upcomingHolidayData.usa,
    }));

    setHolidayCalendarFlag(flag);
  };

  useEffect(() => {
    if (isCustomDayRange && !isSubmit) {
      return;
    }
    if (from && to) {
      if (hasPermission(EMPLOYMENT_DETAILS.READ)) fetchEmployeeCount();
      if (hasPermission(COMPANY_POLICY.READ)) fetchPublishedCompanyPolicies();
    }
  }, [from, to, isSubmit]);

  useEffect(() => {
    if (isFetchBirthdays) {
      fetchBirthdays();
    }
  }, [isFetchBirthdays]);

  useEffect(() => {
    if (isFetchWorkAnniversaries) {
      fetchWorkAnniversaries();
    }
  }, [isFetchWorkAnniversaries]);

  useEffect(() => {
    if (isFetchHolidays) {
      fetchHolidays();
    }
  }, [isFetchHolidays]);

  useEffect(() => {
    if (isFetchUpcomingHolidays) {
      fetchUpcomingHolidays();
    }
  }, [isFetchUpcomingHolidays]);

  useEffect(() => {
    if (isFetchUpcomingEvents && hasPermission(EVENTS.READ)) {
      fetchUpcomingEvents();
    }
  }, [isFetchUpcomingEvents]);

  return {
    dashboardData,
    isEmployeeCountLoading,
    isBirthdayLoading,
    isWorkAnniversaryLoading,
    isHolidayLoading,
    isUpcomingHolidaysLoading,
    isUpcomingEventsLoading,
    isPublishedCompanyPoliciesLoading,
    handleFlagChange,
    holidayCalendarFlag,
  };
};
