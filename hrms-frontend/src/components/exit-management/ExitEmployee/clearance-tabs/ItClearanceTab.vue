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
              v-model="formData.accessRevoked"
              label="Access Revoked"
              :items="yesNoOptions"
              item-title="label"
              item-value="value"
              :disabled="!canEdit"
              :rules="[rules.required]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="formData.assetReturned"
              label="Asset Returned"
              :items="yesNoOptions"
              item-title="label"
              item-value="value"
              :disabled="!canEdit"
              :rules="[rules.required]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="formData.assetCondition"
              label="Submitted Asset Condition"
              :items="assetConditionOptions"
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
          <v-col cols="12" md="4">
            <v-select
              v-model="formData.itClearanceCertification"
              label="Issue No Due Certificate"
              :items="yesNoOptions"
              item-title="label"
              item-value="value"
              :disabled="!canEdit"
              :rules="[rules.required]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="8">
            <v-textarea
              v-model="formData.note"
              label="Comment"
              :disabled="!canEdit"
              rows="3"
              counter="600"
              :rules="[rules.maxLength(600)]"
              density="comfortable"
              variant="outlined"
              placeholder="Add your comments"
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
          <v-col v-if="formData.attachmentUrl" cols="12" md="6" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="text"
              prepend-icon="mdi-file-document"
              @click="viewAttachment"
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
const attachmentFile = ref<File[]>([]);

interface ITClearanceData {
  accessRevoked: boolean;
  assetReturned: boolean;
  assetCondition: number;
  attachmentUrl: string | null;
  note: string;
  itClearanceCertification: boolean;
}

const formData = ref<ITClearanceData>({
  accessRevoked: false,
  assetReturned: false,
  assetCondition: 1,
  attachmentUrl: null,
  note: '',
  itClearanceCertification: false,
});

const yesNoOptions = [
  { label: 'No', value: false },
  { label: 'Yes', value: true },
];

const assetConditionOptions = [
  { label: 'OK', value: 1 },
  { label: 'Damaged', value: 2 },
  { label: 'Missing', value: 3 },
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

const fetchClearanceData = async () => {
  loading.value = true;
  try {
    const response = await adminExitEmployeeApi.getITClearance(props.resignationId);
    if (response.data.statusCode === 200 && response.data.result) {
      const data = response.data.result;
      formData.value = {
        accessRevoked: data.accessRevoked || false,
        assetReturned: data.assetReturned || false,
        assetCondition: data.assetCondition || 1,
        attachmentUrl: data.attachmentUrl || null,
        note: data.note || '',
        itClearanceCertification: data.itClearanceCertification || false,
      };
    }
  } catch (error: any) {
    console.error('Error fetching IT clearance data:', error);
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
      AccessRevoked: formData.value.accessRevoked,
      AssetReturned: formData.value.assetReturned,
      AssetCondition: formData.value.assetCondition,
      AttachmentUrl: attachmentFile.value.length > 0 ? attachmentFile.value[0] : formData.value.attachmentUrl || '',
      Note: formData.value.note,
      ITClearanceCertification: formData.value.itClearanceCertification,
      FileOriginalName: attachmentFile.value.length > 0 ? attachmentFile.value[0].name : undefined,
    };

    await adminExitEmployeeApi.upsertITClearance(payload);
    emit('updated');
    await fetchClearanceData();
    attachmentFile.value = [];
  } catch (error: any) {
    console.error('Error submitting IT clearance:', error);
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  fetchClearanceData();
  attachmentFile.value = [];
  formRef.value?.resetValidation();
};

const getAttachmentUrl = async (filename: string) => {
  if (!filename) return '';
  try {
    const response = await adminExitEmployeeApi.getDocumentUrl('user-documents', filename);
    return response.data.data.url;
  } catch (error) {
    console.error('Error getting document URL:', error);
    return '';
  }
};

const viewAttachment = async () => {
  if (formData.value.attachmentUrl) {
    const url = await getAttachmentUrl(formData.value.attachmentUrl);
    if (url) {
      window.open(url, '_blank');
    }
  }
};

onMounted(() => {
  fetchClearanceData();
});

watch(() => props.resignationId, () => {
  fetchClearanceData();
});
</script>
