import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';
import { 
  ResignationStatus, 
  canRevokeResignation, 
  canRequestEarlyRelease 
} from '@/utils/exitManagementHelpers';

export const useResignationStore = defineStore('resignation', () => {
  // State
  const currentResignation = ref<any>(null);
  const resignationList = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasActiveResignation = computed(() => {
    return currentResignation.value !== null && 
           (currentResignation.value.Status === ResignationStatus.PENDING || 
            currentResignation.value.Status === ResignationStatus.ACCEPTED);
  });

  const canRevoke = computed(() => {
    return currentResignation.value && canRevokeResignation(currentResignation.value.Status);
  });

  const canRequestEarlyReleaseComputed = computed((): boolean => {
    return currentResignation.value && canRequestEarlyRelease(currentResignation.value.Status);
  });

  // Actions
  async function fetchResignation(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await exitEmployeeApi.getResignationDetails(id);
      if (response.data.StatusCode === 200) {
        currentResignation.value = response.data.Data;
      } else {
        error.value = response.data.Message;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch resignation';
    } finally {
      loading.value = false;
    }
  }

  async function submitResignation(data: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await exitEmployeeApi.addResignation(data);
      if (response.data.StatusCode === 200) {
        currentResignation.value = response.data.Data;
        return { success: true, data: response.data.Data };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to submit resignation';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function revokeResignation(resignationId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await exitEmployeeApi.revokeResignation(resignationId);
      if (response.data.StatusCode === 200) {
        currentResignation.value = response.data.Data;
        return { success: true };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to revoke resignation';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function requestEarlyRelease(data: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await exitEmployeeApi.requestEarlyRelease(data);
      if (response.data.StatusCode === 200) {
        currentResignation.value = response.data.Data;
        return { success: true };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to request early release';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function checkResignationExists(employeeId: number) {
    try {
      const response = await exitEmployeeApi.isResignationExist(employeeId);
      if (response.data.StatusCode === 200) {
        return response.data.Data;
      }
      return { Exists: false, ResignationId: null };
    } catch (err) {
      return { Exists: false, ResignationId: null };
    }
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    currentResignation.value = null;
    resignationList.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    currentResignation,
    resignationList,
    loading,
    error,
    // Getters
    hasActiveResignation,
    canRevoke,
    canRequestEarlyRelease: canRequestEarlyReleaseComputed,
    // Actions
    fetchResignation,
    submitResignation,
    revokeResignation,
    requestEarlyRelease,
    checkResignationExists,
    clearError,
    reset,
  };
});
