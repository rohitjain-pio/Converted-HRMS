import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';

export const useClearanceStore = defineStore('clearance', () => {
  // State
  const hrClearance = ref<any>(null);
  const deptClearance = ref<any>(null);
  const itClearance = ref<any>(null);
  const accountClearance = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const allClearancesCompleted = computed(() => {
    return !!(hrClearance.value && deptClearance.value && itClearance.value && accountClearance.value);
  });

  const clearanceProgress = computed(() => {
    const total = 4;
    let completed = 0;
    if (hrClearance.value) completed++;
    if (deptClearance.value) completed++;
    if (itClearance.value) completed++;
    if (accountClearance.value) completed++;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  });

  const clearanceStatus = computed(() => {
    return {
      hr: hrClearance.value ? 'Completed' : 'Pending',
      department: deptClearance.value ? 'Completed' : 'Pending',
      it: itClearance.value ? 'Completed' : 'Pending',
      account: accountClearance.value ? 'Completed' : 'Pending',
    };
  });

  // Actions
  async function fetchHRClearance(resignationId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.getHRClearance(resignationId);
      if (response.data.Data.StatusCode === 200) {
        hrClearance.value = response.data.Data;
      } else if (response.data.Data.StatusCode === 404) {
        hrClearance.value = null;
      } else {
        error.value = response.data.Message;
      }
    } catch (err: any) {
      hrClearance.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDepartmentClearance(resignationId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.getDepartmentClearance(resignationId);
      if (response.data.Data.StatusCode === 200) {
        deptClearance.value = response.data.Data;
      } else if (response.data.Data.StatusCode === 404) {
        deptClearance.value = null;
      } else {
        error.value = response.data.Message;
      }
    } catch (err: any) {
      deptClearance.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchITClearance(resignationId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.getITClearance(resignationId);
      if (response.data.Data.StatusCode === 200) {
        itClearance.value = response.data.Data;
      } else if (response.data.Data.StatusCode === 404) {
        itClearance.value = null;
      } else {
        error.value = response.data.Message;
      }
    } catch (err: any) {
      itClearance.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAccountClearance(resignationId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.getAccountClearance(resignationId);
      if (response.data.Data.StatusCode === 200) {
        accountClearance.value = response.data.Data;
      } else if (response.data.Data.StatusCode === 404) {
        accountClearance.value = null;
      } else {
        error.value = response.data.Message;
      }
    } catch (err: any) {
      accountClearance.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllClearances(resignationId: number) {
    await Promise.all([
      fetchHRClearance(resignationId),
      fetchDepartmentClearance(resignationId),
      fetchITClearance(resignationId),
      fetchAccountClearance(resignationId),
    ]);
  }

  async function upsertHRClearance(data: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.upsertHRClearance(data);
      if (response.data.Data.StatusCode === 200) {
        hrClearance.value = response.data.Data;
        return { success: true };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save HR clearance';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function upsertDepartmentClearance(data: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.upsertDepartmentClearance(data);
      if (response.data.Data.StatusCode === 200) {
        deptClearance.value = response.data.Data;
        return { success: true };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save department clearance';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function upsertITClearance(data: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.upsertITClearance(data);
      if (response.data.Data.StatusCode === 200) {
        itClearance.value = response.data.Data;
        return { success: true };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save IT clearance';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  async function upsertAccountClearance(data: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminExitEmployeeApi.upsertAccountClearance(data);
      if (response.data.Data.StatusCode === 200) {
        accountClearance.value = response.data.Data;
        return { success: true };
      } else {
        error.value = response.data.Message;
        return { success: false, error: response.data.Message };
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save account clearance';
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    hrClearance.value = null;
    deptClearance.value = null;
    itClearance.value = null;
    accountClearance.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    hrClearance,
    deptClearance,
    itClearance,
    accountClearance,
    loading,
    error,
    // Getters
    allClearancesCompleted,
    clearanceProgress,
    clearanceStatus,
    // Actions
    fetchHRClearance,
    fetchDepartmentClearance,
    fetchITClearance,
    fetchAccountClearance,
    fetchAllClearances,
    upsertHRClearance,
    upsertDepartmentClearance,
    upsertITClearance,
    upsertAccountClearance,
    clearError,
    reset,
  };
});
