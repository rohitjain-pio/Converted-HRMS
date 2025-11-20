<template>
  <v-card flat>
    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </v-card-text>

    <v-card-text v-else class="pa-6">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="formData.advanceBonusRecoveryAmount"
              label="Advance Bonus Recovery"
              type="number"
              :disabled="!canEdit"
              :rules="[rules.required, rules.nonNegative]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="formData.currentEL"
              label="Current EL"
              type="number"
              :disabled="!canEdit"
              :rules="[rules.required, rules.nonNegative]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="formData.numberOfBuyOutDays"
              label="Number of Buyout Days"
              type="number"
              :disabled="!canEdit"
              :rules="[rules.required, rules.nonNegative]"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="formData.serviceAgreementDetails"
              label="Service Agreement"
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
          <v-col cols="12" md="4">
            <v-select
              v-model="formData.exitInterviewStatus"
              label="Exit Interview Status"
              :items="statusOptions"
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
              v-model="formData.exitInterviewDetails"
              label="Exit Interview Details"
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

interface HrClearanceData {
  advanceBonusRecoveryAmount: number;
  currentEL: number;
  numberOfBuyOutDays: number;
  serviceAgreementDetails: string;
  exitInterviewStatus: boolean;
  exitInterviewDetails: string;
  attachment: string | null;
}

const formData = ref<HrClearanceData>({
  advanceBonusRecoveryAmount: 0,
  currentEL: 0,
  numberOfBuyOutDays: 0,
  serviceAgreementDetails: '',
  exitInterviewStatus: false,
  exitInterviewDetails: '',
  attachment: null,
});

const statusOptions = [
  { label: 'Pending', value: false },
  { label: 'Completed', value: true },
];

const rules = {
  required: (v: any) => v !== null && v !== undefined && v !== '' || 'This field is required',
  nonNegative: (v: number) => v >= 0 || 'Value cannot be negative',
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
    const response = await adminExitEmployeeApi.getHRClearance(props.resignationId);
    if (response.data.statusCode === 200 && response.data.result) {
      const data = response.data.result;
      formData.value = {
        advanceBonusRecoveryAmount: data.advanceBonusRecoveryAmount || 0,
        currentEL: data.currentEL || 0,
        numberOfBuyOutDays: data.numberOfBuyOutDays || 0,
        serviceAgreementDetails: data.serviceAgreementDetails || '',
        exitInterviewStatus: data.exitInterviewStatus || false,
        exitInterviewDetails: data.exitInterviewDetails || '',
        attachment: data.attachment || null,
      };
    }
  } catch (error: any) {
    console.error('Error fetching HR clearance data:', error);
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
      AdvanceBonusRecoveryAmount: formData.value.advanceBonusRecoveryAmount,
      ServiceAgreementDetails: formData.value.serviceAgreementDetails,
      CurrentEL: formData.value.currentEL,
      NumberOfBuyOutDays: formData.value.numberOfBuyOutDays,
      ExitInterviewStatus: formData.value.exitInterviewStatus,
      ExitInterviewDetails: formData.value.exitInterviewDetails,
      Attachment: attachmentFile.value.length > 0 ? attachmentFile.value[0] : formData.value.attachment || '',
      FileOriginalName: attachmentFile.value.length > 0 ? attachmentFile.value[0].name : undefined,
    };

    await adminExitEmployeeApi.upsertHRClearance(payload);
    emit('updated');
    await fetchClearanceData();
    attachmentFile.value = [];
  } catch (error: any) {
    console.error('Error submitting HR clearance:', error);
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
  fetchClearanceData();
});

watch(() => props.resignationId, () => {
  fetchClearanceData();
});
</script>
