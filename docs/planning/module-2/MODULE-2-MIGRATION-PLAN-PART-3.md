
---

### **Step 4: Create Part 3 - Frontend Migration**

```powershell
@'
# Module-2 Employee Management Migration Plan - Part 3
## Frontend Migration (Vue.js Components, State Management)

**Migration Context**: React → Vue.js 3  
**Date**: November 10, 2025  
**Scope**: 15+ components, Pinia stores, Composition API

---

## 1. COMPONENT STRUCTURE

```vue
<!-- src/components/employee/EmployeeList.vue -->
<template>
  <VCard>
    <VDataTableServer
      v-model:items-per-page="pagination.pageSize"
      :headers="headers"
      :items="employees"
      :loading="loading"
      @update:options="handleOptionsUpdate"
    >
      <template #item.actions="{ item }">
        <VBtn @click="viewProfile(item.id)">View</VBtn>
        <VBtn @click="archiveEmployee(item)">Archive</VBtn>
      </template>
    </VDataTableServer>
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employee';

const employeeStore = useEmployeeStore();
const loading = ref(false);
const employees = computed(() => employeeStore.employees);

const fetchEmployees = async () => {
  loading.value = true;
  await employeeStore.fetchEmployees();
  loading.value = false;
};

onMounted(() => fetchEmployees());
</script>

2. PINIA STORE
// src/stores/employee.js
import { defineStore } from 'pinia';
import { employeeApi } from '@/services/api/employeeApi';

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [],
    totalRecords: 0,
  }),

  actions: {
    async fetchEmployees(filters) {
      const response = await employeeApi.getEmployees(filters);
      this.employees = response.data.data;
      this.totalRecords = response.data.totalRecords;
    },

    async archiveEmployee(id) {
      await employeeApi.archiveEmployee(id);
    },
  },
});

3. ONBOARDING WIZARD
<!-- src/components/onboarding/OnboardingWizard.vue -->
<template>
  <VCard>
    <VStepper v-model="currentStep">
      <template #item.1>
        <PersonalDetailsForm v-model="formData.personal" />
      </template>
      <template #item.2>
        <EmploymentDetailsForm v-model="formData.employment" />
      </template>
    </VStepper>

    <VBtn @click="submitOnboarding">Complete</VBtn>
  </VCard>
</template>

<script setup>
import { ref, reactive } from 'vue';

const currentStep = ref(1);
const formData = reactive({
  personal: {},
  employment: {},
});

const submitOnboarding = async () => {
  const payload = { ...formData.personal, ...formData.employment };
  await employmentStore.createEmployee(payload);
};
</script>