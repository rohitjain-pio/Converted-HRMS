<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Page Header with Back Button -->
        <div class="d-flex align-center mb-6">
          <v-btn
            icon
            variant="text"
            @click="goBack"
            class="mr-3"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <h1 class="text-h4 font-weight-bold">My Resignation Details</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">
              View your resignation status and details
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <v-card v-if="loading" class="pa-8">
          <v-row justify="center">
            <v-col cols="auto">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="text-center mt-4">Loading resignation details...</p>
            </v-col>
          </v-row>
        </v-card>

        <!-- Error State -->
        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          prominent
          class="mb-4"
        >
          <v-alert-title>Error Loading Details</v-alert-title>
          {{ error }}
          <template v-slot:append>
            <v-btn
              color="error"
              variant="outlined"
              @click="fetchResignationDetails"
            >
              Retry
            </v-btn>
          </template>
        </v-alert>

        <!-- Main Content -->
        <v-row v-else-if="resignationDetails">
          <!-- Resignation Information Card -->
          <v-col cols="12" lg="8">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="bg-primary text-white pa-4">
                <v-icon class="mr-2">mdi-file-document</v-icon>
                Resignation Information
              </v-card-title>

              <v-card-text class="pa-6">
                <!-- Status Badge -->
                <div class="mb-4">
                  <v-chip
                    :color="getStatusColor(resignationDetails.resignationStatus)"
                    variant="elevated"
                    size="large"
                  >
                    {{ getStatusLabel(resignationDetails.resignationStatus) }}
                  </v-chip>
                </div>

                <!-- Employee Details -->
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Resignation ID</p>
                      <p class="text-h6">#{{ resignationDetails.resignationId }}</p>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Employee Name</p>
                      <p class="text-h6">{{ resignationDetails.employeeName }}</p>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Department</p>
                      <p class="text-body-1">{{ resignationDetails.departmentName }}</p>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Reporting Manager</p>
                      <p class="text-body-1">{{ resignationDetails.reportingManagerName || 'Not Assigned' }}</p>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <!-- Dates -->
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Resignation Date</p>
                      <p class="text-body-1">{{ formatDate(resignationDetails.resignationDate) }}</p>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Last Working Day</p>
                      <p class="text-body-1 font-weight-bold text-primary">
                        {{ formatDate(resignationDetails.lastWorkingDay) }}
                      </p>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" v-if="resignationDetails.earlyReleaseDate">
                    <div class="mb-4">
                      <p class="text-caption text-grey-darken-1 mb-1">Early Release Date</p>
                      <p class="text-body-1 text-orange">
                        {{ formatDate(resignationDetails.earlyReleaseDate) }}
                      </p>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <!-- Reason -->
                <div class="mb-4">
                  <p class="text-caption text-grey-darken-1 mb-2">Resignation Reason</p>
                  <v-card variant="outlined" class="pa-4 bg-grey-lighten-5">
                    <p class="text-body-1">{{ resignationDetails.reason }}</p>
                  </v-card>
                </div>

                <!-- Rejection Reason (if applicable) -->
                <div v-if="resignationDetails.rejectResignationReason" class="mb-4">
                  <p class="text-caption text-error mb-2">Rejection Reason</p>
                  <v-card variant="outlined" class="pa-4 bg-error-lighten-5">
                    <p class="text-body-1">{{ resignationDetails.rejectResignationReason }}</p>
                  </v-card>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-3 mt-6">
                  <v-btn
                    v-if="canRevoke"
                    color="error"
                    variant="outlined"
                    @click="showRevokeDialog = true"
                    :disabled="revokingResignation"
                  >
                    <v-icon start>mdi-cancel</v-icon>
                    Revoke Resignation
                  </v-btn>

                  <v-btn
                    v-if="canRequestEarlyRelease"
                    color="orange"
                    variant="elevated"
                    @click="showEarlyReleaseDialog = true"
                  >
                    <v-icon start>mdi-clock-fast</v-icon>
                    Request Early Release
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Clearance Status (if resignation is accepted) -->
            <v-card v-if="isResignationAccepted" elevation="2">
              <v-card-title class="bg-success text-white pa-4">
                <v-icon class="mr-2">mdi-check-circle</v-icon>
                Clearance Status
              </v-card-title>

              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" sm="6" md="3" v-for="clearance in clearanceStatus" :key="clearance.name">
                    <v-card variant="outlined" class="text-center pa-4">
                      <v-icon
                        :color="clearance.completed ? 'success' : 'grey'"
                        size="48"
                      >
                        {{ clearance.completed ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                      </v-icon>
                      <p class="text-body-2 mt-2 mb-0">{{ clearance.name }}</p>
                      <p class="text-caption" :class="clearance.completed ? 'text-success' : 'text-grey'">
                        {{ clearance.completed ? 'Completed' : 'Pending' }}
                      </p>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Timeline / Status Info -->
          <v-col cols="12" lg="4">
            <v-card elevation="2" color="blue-lighten-5">
              <v-card-title class="pa-4">
                <v-icon class="mr-2">mdi-timeline-clock</v-icon>
                Process Timeline
              </v-card-title>
              <v-card-text>
                <v-timeline density="compact" side="end" align="start">
                  <v-timeline-item
                    dot-color="success"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">{{ formatDate(resignationDetails.resignationDate) }}</div>
                    </template>
                    <div>
                      <div class="font-weight-bold">Submitted</div>
                      <div class="text-caption">Resignation submitted successfully</div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    :dot-color="resignationDetails.resignationStatus >= 2 ? 'success' : 'grey'"
                    size="small"
                  >
                    <div>
                      <div class="font-weight-bold">Under Review</div>
                      <div class="text-caption">Awaiting manager approval</div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    :dot-color="resignationDetails.resignationStatus >= 2 ? 'success' : 'grey'"
                    size="small"
                  >
                    <div>
                      <div class="font-weight-bold">Approved</div>
                      <div class="text-caption">Management approved</div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    :dot-color="resignationDetails.allClearancesCompleted ? 'success' : 'grey'"
                    size="small"
                  >
                    <div>
                      <div class="font-weight-bold">Clearance</div>
                      <div class="text-caption">Exit clearances in progress</div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    dot-color="grey"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">{{ formatDate(resignationDetails.lastWorkingDay) }}</div>
                    </template>
                    <div>
                      <div class="font-weight-bold">Completed</div>
                      <div class="text-caption">Final settlement</div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Revoke Resignation Dialog -->
    <v-dialog v-model="showRevokeDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-error text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Revoke Resignation
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Are you sure you want to revoke your resignation? This action cannot be undone.
          </p>
          <v-alert type="warning" variant="tonal" class="mb-0">
            Your resignation will be cancelled and removed from the system.
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showRevokeDialog = false"
            :disabled="revokingResignation"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleRevokeResignation"
            :loading="revokingResignation"
          >
            Revoke Resignation
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

          <v-form ref="earlyReleaseFormRef" v-model="earlyReleaseFormValid">
            <v-text-field
              v-model="earlyReleaseDate"
              label="Requested Early Release Date"
              type="date"
              variant="outlined"
              :rules="[v => !!v || 'Date is required']"
              required
            ></v-text-field>

            <v-textarea
              v-model="earlyReleaseReason"
              label="Reason for Early Release"
              placeholder="Please explain why you need early release..."
              variant="outlined"
              rows="4"
              counter="500"
              maxlength="500"
              :rules="[
                v => !!v || 'Reason is required',
                v => (v && v.length >= 10) || 'Reason must be at least 10 characters'
              ]"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="handleCancelEarlyRelease"
            :disabled="requestingEarlyRelease"
          >
            Cancel
          </v-btn>
          <v-btn
            color="orange"
            variant="elevated"
            @click="handleRequestEarlyRelease"
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
      v-model="showSuccessSnackbar"
      :timeout="3000"
      color="success"
      location="top"
    >
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';

const route = useRoute();
const router = useRouter();

const resignationId = computed(() => Number(route.params.id));

const loading = ref(true);
const error = ref<string | null>(null);
const resignationDetails = ref<any>(null);

const showRevokeDialog = ref(false);
const revokingResignation = ref(false);

const showEarlyReleaseDialog = ref(false);
const earlyReleaseFormRef = ref();
const earlyReleaseFormValid = ref(false);
const earlyReleaseDate = ref('');
const earlyReleaseReason = ref('');
const requestingEarlyRelease = ref(false);

const showSuccessSnackbar = ref(false);
const successMessage = ref('');

const canRevoke = computed(() => {
  return resignationDetails.value?.resignationStatus === 1; // Pending status
});

const canRequestEarlyRelease = computed(() => {
  return resignationDetails.value?.resignationStatus === 2 && // Accepted
         !resignationDetails.value?.earlyReleaseRequest;
});

const isResignationAccepted = computed(() => {
  return resignationDetails.value?.resignationStatus === 2;
});

const clearanceStatus = computed(() => {
  if (!resignationDetails.value) return [];
  
  return [
    { name: 'HR Clearance', completed: resignationDetails.value.exitInterviewStatus },
    { name: 'Department', completed: resignationDetails.value.ktStatus },
    { name: 'IT Clearance', completed: resignationDetails.value.itNoDue },
    { name: 'Accounts', completed: resignationDetails.value.accountsNoDue },
  ];
});

const getStatusColor = (status: number) => {
  switch (status) {
    case 1: return 'warning'; // Pending
    case 2: return 'success'; // Accepted
    case 3: return 'error';   // Rejected
    case 4: return 'grey';    // Revoked
    default: return 'grey';
  }
};

const getStatusLabel = (status: number) => {
  switch (status) {
    case 1: return 'Pending Approval';
    case 2: return 'Accepted';
    case 3: return 'Rejected';
    case 4: return 'Revoked';
    default: return 'Unknown';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fetchResignationDetails = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await exitEmployeeApi.getResignationDetails(resignationId.value);
    
    if (response.data.StatusCode === 200) {
      resignationDetails.value = response.data.Data;
    } else {
      error.value = response.data.Message || 'Failed to load resignation details';
    }
  } catch (err: any) {
    console.error('Error fetching resignation details:', err);
    error.value = err.response?.data?.Message || 'Failed to load resignation details';
  } finally {
    loading.value = false;
  }
};

const handleRevokeResignation = async () => {
  revokingResignation.value = true;

  try {
    const response = await exitEmployeeApi.revokeResignation(resignationId.value);
    
    if (response.data.StatusCode === 200) {
      successMessage.value = 'Resignation revoked successfully';
      showSuccessSnackbar.value = true;
      showRevokeDialog.value = false;
      
      // Redirect to home or refresh
      setTimeout(() => {
        router.push({ name: 'dashboard' });
      }, 2000);
    } else {
      error.value = response.data.Message || 'Failed to revoke resignation';
    }
  } catch (err: any) {
    console.error('Error revoking resignation:', err);
    error.value = err.response?.data?.Message || 'Failed to revoke resignation';
  } finally {
    revokingResignation.value = false;
  }
};

const handleRequestEarlyRelease = async () => {
  if (!earlyReleaseFormValid.value) return;

  requestingEarlyRelease.value = true;

  try {
    const response = await exitEmployeeApi.requestEarlyRelease({
      ResignationId: resignationId.value,
      EarlyReleaseDate: earlyReleaseDate.value,
      ResignationStatus: resignationDetails.value.resignationStatus,
    });
    
    if (response.data.StatusCode === 200) {
      successMessage.value = 'Early release request submitted successfully';
      showSuccessSnackbar.value = true;
      showEarlyReleaseDialog.value = false;
      
      // Refresh details
      await fetchResignationDetails();
    } else {
      error.value = response.data.Message || 'Failed to request early release';
    }
  } catch (err: any) {
    console.error('Error requesting early release:', err);
    error.value = err.response?.data?.Message || 'Failed to request early release';
  } finally {
    requestingEarlyRelease.value = false;
  }
};

const handleCancelEarlyRelease = () => {
  showEarlyReleaseDialog.value = false;
  earlyReleaseDate.value = '';
  earlyReleaseReason.value = '';
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchResignationDetails();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
