import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { EmployeeData, EmploymentDetail } from '@/types';

export const useUserStore = defineStore('user', () => {
  // State
  const employeeData = ref<EmployeeData | null>(null);
  const employmentDetail = ref<EmploymentDetail | null>(null);
  const loading = ref(false);

  // Actions
  function setEmployeeData(data: EmployeeData) {
    employeeData.value = data;
  }

  function setEmploymentDetail(detail: EmploymentDetail) {
    employmentDetail.value = detail;
  }

  function clearUserData() {
    employeeData.value = null;
    employmentDetail.value = null;
  }

  return {
    // State
    employeeData,
    employmentDetail,
    loading,
    // Actions
    setEmployeeData,
    setEmploymentDetail,
    clearUserData,
  };
});
