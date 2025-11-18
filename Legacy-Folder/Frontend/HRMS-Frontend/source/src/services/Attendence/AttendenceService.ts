import { httpInstance } from "@/api/httpInstance";
import { GetEmployeeListResponse } from "@/pages/Attendance/types";
import { AttendanceConfigFilterPayload, AttendanceRow, EmployeeReportFilter } from "@/services/Attendence/typs";

const baseRoute = "/Attendance";

export const getAttendaceReport = async (userID:string,params: { dateFrom?: string; dateTo?: string; pageIndex?: number; pageSize?: number }) => {
  // params: { dateFrom, dateTo, pageIndex, pageSize }
  return httpInstance.get(`${baseRoute}/GetAttendance/${userID}`, { params });
};

export const addAttendanceReport =async (userId:string,payload: AttendanceRow) => {
  return httpInstance.post(`${baseRoute}/AddAttendance/${userId}`, payload);
};

export const updateAttendanceReport =async (userId:string,id: number, payload: AttendanceRow) => {
  return httpInstance.put(`${baseRoute}/UpdateAttendance/${userId}/${id}`, payload);
};
export const getAllAttendanceConfig = async (payload?: AttendanceConfigFilterPayload) => {
  return httpInstance.post(`${baseRoute}/GetAttendanceConfigList`, payload);
};

export const updateAttendanceConfig = async (employeeId: number) => {
  return httpInstance.put(`${baseRoute}/UpdateConfig`, null, { params: { employeeId } });
};
export const getAllEmployeeReport = async (payload?: EmployeeReportFilter) => {
  return httpInstance.post(`${baseRoute}/GetEmployeeReport`, payload)as Promise<GetEmployeeListResponse>;
};
export const GetEmployeeCodeAndNameList = async (employeeCode?: string, employeeName?: string,exEmployee?:boolean) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeCodeAndNameList`,
    { params: { employeeCode, employeeName ,exEmployee} }
  );
};
export const ExportEmployeeReport = async (args:EmployeeReportFilter) => {
  return httpInstance.post(
    `${baseRoute}/ExportEmployeeReportExcel`,
   args ,{
    responseType: "blob",
  }) as Promise<Blob>;
  
};
