import { ref, reactive, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { format } from 'date-fns'

export interface EditData {
  id: number
  date: string
  startTime: string
  endTime: string
  location: string
  notes: string
  reason: string
  totalHours: string
}

export function useAttendanceDialogs() {
  const attendanceStore = useAttendanceStore()

  // Time In Dialog State
  const timeInDialog = reactive({
    open: false,
    loading: false,
    editData: null as EditData | null
  })

  // Time Out Dialog State
  const timeOutDialog = reactive({
    open: false,
    loading: false,
    attendanceId: null as number | null
  })

  // Current time for time-out
  const currentTime = computed(() => {
    return format(new Date(), 'HH:mm')
  })

  // Show time in button if not timed in today
  const showTimeInButton = computed(() => {
    return !attendanceStore.isTimedIn
  })

  // Handle Time In submission
  const handleTimeIn = async (data: any, employeeId: number) => {
    timeInDialog.loading = true
    
    try {
      if (timeInDialog.editData && timeInDialog.editData.id > 0) {
        // Update existing attendance
        await attendanceStore.updateAttendance(
          employeeId,
          timeInDialog.editData.id,
          data
        )
      } else {
        // Add new attendance
        await attendanceStore.addAttendance(employeeId, data)
      }
      
      timeInDialog.open = false
      timeInDialog.editData = null
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      timeInDialog.loading = false
    }
  }

  // Handle Time Out submission
  const handleTimeOut = async (employeeId: number) => {
    timeOutDialog.loading = true
    
    try {
      const todayRecord = attendanceStore.todayRecord
      
      if (!todayRecord) {
        throw new Error('No attendance record found for today')
      }
      
      // Get fresh current time at the moment of time out
      const timeOutTime = format(new Date(), 'HH:mm')
      
      // Match legacy implementation exactly - only send date, endTime, and audit
      const timeOutData = {
        date: todayRecord.date,
        endTime: timeOutTime,
        audit: [
          {
            action: 'Time Out',
            time: timeOutTime
          }
        ]
      }
      
      await attendanceStore.updateAttendance(
        employeeId,
        todayRecord.id,
        timeOutData
      )
      
      timeOutDialog.open = false
      timeOutDialog.attendanceId = null
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      timeOutDialog.loading = false
    }
  }

  // Handle Edit attendance
  const handleEdit = (record: any) => {
    timeInDialog.editData = {
      id: record.id,
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      location: record.location,
      notes: '',
      reason: '',
      totalHours: record.totalHours
    }
    timeInDialog.open = true
  }

  // Open Time Out dialog
  const openTimeOutDialog = () => {
    timeOutDialog.open = true
  }

  // Open Time In dialog
  const openTimeInDialog = () => {
    timeInDialog.editData = null
    timeInDialog.open = true
  }

  return {
    timeInDialog,
    timeOutDialog,
    currentTime,
    showTimeInButton,
    handleTimeIn,
    handleTimeOut,
    handleEdit,
    openTimeOutDialog,
    openTimeInDialog
  }
}
