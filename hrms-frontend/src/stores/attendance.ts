import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { attendanceApi } from '@/services/attendanceApi'
import type { AttendanceRecord, AttendanceFilters } from '@/types/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  // State
  const attendanceRecords = ref<AttendanceRecord[]>([])
  const totalRecords = ref(0)
  const isManualAttendance = ref(true)
  const isTimedIn = ref(false)
  const filledDates = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentWeekRecords = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6))
    
    return attendanceRecords.value.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startOfWeek && recordDate <= endOfWeek
    })
  })

  const todayRecord = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return attendanceRecords.value.find(record => record.date === today)
  })

  // Actions
  const fetchAttendanceRecords = async (
    employeeId: number,
    filters: AttendanceFilters = {}
  ) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.getAttendance(employeeId, {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        pageIndex: filters.pageIndex || 0,
        pageSize: filters.pageSize || 7
      })
      
      if (response.success) {
        const data = response.data
        attendanceRecords.value = data.attendanceReport
        totalRecords.value = data.totalRecords
        isManualAttendance.value = data.isManualAttendance
        isTimedIn.value = data.isTimedIn
        filledDates.value = data.dates
      }
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch attendance records'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addAttendance = async (employeeId: number, attendanceData: any) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.addAttendance(employeeId, attendanceData)
      
      if (response.success) {
        // Refresh attendance records
        await fetchAttendanceRecords(employeeId)
      }
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add attendance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAttendance = async (
    employeeId: number, 
    attendanceId: number, 
    attendanceData: any
  ) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.updateAttendance(
        employeeId, 
        attendanceId, 
        attendanceData
      )
      
      if (response.success) {
        // Refresh attendance records
        await fetchAttendanceRecords(employeeId)
      }
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update attendance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleAttendanceConfig = async (employeeId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.updateConfig(employeeId)
      
      if (response.success) {
        // Update local state
        isManualAttendance.value = !isManualAttendance.value
      }
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update attendance configuration'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    attendanceRecords.value = []
    totalRecords.value = 0
    isManualAttendance.value = true
    isTimedIn.value = false
    filledDates.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    attendanceRecords,
    totalRecords,
    isManualAttendance,
    isTimedIn,
    filledDates,
    loading,
    error,
    
    // Getters
    currentWeekRecords,
    todayRecord,
    
    // Actions
    fetchAttendanceRecords,
    addAttendance,
    updateAttendance,
    toggleAttendanceConfig,
    clearError,
    reset
  }
})
