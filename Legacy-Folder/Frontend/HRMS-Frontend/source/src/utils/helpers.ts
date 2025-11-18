import { HttpStatusCode } from "axios";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import moment from "moment";
import {
  APIPaginationParams,
  APISortParams,
  DaySlot,
  JobType,
  JobTypes,
  NOTICE_PERIOD_CONFIG_BY_JOB_TYPE,
} from "@/utils/constants";
import { IHoliday } from "@/services/EmployeeLeave";

export function cleanLocalStorage(keysToKeep: string[] = []) {
  if (keysToKeep.length === 0) {
    localStorage.clear();
    return;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && !keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  }
}

export const ApiErrorStatusCodes = {
  BuildVersionError: HttpStatusCode.UnprocessableEntity,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isBuildVersionError(err: any) {
  const statusCode = Number(err?.response?.status);
  return statusCode === ApiErrorStatusCodes.BuildVersionError;
}

export function calculateLastWorkingDay(
  fromDate: moment.Moment,
  jobType: JobType
) {
  const config = NOTICE_PERIOD_CONFIG_BY_JOB_TYPE[jobType];
  return fromDate.clone().add(config.amount, config.unit);
}

export function isValidJobType(x: unknown): x is JobType {
  return (
    typeof x === "number" && Object.values(JobTypes).includes(x as JobType)
  );
}

export function truncate(
  text: string,
  options: { maxLength: number; suffix?: string }
) {
  const ELLIPSIS = "\u2026";
  const { maxLength, suffix = ELLIPSIS } = options;

  if (!text || typeof text !== "string") {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  const effectiveMaxLength = Math.max(0, maxLength - suffix.length);

  const truncatedText = text.substring(0, effectiveMaxLength);

  return truncatedText + suffix;
}

export function getNoticePeriod(jobType: number) {
  if (!isValidJobType(jobType)) {
    return "";
  }

  const { amount, unit } = NOTICE_PERIOD_CONFIG_BY_JOB_TYPE[jobType];
  return `${amount} ${unit}`;
}

export const calculateLeaveDays = (
  startDate: moment.Moment,
  startDateSlot: number,
  endDate: moment.Moment,
  endDateSlot: number,
  holidayList: IHoliday[] | undefined
): number => {
  if (
    !startDate.isValid() ||
    !endDate.isValid() ||
    startDate.isAfter(endDate)
  ) {
    return 0;
  }

  let businessDays = 0;
  const date = startDate.clone();

  while (date.isSameOrBefore(endDate, "day")) {
    const isHoliday = holidayList?.some((holiday: IHoliday) =>
      moment(holiday.date, "MM/DD/YYYY").isSame(date, "day")
    );

    const day = date.day();
    if (day !== 0 && day !== 6 && !isHoliday) {
      businessDays++;
    }
    date.add(1, "day");
  }

  let totalDays = businessDays;

  if (businessDays > 0) {
    if (startDate.isSame(endDate, "day")) {
      if (
        startDateSlot === DaySlot.FirstHalf &&
        endDateSlot === DaySlot.FirstHalf
      ) {
        totalDays = 0.5;
      } else if (
        startDateSlot === DaySlot.SecondHalf &&
        endDateSlot === DaySlot.SecondHalf
      ) {
        totalDays = 0.5;
      } else if (
        startDateSlot === DaySlot.FirstHalf &&
        endDateSlot === DaySlot.FullDay
      ) {
        totalDays = 1;
      } else if (
        startDateSlot === DaySlot.SecondHalf &&
        endDateSlot === DaySlot.FullDay
      ) {
        totalDays = 1;
      } else {
        totalDays = 1;
      }
    } else {
      // if (startDateSlot === DaySlot.SecondHalf) {
      //   totalDays -= 0.5;
      // }

      // if (endDateSlot === DaySlot.FirstHalf) {
      //   totalDays -= 0.5;
      // }

      if (
        startDateSlot === DaySlot.FirstHalf ||
        startDateSlot === DaySlot.SecondHalf
      ) {
        totalDays -= 0.5;
      }

      if (
        endDateSlot === DaySlot.FirstHalf ||
        endDateSlot === DaySlot.SecondHalf
      ) {
        totalDays -= 0.5;
      }
    }
  } else {
    totalDays = 0;
  }

  return Math.max(0, totalDays);
};

export function parseCsv(raw: unknown) {
  if (typeof raw !== "string" || !raw) {
    return [];
  }

  const tokens = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return tokens;
}

export function momentToFormatString(m: moment.Moment): string {
  return m.format("YYYY-MM-DDTHH:mm:ss");
}

export const mapSortingToApiParams = (
  sorting: MRT_SortingState
): APISortParams => {
  if (!sorting.length) {
    return { sortColumnName: "", sortDirection: "" };
  }

  const { id, desc } = sorting[0];

  return {
    sortColumnName: id,
    sortDirection: desc ? "desc" : "asc",
  };
};

export const mapPaginationToApiParams = (
  pagination: MRT_PaginationState
): APIPaginationParams => {
  return {
    startIndex: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  };
};

export function getSerialNumber(
  pageIndex: number,
  pageSize: number,
  rowIndex: number
) {
  return pageIndex * pageSize + rowIndex + 1;
}
