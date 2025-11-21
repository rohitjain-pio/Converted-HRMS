<template>
  <div class="previous-employer-form">
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.company_name"
            label="Company Name"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.designation"
            label="Designation"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.employment_start_date"
            label="Employment Start Date"
            type="date"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.employment_end_date"
            label="Employment End Date"
            type="date"
            :rules="[rules.required, rules.endDateAfterStart]"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.manager_name"
            label="Manager Name"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.manager_contact"
            label="Manager Contact"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.hr_name"
            label="HR Name"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.hr_contact"
            label="HR Contact"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="formData.company_address"
            label="Company Address"
            variant="outlined"
            density="comfortable"
            rows="2"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="formData.reason_for_leaving"
            label="Reason for Leaving"
            variant="outlined"
            density="comfortable"
            rows="3"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="d-flex justify-end gap-2">
          <v-btn
            variant="outlined"
            @click="handleCancel"
            :disabled="saving"
          >
            Cancel
          </v-btn>
          <v-btn
            type="submit"
            color="primary"
            :loading="saving"
            :disabled="saving"
          >
            {{ editingId ? 'Update' : 'Add' }} Previous Employer
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import apiClient from '@/services/api/client';

interface PreviousEmployer {
  id?: number;
  employee_id: number;
  company_name: string;
  designation: string;
  employment_start_date: string;
  employment_end_date: string;
  reason_for_leaving?: string;
  manager_name?: string;
  manager_contact?: string;
  company_address?: string;
  hr_name?: string;
  hr_contact?: string;
}

const props = defineProps<{
  employeeId: number;
  editingId?: number | null;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<any>(null);
const saving = ref(false);

const formData = reactive<Partial<PreviousEmployer>>({
  employee_id: props.employeeId,
  company_name: '',
  designation: '',
  employment_start_date: '',
  employment_end_date: '',
  reason_for_leaving: '',
  manager_name: '',
  manager_contact: '',
  company_address: '',
  hr_name: '',
  hr_contact: ''
});

const rules = {
  required: (v: any) => !!v || 'This field is required',
  endDateAfterStart: (v: string) => {
    if (!v || !formData.employment_start_date) return true;
    return new Date(v) > new Date(formData.employment_start_date) || 'End date must be after start date';
  }
};

// Load existing data if editing
onMounted(async () => {
  if (props.editingId) {
    await loadEmployerData();
  }
});

watch(() => props.editingId, async (newId) => {
  if (newId) {
    await loadEmployerData();
  } else {
    resetForm();
  }
});

async function loadEmployerData() {
  if (!props.editingId) return;
  
  try {
    const response = await apiClient.get(`/employees/previous-employers/${props.editingId}`);
    if (response.data.success) {
      const data = response.data.data;
      Object.assign(formData, {
        company_name: data.company_name || '',
        designation: data.designation || '',
        employment_start_date: data.employment_start_date || '',
        employment_end_date: data.employment_end_date || '',
        reason_for_leaving: data.reason_for_leaving || '',
        manager_name: data.manager_name || '',
        manager_contact: data.manager_contact || '',
        company_address: data.company_address || '',
        hr_name: data.hr_name || '',
        hr_contact: data.hr_contact || ''
      });
    }
  } catch (error: any) {
    console.error('Failed to load previous employer data:', error);
    alert('Failed to load previous employer data');
  }
}

async function handleSubmit() {
  const form = formRef.value;
  if (!form) return;

  const { valid } = await form.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = {
      employee_id: props.employeeId,
      company_name: formData.company_name,
      designation: formData.designation,
      employment_start_date: formData.employment_start_date,
      employment_end_date: formData.employment_end_date,
      reason_for_leaving: formData.reason_for_leaving || null,
      manager_name: formData.manager_name || null,
      manager_contact: formData.manager_contact || null,
      company_address: formData.company_address || null,
      hr_name: formData.hr_name || null,
      hr_contact: formData.hr_contact || null
    };

    if (props.editingId) {
      // Update existing
      await apiClient.put(`/employees/previous-employers/${props.editingId}`, payload);
    } else {
      // Create new
      await apiClient.post('/employees/previous-employers', payload);
    }

    emit('saved');
    resetForm();
  } catch (error: any) {
    console.error('Failed to save previous employer:', error);
    const message = error.response?.data?.message || 'Failed to save previous employer';
    alert(message);
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  resetForm();
  emit('cancel');
}

function resetForm() {
  Object.assign(formData, {
    company_name: '',
    designation: '',
    employment_start_date: '',
    employment_end_date: '',
    reason_for_leaving: '',
    manager_name: '',
    manager_contact: '',
    company_address: '',
    hr_name: '',
    hr_contact: ''
  });
  
  if (formRef.value) {
    formRef.value.resetValidation();
  }
}
</script>

<style scoped>
.previous-employer-form {
  padding: 16px 0;
}

.gap-2 {
  gap: 8px;
}
</style>
