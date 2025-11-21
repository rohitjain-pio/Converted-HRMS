<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Page Header -->
        <div class="d-flex align-center mb-6">
          <v-icon size="32" color="primary" class="mr-3">mdi-file-document-edit</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Submit Resignation</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">
              Complete the resignation form to initiate your exit process
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
              <p class="text-center mt-4">Loading employee details...</p>
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
        </v-alert>

        <!-- Main Content -->
        <v-row v-else>
          <!-- Resignation Form Card -->
          <v-col cols="12" lg="8">
            <v-card elevation="2">
              <v-card-title class="bg-primary text-white pa-4">
                <v-icon class="mr-2">mdi-clipboard-text</v-icon>
                Resignation Details
              </v-card-title>

              <v-card-text class="pa-6">
                <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
                  <!-- Employee Information (Read-only) -->
                  <div class="mb-6">
                    <h3 class="text-h6 mb-4">Employee Information</h3>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="Employee Name"
                          :model-value="employeeDetails?.employeeName"
                          readonly
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-account"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="Department"
                          :model-value="employeeDetails?.departmentName"
                          readonly
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-office-building"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="Reporting Manager"
                          :model-value="employeeDetails?.reportingManagerName || 'Not Assigned'"
                          readonly
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-account-tie"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="Job Type"
                          :model-value="getJobTypeLabel(employeeDetails?.jobType)"
                          readonly
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-briefcase"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>

                  <v-divider class="my-6"></v-divider>

                  <!-- Resignation Reason -->
                  <div class="mb-6">
                    <h3 class="text-h6 mb-4">
                      Reason for Resignation <span class="text-error">*</span>
                    </h3>
                    <v-textarea
                      v-model="formData.reason"
                      label="Please provide your reason for resignation"
                      placeholder="Enter your resignation reason here..."
                      variant="outlined"
                      rows="6"
                      :rules="reasonRules"
                      counter="500"
                      maxlength="500"
                      required
                      :disabled="submitting"
                    ></v-textarea>
                  </div>

                  <!-- Exit Discussion Checkbox -->
                  <div class="mb-6">
                    <v-checkbox
                      v-model="formData.exitDiscussion"
                      label="I have discussed my exit with my manager"
                      color="primary"
                      :disabled="submitting"
                      hide-details
                    ></v-checkbox>
                  </div>

                  <!-- Submit Error -->
                  <v-alert
                    v-if="submitError"
                    type="error"
                    variant="tonal"
                    closable
                    class="mb-4"
                    @click:close="submitError = null"
                  >
                    {{ submitError }}
                  </v-alert>

                  <!-- Action Buttons -->
                  <div class="d-flex justify-end gap-3">
                    <v-btn
                      color="grey"
                      variant="outlined"
                      size="large"
                      @click="handleCancel"
                      :disabled="submitting"
                    >
                      <v-icon start>mdi-close</v-icon>
                      Cancel
                    </v-btn>
                    <v-btn
                      type="submit"
                      color="primary"
                      variant="elevated"
                      size="large"
                      :loading="submitting"
                      :disabled="!formValid || submitting"
                    >
                      <v-icon start>mdi-check</v-icon>
                      Submit Resignation
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Information Panel -->
          <v-col cols="12" lg="4">
            <!-- Notice Period Info -->
            <v-card elevation="2" class="mb-4" color="blue-lighten-5">
              <v-card-title class="pa-4">
                <v-icon class="mr-2">mdi-information</v-icon>
                Notice Period Information
              </v-card-title>
              <v-card-text>
                <div v-if="calculatedLWD" class="text-body-1">
                  <p class="mb-2">
                    <strong>Notice Period:</strong> {{ noticePeriodDays }} days
                  </p>
                  <p class="mb-2">
                    <strong>Expected Last Working Day:</strong>
                  </p>
                  <p class="text-h6 text-primary">{{ calculatedLWD }}</p>
                  <v-divider class="my-3"></v-divider>
                  <p class="text-caption text-grey-darken-1">
                    * The actual last working day will be determined after management approval
                  </p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Important Notes -->
            <v-card elevation="2" color="orange-lighten-5">
              <v-card-title class="pa-4">
                <v-icon class="mr-2">mdi-alert-circle</v-icon>
                Important Notes
              </v-card-title>
              <v-card-text>
                <ul class="text-body-2">
                  <li class="mb-2">Resignation cannot be withdrawn once approved by management</li>
                  <li class="mb-2">You can revoke your resignation while it's pending approval</li>
                  <li class="mb-2">Complete all clearance formalities before your last working day</li>
                  <li class="mb-2">HR will contact you for exit interview and documentation</li>
                  <li class="mb-2">Final settlement will be processed after all clearances</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4 bg-success text-white">
          <v-icon class="mr-2">mdi-check-circle</v-icon>
          Resignation Submitted Successfully
        </v-card-title>

        <v-card-text class="pa-6">
          <div v-if="submittedResignation" class="bg-grey-lighten-4 pa-4 rounded mb-4">
            <p class="mb-2">
              <strong>Resignation Date:</strong> {{ formatDate(submittedResignation.CreatedOn) }}
            </p>
            <p class="mb-0">
              <strong>Last Working Day:</strong> {{ formatDate(submittedResignation.LastWorkingDay) }}
            </p>
          </div>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            Please note that your last working day may change based on leave taken during the notice period.
          </p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleViewDetails"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';
import { useAuth } from '@/composables/useAuth';
import { calculateLastWorkingDay, NoticePeriods } from '@/utils/exitManagementHelpers';

const router = useRouter();
const { user } = useAuth();

const formRef = ref();
const formValid = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const submitting = ref(false);
const submitError = ref<string | null>(null);
const showSuccessDialog = ref(false);

const employeeDetails = ref<any>(null);
const submittedResignation = ref<any>(null);

const formData = ref({
  reason: '',
  exitDiscussion: false,
});

const reasonRules = [
  (v: string) => !!v || 'Resignation reason is required',
  (v: string) => (v && v.length >= 10) || 'Reason must be at least 10 characters',
  (v: string) => (v && v.length <= 500) || 'Reason cannot exceed 500 characters',
];

const noticePeriodDays = computed(() => {
  const jobType = employeeDetails.value?.jobType || 3;
  return jobType === 1 ? NoticePeriods.PROBATION : 
         jobType === 2 ? NoticePeriods.TRAINING : 
         NoticePeriods.CONFIRMED;
});

const calculatedLWD = computed(() => {
  if (!employeeDetails.value?.jobType) return null;
  const lwd = calculateLastWorkingDay(new Date(), employeeDetails.value.jobType);
  return lwd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

const getJobTypeLabel = (jobType: number | undefined) => {
  switch (jobType) {
    case 1: return 'Probation';
    case 2: return 'Training';
    case 3: return 'Confirmed';
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

const fetchEmployeeDetails = async () => {
  if (!user.value?.id) {
    error.value = 'User information not available';
    loading.value = false;
    return;
  }

  try {
    // First, check if user can initiate resignation (double-check pattern from legacy)
    const statusResponse = await exitEmployeeApi.isResignationExist(user.value.id);
    
    if (statusResponse.data.StatusCode === 200) {
      const resignationData = statusResponse.data.Data;
      const status = resignationData?.Status;
      
      // Check if user can initiate new resignation
      const canInitiate = !resignationData?.Exists || 
                          status === 'RESIGNED_REJECTED' || 
                          status === 'RESIGNED_REVOKED';
      
      if (!canInitiate && resignationData?.Exists) {
        // User has active resignation, redirect to exit details
        error.value = 'You already have an active resignation. Redirecting to exit details...';
        setTimeout(() => {
          router.push('/profile?tab=exit-details');
        }, 2000);
        return;
      }
    }

    // If can initiate, fetch employee details
    const response = await exitEmployeeApi.getResignationForm(user.value.id);
    
    if (response.data.StatusCode === 200) {
      employeeDetails.value = response.data.Data;
    } else {
      error.value = response.data.Message || 'Failed to load employee details';
    }
  } catch (err: any) {
    console.error('Error fetching employee details:', err);
    error.value = err.response?.data?.Message || 'Failed to load employee details';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formValid.value || !employeeDetails.value) return;

  submitting.value = true;
  submitError.value = null;

  try {
    const response = await exitEmployeeApi.addResignation({
      EmployeeId: employeeDetails.value.employeeId,
      DepartmentID: employeeDetails.value.departmentId,
      Reason: formData.value.reason,
      ExitDiscussion: formData.value.exitDiscussion,
    });

    if (response.data.StatusCode === 200) {
      submittedResignation.value = response.data.Data;
      showSuccessDialog.value = true;
    } else {
      submitError.value = response.data.Message || 'Failed to submit resignation';
    }
  } catch (err: any) {
    console.error('Error submitting resignation:', err);
    submitError.value = err.response?.data?.Message || 'Failed to submit resignation. Please try again.';
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  router.back();
};

const handleViewDetails = () => {
  showSuccessDialog.value = false;
  // Navigate to profile exit details tab (legacy pattern)
  router.push('/profile?tab=exit-details');
};

onMounted(() => {
  fetchEmployeeDetails();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
