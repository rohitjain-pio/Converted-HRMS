import { AttendanceConfigFilter } from "@/services/Attendence/typs";

export const DEFAULT_ATTENDANCE_CONFIG_FILTERS: AttendanceConfigFilter = {
  departmentId: 0,
  designationId: 0,
  branchId: 0,
  dojFrom: null,
  dojTo: null,
  countryId: 0,
  isManualAttendance: null,
};
