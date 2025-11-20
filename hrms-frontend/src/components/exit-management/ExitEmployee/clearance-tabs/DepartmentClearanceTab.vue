<template>
  <v-card flat>
    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </v-card-text>

    <v-card-text v-else class="pa-6">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="formData.ktStatus"
              label="KT Status"
              :items="ktStatusOptions"
              item-title="label"
              item-value="value"
              :disabled="!canEdit"
              :rules="[rules.required]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="formData.ktNotes"
              label="KT Remarks"
              :disabled="!canEdit"
              rows="4"
              counter="600"
              :rules="[rules.maxLength(600)]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="formData.ktUsers"
              label="KT Given To"
              :items="ktUsersList"
              item-title="label"
              item-value="value"
              :disabled="!canEdit"
              :loading="loadingUsers"
              multiple
              chips
              closable-chips
              density="comfortable"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-file-input
              v-model="attachmentFile"
              label="Attachment"
              :disabled="!canEdit"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              prepend-icon="mdi-paperclip"
              :rules="[rules.fileSize]"
              density="comfortable"
              variant="outlined"
              clearable
            />
          </v-col>
          <v-col v-if="formData.attachment" cols="12" md="6" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="text"
              prepend-icon="mdi-file-document"
              :href="getAttachmentUrl(formData.attachment)"
              target="_blank"
            >
              View Current Attachment
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="canEdit">
          <v-col cols="12" class="d-flex justify-center gap-3">
            <v-btn
              type="submit"
              color="primary"
              :loading="submitting"
              size="large"
            >
              {{ submitting ? 'Submitting...' : 'Submit' }}
            </v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              @click="resetForm"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';
import { employeeService } from '@/services/employeeService';
import type { VForm } from 'vuetify/components';

const props = defineProps<{
  resignationId: number;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  updated: [];
}>();

const formRef = ref<VForm | null>(null);
const loading = ref(false);
const submitting = ref(false);
const loadingUsers = ref(false);
const attachmentFile = ref<File[]>([]);
const ktUsersList = ref<Array<{label: string, value: number}>>([]);

interface DepartmentClearanceData {
  ktStatus: number;
  ktNotes: string;
  ktUsers: number[];
  attachment: string | null;
}

const formData = ref<DepartmentClearanceData>({
  ktStatus: 1,
  ktNotes: '',
  ktUsers: [],
  attachment: null,
});

const ktStatusOptions = [
  { label: 'Pending', value: 1 },
  { label: 'In Progress', value: 2 },
  { label: 'Completed', value: 3 },
];

const rules = {
  required: (v: any) => v !== null && v !== undefined && v !== '' || 'This field is required',
  maxLength: (max: number) => (v: string) => !v || v.length <= max || `Maximum ${max} characters allowed`,
  fileSize: (files: File[]) => {
    if (!files || files.length === 0) return true;
    const file = files[0];
    return file.size <= 5 * 1024 * 1024 || 'File size should not exceed 5 MB';
  },
};

const fetchKTUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await employeeService.getEmployees();
    if (response.data && Array.isArray(response.data)) {
      ktUsersList.value = response.data.map((emp: any) => ({
        label: `${emp.first_name} ${emp.last_name} (${emp.employee_code})`,
        value: emp.id
      }));
    }
  } catch (error) {
    console.error('Error fetching KT users:', error);
  } finally {
    loadingUsers.value = false;
  }
};

const fetchClearanceData = async () => {
  loading.value = true;
  try {
    const response = await adminExitEmployeeApi.getDepartmentClearance(props.resignationId);
    if (response.data.statusCode === 200 && response.data.result) {
      const data = response.data.result;
      formData.value = {
        ktStatus: data.ktStatus || 1,
        ktNotes: data.ktNotes || '',
        ktUsers: data.ktUsers || [],
        attachment: data.attachment || null,
      };
    }
  } catch (error: any) {
    console.error('Error fetching department clearance data:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  submitting.value = true;
  try {
    const payload = {
      ResignationId: props.resignationId,
      KTStatus: formData.value.ktStatus,
      KTNotes: formData.value.ktNotes,
      Attachment: attachmentFile.value.length > 0 ? attachmentFile.value[0] : formData.value.attachment || '',
      KTUsers: formData.value.ktUsers.map(String).join(','),
      FileOriginalName: attachmentFile.value.length > 0 ? attachmentFile.value[0].name : undefined,
    };

    await adminExitEmployeeApi.upsertDepartmentClearance(payload);
    emit('updated');
    await fetchClearanceData();
    attachmentFile.value = [];
  } catch (error: any) {
    console.error('Error submitting department clearance:', error);
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  fetchClearanceData();
  attachmentFile.value = [];
  formRef.value?.resetValidation();
};

const getAttachmentUrl = (filename: string) => {
  return `${import.meta.env.VITE_API_BASE_URL}/storage/${filename}`;
};

onMounted(() => {
  fetchKTUsers();
  fetchClearanceData();
});

watch(() => props.resignationId, () => {
  fetchClearanceData();
});
</script>
