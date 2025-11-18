import api from './api'
import type { 
  AttendanceParams, 
  AttendanceResponse,
  AttendanceRequest,
  AttendanceConfigFilters,
  AttendanceConfigSearchRequest,
  AttendanceConfigResponse
} from '@/types/attendance'

export const attendanceApi = {
  /**
   * Get attendance records for employee
   */
  async getAttendance(
    employeeId: number, 
    params: AttendanceParams
  ): Promise<{ success: boolean; data: AttendanceResponse }> {
    const response = await api.get(`/attendance/get-attendance/${employeeId}`, {
      params
    })
    return response.data
  },

  /**
   * Get my attendance records (alias for getAttendance)
   */
  async getMyAttendance(params: {
    employeeId: number
    startIndex?: number
    pageSize?: number
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; data: any }> {
    const { employeeId, startIndex = 0, pageSize = 10, startDate = '', endDate = '' } = params
    const response = await api.get(`/attendance/get-attendance/${employeeId}`, {
      params: {
        pageIndex: startIndex,
        pageSize,
        dateFrom: startDate,
        dateTo: endDate
      }
    })
    return response.data
  },

  /**
   * Add new attendance record
   */
  async addAttendance(
    employeeId: number, 
    data: any
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post(`/attendance/add-attendance/${employeeId}`, data)
    return response.data
  },

  /**
   * Update existing attendance record
   */
  async updateAttendance(
    attendanceId: number,
    data: any,
    employeeId?: number
  ): Promise<{ success: boolean; message: string; data: any }> {
    const empId = employeeId || data.employeeId || 0
    const response = await api.put(
      `/attendance/update-attendance/${empId}/${attendanceId}`, 
      data
    )
    return response.data
  },

  /**
   * Time Out - Update end time for current day attendance
   */
  async timeOut(params: {
    employeeId: number
  }): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post(`/attendance/time-out/${params.employeeId}`, {})
    return response.data
  },

  /**
   * Toggle attendance configuration (Manual/Automatic)
   */
  async updateConfig(employeeId: number): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put('/attendance/update-config', {
      employeeId
    })
    return response.data
  },

  /**
   * Get attendance configuration list (Admin)
   */
  async getAttendanceConfigList(
    params: AttendanceConfigSearchRequest
  ): Promise<{ 
    success: boolean
    data: AttendanceConfigResponse
  }> {
    const response = await api.post('/attendance/get-attendance-config-list', params)
    return response.data
  },

  /**
   * Get employee attendance report (Manager/HR)
   */
  async getEmployeeReport(params: {
    pageIndex?: number
    pageSize?: number
    employeeCode?: string
    employeeName?: string
    departmentId?: number | null
    branchId?: number | null
    dateFrom?: string | null
    dateTo?: string | null
    isManualAttendance?: boolean | null
  }): Promise<{ 
    success: boolean
    data: {
      employeeReports: any[]
      totalRecords: number
    }
  }> {
    const response = await api.post('/attendance/get-employee-report', params)
    return response.data
  },

  /**
   * Export attendance report to Excel
   */
  async exportEmployeeReportExcel(params: {
    pageIndex?: number
    pageSize?: number
    employeeCode?: string
    employeeName?: string
    departmentId?: number | null
    branchId?: number | null
    dateFrom?: string | null
    dateTo?: string | null
    isManualAttendance?: boolean | null
  }): Promise<Blob> {
    const response = await api.post('/attendance/export-employee-report-excel', params, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Trigger Time Doctor sync job manually
   */
  async triggerTimeDoctorSync(forDate: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post('/attendance/trigger-timesheet-sync', {
      forDate
    })
    return response.data
  }
}
