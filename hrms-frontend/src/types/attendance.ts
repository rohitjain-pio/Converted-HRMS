export interface AttendanceRecord {
  id: number
  date: string
  day: string
  startTime: string
  endTime: string
  totalHours: string
  location: string
  attendanceType: string
  audit: AttendanceAudit[]
}

export interface AttendanceAudit {
  action: string
  time: string
  comment: string | null
  reason: string | null
}

export interface AttendanceParams {
  dateFrom?: string
  dateTo?: string
  pageIndex?: number
  pageSize?: number
}

export interface AttendanceRequest {
  date: string
  startTime: string
  endTime?: string | null
  location: string
  attendanceType?: string
  audit?: AttendanceAudit[]
}

export interface AttendanceResponse {
  attendanceReport: AttendanceRecord[]
  totalRecords: number
  isManualAttendance: boolean
  isTimedIn: boolean
  dates: string[]
}

export interface AttendanceFilters {
  dateFrom?: string
  dateTo?: string
  pageIndex?: number
  pageSize?: number
}

export interface AttendanceConfigEmployee {
  employeeId: number
  employeeCode: string
  employeeName: string
  department: string
  designation: string
  branch: string
  joiningDate: string
  country: string
  isManualAttendance: boolean
  timeDoctorUserId: string | null
}

export interface AttendanceConfigFilters {
  employeeCode?: string
  employeeName?: string
  departmentId?: number | null
  designationId?: number | null
  branchId?: number | null
  countryId?: number | null
  isManualAttendance?: boolean | null
  dojFrom?: string | null
  dojTo?: string | null
}

export interface AttendanceConfigSearchRequest {
  sortColumnName?: string
  sortDirection?: string
  startIndex: number
  pageSize: number
  filters: AttendanceConfigFilters
}

export interface AttendanceConfigResponse {
  attendanceConfigList: AttendanceConfigEmployee[]
  totalRecords: number
}
