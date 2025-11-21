<template>
  <div class="exit-details-tab">
    <div v-if="loading" class="loading-state">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="text-center mt-4">Loading exit details...</p>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>Error Loading Details</v-alert-title>
      {{ error }}
    </v-alert>

    <div v-else-if="!resignationDetails" class="no-resignation">
      <v-card elevation="2">
        <v-card-title class="bg-orange-lighten-5 pa-4">
          <v-icon color="orange" class="mr-2">mdi-file-document-edit</v-icon>
          Submit Resignation
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="resignationForm" v-model="formValid" @submit.prevent="submitResignation">
            <v-alert type="info" variant="tonal" class="mb-4">
              Your last working day will be automatically calculated based on your notice period after submission.
            </v-alert>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="resignationData.reason"
                  label="Reason for Resignation *"
                  variant="outlined"
                  rows="5"
                  :rules="[v => !!v || 'Reason is required']"
                  hint="Please provide your reason for resignation"
                  persistent-hint
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-checkbox
                  v-model="resignationData.exitDiscussion"
                  label="I have discussed my exit with my manager"
                  color="primary"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <div class="d-flex gap-3">
              <v-btn
                color="primary"
                type="submit"
                :loading="submitting"
                :disabled="!formValid"
                variant="elevated"
                size="large"
              >
                <v-icon left>mdi-check</v-icon>
                Submit Resignation
              </v-btn>
              <v-btn
                color="grey"
                variant="text"
                size="large"
                @click="$router.push('/dashboard')"
              >
                Cancel
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </div>

    <div v-else class="resignation-details">
      <!-- Status Timeline -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon class="mr-2">mdi-timeline-clock</v-icon>
          Resignation Progress
        </v-card-title>
        <v-card-text class="pa-6">
          <v-timeline density="comfortable" side="end" align="start">
            <v-timeline-item
              dot-color="success"
              size="small"
              icon="mdi-check"
            >
              <template v-slot:opposite>
                <div class="text-caption">{{ formatDate(resignation.CreatedOn) }}</div>
              </template>
              <div>
                <div class="font-weight-bold">Submitted</div>
                <div class="text-caption text-grey">Resignation submitted successfully</div>
              </div>
            </v-timeline-item>

            <v-timeline-item
              :dot-color="resignation.Status >= 2 ? 'success' : 'grey'"
              size="small"
              :icon="resignation.Status >= 2 ? 'mdi-check' : 'mdi-clock-outline'"
            >
              <div>
                <div class="font-weight-bold">Under Review</div>
                <div class="text-caption" :class="resignation.Status >= 2 ? 'text-grey' : 'text-warning'">
                  {{ resignation.Status >= 2 ? 'Approved by management' : 'Awaiting manager approval' }}
                </div>
              </div>
            </v-timeline-item>

            <v-timeline-item
              :dot-color="resignation.Status === 2 ? 'success' : 'grey'"
              size="small"
              :icon="resignation.Status === 2 ? 'mdi-check' : 'mdi-clock-outline'"
            >
              <div>
                <div class="font-weight-bold">Clearance Process</div>
                <div class="text-caption" :class="resignation.Status === 2 ? 'text-grey' : 'text-grey'">
                  {{ resignation.Status === 2 ? 'Exit clearances in progress' : 'Pending approval' }}
                </div>
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="grey"
              size="small"
              icon="mdi-clock-outline"
            >
              <template v-slot:opposite>
                <div class="text-caption">{{ formatDate(resignation.LastWorkingDay) }}</div>
              </template>
              <div>
                <div class="font-weight-bold">Completion</div>
                <div class="text-caption text-grey">Final settlement and exit</div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>

      <!-- Resignation Information -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-grey-lighten-4 pa-4">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          Resignation Information
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-item mb-4">
                <label class="text-caption text-grey-darken-1 mb-1 d-block">Status</label>
                <v-chip
                  :color="getStatusColor(resignation.Status)"
                  variant="elevated"
                  size="small"
                >
                  {{ getResignationStatusLabel(resignation.Status) }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item mb-4">
                <label class="text-caption text-grey-darken-1 mb-1 d-block">Submission Date</label>
                <span class="text-body-1">{{ formatDate(resignation.CreatedOn) }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item mb-4">
                <label class="text-caption text-grey-darken-1 mb-1 d-block">Last Working Day</label>
                <span class="text-body-1 font-weight-bold text-primary">
                  {{ formatDate(resignation.LastWorkingDay) }}
                </span>
              </div>
            </v-col>
            <v-col cols="12" md="6" v-if="resignation.EarlyReleaseDate">
              <div class="detail-item mb-4">
                <label class="text-caption text-grey-darken-1 mb-1 d-block">Early Release Date</label>
                <span class="text-body-1 text-orange">
                  {{ formatDate(resignation.EarlyReleaseDate) }}
                </span>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <label class="text-caption text-grey-darken-1 mb-2 d-block">Resignation Reason</label>
            <v-card variant="outlined" class="pa-4 bg-grey-lighten-5">
              <p class="text-body-1 mb-0">{{ resignation.Reason }}</p>
            </v-card>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-3 mt-6" v-if="canRevoke || canRequestEarlyRelease">
            <v-btn
              v-if="canRevoke"
              color="error"
              variant="outlined"
              @click="handleRevoke"
              prepend-icon="mdi-cancel"
            >
              Revoke Resignation
            </v-btn>

            <v-btn
              v-if="canRequestEarlyRelease"
              color="orange"
              variant="elevated"
              @click="showEarlyReleaseDialog = true"
              prepend-icon="mdi-clock-fast"
            >
              Request Early Release
            </v-btn>

            <v-btn
              color="primary"
              variant="elevated"
              @click="viewFullDetails"
              prepend-icon="mdi-eye"
            >
              View Full Details
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Clearance Status (if accepted) -->
      <v-card v-if="resignation.Status === 2" elevation="2">
        <v-card-title class="bg-success text-white pa-4">
          <v-icon class="mr-2">mdi-check-circle</v-icon>
          Clearance Status
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="text-center pa-4">
                <v-icon
                  :color="resignation.ExitInterviewStatus ? 'success' : 'grey'"
                  size="48"
                >
                  {{ resignation.ExitInterviewStatus ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                </v-icon>
                <p class="text-body-2 mt-2 mb-0">HR Clearance</p>
                <p class="text-caption" :class="resignation.ExitInterviewStatus ? 'text-success' : 'text-grey'">
                  {{ resignation.ExitInterviewStatus ? 'Completed' : 'Pending' }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="text-center pa-4">
                <v-icon
                  :color="resignation.KTStatus ? 'success' : 'grey'"
                  size="48"
                >
                  {{ resignation.KTStatus ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                </v-icon>
                <p class="text-body-2 mt-2 mb-0">Department</p>
                <p class="text-caption" :class="resignation.KTStatus ? 'text-success' : 'text-grey'">
                  {{ resignation.KTStatus ? 'Completed' : 'Pending' }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="text-center pa-4">
                <v-icon
                  :color="resignation.ITDues ? 'success' : 'grey'"
                  size="48"
                >
                  {{ resignation.ITDues ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                </v-icon>
                <p class="text-body-2 mt-2 mb-0">IT Clearance</p>
                <p class="text-caption" :class="resignation.ITDues ? 'text-success' : 'text-grey'">
                  {{ resignation.ITDues ? 'Completed' : 'Pending' }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="text-center pa-4">
                <v-icon
                  :color="resignation.AccountNoDue ? 'success' : 'grey'"
                  size="48"
                >
                  {{ resignation.AccountNoDue ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                </v-icon>
                <p class="text-body-2 mt-2 mb-0">Accounts</p>
                <p class="text-caption" :class="resignation.AccountNoDue ? 'text-success' : 'text-grey'">
                  {{ resignation.AccountNoDue ? 'Completed' : 'Pending' }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Early Release Dialog -->
    <v-dialog v-model="showEarlyReleaseDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-orange text-white">
          <v-icon class="mr-2">mdi-clock-fast</v-icon>
          Request Early Release
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Request an early release if you need to leave before your scheduled last working day.
          </p>

          <v-form ref="earlyReleaseForm" v-model="earlyReleaseFormValid">
            <v-text-field
              v-model="earlyReleaseDate"
              label="Requested Early Release Date"
              type="date"
              variant="outlined"
              :rules="[v => !!v || 'Date is required']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showEarlyReleaseDialog = false"
            :disabled="requestingEarlyRelease"
          >
            Cancel
          </v-btn>
          <v-btn
            color="orange"
            variant="elevated"
            @click="handleEarlyRelease"
            :loading="requestingEarlyRelease"
            :disabled="!earlyReleaseFormValid"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :timeout="3000"
      :color="snackbarColor"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useResignationStore } from '@/stores/resignationStore';
import { 
  formatDate, 
  getResignationStatusLabel 
} from '@/utils/exitManagementHelpers';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';

const props = defineProps<{
  employeeId: number;
}>();

const router = useRouter();
const resignationStore = useResignationStore();
const resignation = computed(() => resignationStore.currentResignation);
const loading = ref(false);
const error = ref<string | null>(null);

// Resignation Form
const formValid = ref(false);
const submitting = ref(false);
const canInitiate = ref(false);
const resignationForm = ref();

const resignationData = ref({
  reason: '',
  exitDiscussion: false
});

// Early Release Dialog
const showEarlyReleaseDialog = ref(false);
const earlyReleaseDate = ref('');
const earlyReleaseFormValid = ref(false);
const requestingEarlyRelease = ref(false);

// Snackbar
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Computed properties
const canRevoke = computed(() => {
  return resignation.value?.Status === 1; // Only pending resignations can be revoked
});

const canRequestEarlyRelease = computed(() => {
  return resignation.value?.Status === 2 && !resignation.value?.EarlyReleaseDate;
});

// Methods
const submitResignation = async () => {
  if (!resignationForm.value?.validate() || !formValid.value) return;

  submitting.value = true;
  
  try {
    // Note: Backend will calculate LastWorkingDay based on notice period
    // We just send EmployeeId, DepartmentID, Reason, and ExitDiscussion
    await exitEmployeeApi.addResignation({
      EmployeeId: props.employeeId,
      DepartmentID: 1, // TODO: Get from user's employment details
      Reason: resignationData.value.reason,
      ExitDiscussion: resignationData.value.exitDiscussion
    });

    snackbarMessage.value = 'Resignation submitted successfully';
    snackbarColor.value = 'success';
    showSnackbar.value = true;

    // Reload resignation data
    const existsData = await resignationStore.checkResignationExists(props.employeeId);
    if (existsData.Exists && existsData.ResignationId) {
      await resignationStore.fetchResignation(existsData.ResignationId);
      canInitiate.value = false; // Hide form, show details
    }
  } catch (err: any) {
    snackbarMessage.value = err.message || 'Failed to submit resignation';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    submitting.value = false;
  }
};

const getStatusColor = (status: number | null | undefined) => {
  switch (status) {
    case 1: return 'warning';
    case 2: return 'success';
    case 3: return 'error';
    case 4: return 'grey';
    default: return 'grey';
  }
};

const handleRevoke = async () => {
  if (!resignation.value?.ResignationId) return;

  if (!confirm('Are you sure you want to revoke your resignation? This action cannot be undone.')) {
    return;
  }

  try {
    loading.value = true;
    await exitEmployeeApi.revokeResignation(resignation.value.ResignationId);
    
    snackbarMessage.value = 'Resignation revoked successfully';
    snackbarColor.value = 'success';
    showSnackbar.value = true;

    // Reload resignation data
    const existsData = await resignationStore.checkResignationExists(props.employeeId);
    if (existsData.Exists && existsData.ResignationId) {
      await resignationStore.fetchResignation(existsData.ResignationId);
    }
  } catch (err: any) {
    snackbarMessage.value = err.message || 'Failed to revoke resignation';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const handleEarlyRelease = async () => {
  if (!resignation.value?.ResignationId || !earlyReleaseDate.value) return;

  try {
    requestingEarlyRelease.value = true;
    await exitEmployeeApi.requestEarlyRelease({
      ResignationId: resignation.value.ResignationId,
      EarlyReleaseDate: earlyReleaseDate.value
    });

    snackbarMessage.value = 'Early release request submitted successfully';
    snackbarColor.value = 'success';
    showSnackbar.value = true;
    showEarlyReleaseDialog.value = false;
    earlyReleaseDate.value = '';

    // Reload resignation data
    const existsData = await resignationStore.checkResignationExists(props.employeeId);
    if (existsData.Exists && existsData.ResignationId) {
      await resignationStore.fetchResignation(existsData.ResignationId);
    }
  } catch (err: any) {
    snackbarMessage.value = err.message || 'Failed to submit early release request';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    requestingEarlyRelease.value = false;
  }
};

const viewFullDetails = () => {
  if (resignation.value?.ResignationId) {
    router.push(`/resignation/details/${resignation.value.ResignationId}`);
  }
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const existsData = await resignationStore.checkResignationExists(props.employeeId);
    
    if (existsData.Exists && existsData.ResignationId) {
      await resignationStore.fetchResignation(existsData.ResignationId);
      
      // Check if user can initiate new resignation (only if previous was revoked - status 4)
      const status = existsData.StatusValue;
      canInitiate.value = status === 4;
    } else {
      // No resignation exists, user can initiate
      canInitiate.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load resignation details';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.exit-details-tab {
  min-height: 400px;
}

.loading-state,
.no-resignation {
  text-align: center;
  padding: 60px 20px;
}

.detail-item label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gap-3 {
  gap: 12px;
}
</style>
