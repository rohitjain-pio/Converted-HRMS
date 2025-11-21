<template>
  <div class="exit-details-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4">Loading exit details...</p>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
      {{ error }}
    </v-alert>

    <!-- Exit Details Content -->
    <div v-else-if="exitDetails" class="pa-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h2 class="text-h4 font-weight-bold">Exit Details</h2>
      </div>

      <!-- Details Grid -->
      <v-card elevation="2" class="mb-6">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Name:</div>
                <div class="detail-value">{{ exitDetails.employeeName }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Department:</div>
                <div class="detail-value">{{ exitDetails.department }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Reporting Manager:</div>
                <div class="detail-value">{{ exitDetails.reportingManager }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Resignation Date:</div>
                <div class="detail-value">{{ formatDate(exitDetails.resignationDate) }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Last Working Day:</div>
                <div class="detail-value">{{ formatDate(exitDetails.lastWorkingDay) }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Resignation Reason:</div>
                <div class="detail-value">
                  <v-btn
                    icon="mdi-eye"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="showReasonDialog('Resignation Reason', exitDetails.reason)"
                  />
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Resignation Status:</div>
                <div class="detail-value d-flex align-center gap-2">
                  <span>{{ getStatusLabel(exitDetails.status) }}</span>
                  <v-btn
                    v-if="exitDetails.rejectResignationReason && exitDetails.status === 3"
                    icon="mdi-eye"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="showReasonDialog('Rejection Reason', exitDetails.rejectResignationReason)"
                  />
                </div>
              </div>
            </v-col>
            <v-col v-if="exitDetails.earlyReleaseDate && exitDetails.earlyReleaseStatus" cols="12" sm="6" md="4">
              <div class="detail-item">
                <div class="detail-label">Early Release Request:</div>
                <div class="detail-value d-flex align-center gap-2">
                  <span>{{ formatDate(exitDetails.earlyReleaseDate) }} ({{ getEarlyReleaseStatusLabel(exitDetails.earlyReleaseStatus) }})</span>
                  <v-btn
                    v-if="exitDetails.rejectEarlyReleaseReason && exitDetails.earlyReleaseStatus === 3"
                    icon="mdi-eye"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="showReasonDialog('Early Release Rejection Reason', exitDetails.rejectEarlyReleaseReason)"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <div class="d-flex justify-center gap-3 mb-6">
        <v-btn
          v-if="showRevokeButton"
          variant="outlined"
          color="error"
          @click="confirmRevokeDialog = true"
        >
          Revoke
        </v-btn>
        <v-btn
          v-if="showEarlyReleaseButton"
          variant="elevated"
          color="primary"
          @click="earlyReleaseDialog = true"
        >
          Request Early Release
        </v-btn>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-8">
      <v-icon size="64" color="grey">mdi-information-outline</v-icon>
      <p class="mt-4 text-grey">No exit details found</p>
    </div>

    <!-- Resignation Reason Dialog -->
    <v-dialog v-model="reasonDialog" max-width="600">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-file-document-outline</v-icon>
          {{ reasonDialogTitle }}
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1">{{ reasonDialogContent }}</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="reasonDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Early Release Request Dialog -->
    <v-dialog v-model="earlyReleaseDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-clock-fast</v-icon>
          Request Early Release
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="earlyReleaseFormRef" v-model="earlyReleaseFormValid">
            <p class="text-body-1 mb-4">
              Request an early release if you need to leave before your scheduled last working day.
            </p>
            <v-text-field
              v-model="earlyReleaseDate"
              label="Early Release Date"
              type="date"
              variant="outlined"
              :rules="earlyReleaseDateRules"
              :max="exitDetails?.lastWorkingDay"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="earlyReleaseDialog = false"
            :disabled="submittingEarlyRelease"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            @click="submitEarlyRelease"
            :loading="submittingEarlyRelease"
            :disabled="!earlyReleaseFormValid"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Revoke Confirmation Dialog -->
    <v-dialog v-model="confirmRevokeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Revoke Resignation?
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1">
            Revoking your resignation will terminate the current resignation process. 
            Please contact the HR Admin for further guidance on the next steps.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="confirmRevokeDialog = false"
            :disabled="revokingResignation"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="elevated"
            color="error"
            @click="handleRevoke"
            :loading="revokingResignation"
          >
            Revoke Resignation
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';
import moment from 'moment';

const props = defineProps<{
  employeeId: number;
}>();

const router = useRouter();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const exitDetails = ref<any>(null);
const reasonDialog = ref(false);
const reasonDialogTitle = ref('');
const reasonDialogContent = ref('');
const earlyReleaseDialog = ref(false);
const earlyReleaseDate = ref('');
const earlyReleaseFormValid = ref(false);
const earlyReleaseFormRef = ref();
const submittingEarlyRelease = ref(false);
const confirmRevokeDialog = ref(false);
const revokingResignation = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Constants for status labels
const RESIGNATION_STATUS_LABELS: Record<number, string> = {
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Revoked',
  5: 'Completed',
};

const EARLY_RELEASE_STATUS_LABELS: Record<number, string> = {
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
};

// Validation rules
const earlyReleaseDateRules = [
  (v: string) => !!v || 'Date is required',
  (v: string) => {
    if (!v || !exitDetails.value?.lastWorkingDay) return true;
    return moment(v).isBefore(moment(exitDetails.value.lastWorkingDay)) || 'Date must be before last working day';
  },
];

// Computed properties
const showRevokeButton = computed(() => {
  console.log('🔍 Computing showRevokeButton...');
  console.log('  exitDetails.value:', exitDetails.value);
  
  if (!exitDetails.value) {
    console.log('  ❌ No exitDetails');
    return false;
  }
  
  const status = exitDetails.value.status;
  const lastWorkingDay = exitDetails.value.lastWorkingDay;
  
  console.log('  Status:', status, '(should be 1 or 2)');
  console.log('  Last Working Day:', lastWorkingDay);
  console.log('  Is future date?', moment(lastWorkingDay).isSameOrAfter(moment(), 'day'));
  
  // Show revoke if status is pending (1) or accepted (2) and last working day is in future
  const shouldShow = (status === 1 || status === 2) && 
         moment(lastWorkingDay).isSameOrAfter(moment(), 'day');
         
  console.log('  ✅ Result:', shouldShow);
  return shouldShow;
});

const showEarlyReleaseButton = computed(() => {
  console.log('🔍 Computing showEarlyReleaseButton...');
  console.log('  exitDetails.value:', exitDetails.value);
  
  if (!exitDetails.value) {
    console.log('  ❌ No exitDetails');
    return false;
  }
  
  console.log('  Status:', exitDetails.value.status, '(should be 2)');
  console.log('  Early Release Date:', exitDetails.value.earlyReleaseDate);
  console.log('  Early Release Status:', exitDetails.value.earlyReleaseStatus);
  
  const shouldShow = exitDetails.value.status === 2 && 
         !exitDetails.value.earlyReleaseDate && 
         !exitDetails.value.earlyReleaseStatus;
         
  console.log('  ✅ Result:', shouldShow);
  return shouldShow;
});

// Methods
const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A';
  return moment(date).format('MMM Do, YYYY');
};

const getStatusLabel = (status: number) => {
  return RESIGNATION_STATUS_LABELS[status] || 'Unknown';
};

const getEarlyReleaseStatusLabel = (status: number) => {
  return EARLY_RELEASE_STATUS_LABELS[status] || 'Unknown';
};

const showReasonDialog = (title: string, content: string) => {
  reasonDialogTitle.value = title;
  reasonDialogContent.value = content;
  reasonDialog.value = true;
};

const fetchExitDetails = async () => {
  loading.value = true;
  error.value = null;

  try {
    // First check if resignation exists and get resignation ID
    const existsResponse = await exitEmployeeApi.isResignationExist(props.employeeId);
    
    if (existsResponse.data.StatusCode === 200) {
      const resignationData = existsResponse.data.Data;
      
      if (!resignationData.Exists || !resignationData.ResignationId) {
        exitDetails.value = null;
        loading.value = false;
        return;
      }

      // Now fetch full resignation details using resignation ID
      const detailsResponse = await exitEmployeeApi.getResignationDetails(resignationData.ResignationId);
      
      if (detailsResponse.data.StatusCode === 200 && detailsResponse.data.Data) {
        exitDetails.value = detailsResponse.data.Data;
        console.log('📋 Exit Details Loaded:', exitDetails.value);
        console.log('🔘 Status:', exitDetails.value.status);
        console.log('📅 Last Working Day:', exitDetails.value.lastWorkingDay);
        console.log('🔲 Show Revoke Button:', showRevokeButton.value);
        console.log('🔲 Show Early Release Button:', showEarlyReleaseButton.value);
      } else {
        error.value = detailsResponse.data.Message || 'Failed to load exit details';
      }
    } else {
      error.value = existsResponse.data.Message || 'Failed to check resignation status';
    }
  } catch (err: any) {
    console.error('Error fetching exit details:', err);
    error.value = err.response?.data?.Message || err.message || 'Failed to load exit details';
  } finally {
    loading.value = false;
  }
};

const submitEarlyRelease = async () => {
  if (!earlyReleaseFormRef.value?.validate() || !exitDetails.value?.id) return;

  submittingEarlyRelease.value = true;

  try {
    const response = await exitEmployeeApi.requestEarlyRelease({
      ResignationId: exitDetails.value.id,
      EarlyReleaseDate: earlyReleaseDate.value
    });

    if (response.data.StatusCode === 200) {
      snackbarMessage.value = 'Early release request submitted successfully';
      snackbarColor.value = 'success';
      snackbar.value = true;
      earlyReleaseDialog.value = false;
      earlyReleaseDate.value = '';
      
      // Refresh data
      await fetchExitDetails();
    } else {
      throw new Error(response.data.Message || 'Failed to submit request');
    }
  } catch (err: any) {
    snackbarMessage.value = err.response?.data?.Message || err.message || 'Failed to submit early release request';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    submittingEarlyRelease.value = false;
  }
};

const handleRevoke = async () => {
  if (!exitDetails.value?.id) return;

  revokingResignation.value = true;

  try {
    const response = await exitEmployeeApi.revokeResignation(exitDetails.value.id);

    if (response.data.StatusCode === 200) {
      snackbarMessage.value = 'Resignation revoked successfully';
      snackbarColor.value = 'success';
      snackbar.value = true;
      confirmRevokeDialog.value = false;

      // Navigate to personal details tab
      setTimeout(() => {
        router.push('/profile?tab=personal');
      }, 1500);
    } else {
      throw new Error(response.data.Message || 'Failed to revoke resignation');
    }
  } catch (err: any) {
    snackbarMessage.value = err.response?.data?.Message || err.message || 'Failed to revoke resignation';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    revokingResignation.value = false;
  }
};

onMounted(() => {
  fetchExitDetails();
});
</script>

<style scoped>
.exit-details-container {
  min-height: 400px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  font-weight: 700;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  color: #333;
}

.gap-3 {
  gap: 12px;
}
</style>
