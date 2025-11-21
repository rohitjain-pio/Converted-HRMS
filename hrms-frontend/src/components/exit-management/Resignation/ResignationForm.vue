<template>
  <app-layout>
    <v-container fluid class="pa-6">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <v-row justify="center">
          <v-col cols="auto">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="text-center mt-4">Checking resignation status...</p>
          </v-col>
        </v-row>
      </div>

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <v-alert-title>Error</v-alert-title>
        {{ error }}
      </v-alert>

      <!-- Resignation Form (only shown if can initiate) -->
      <div v-else-if="canShowForm">
        <v-card elevation="2" class="mx-auto" max-width="800">
          <v-card-title class="bg-orange-lighten-5 pa-4">
            <v-icon color="orange" class="mr-2">mdi-file-document-edit</v-icon>
            Submit Resignation
          </v-card-title>
          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              Your last working day will be automatically calculated based on your notice period after submission.
            </v-alert>

            <v-form ref="resignationFormRef" v-model="formValid" @submit.prevent="submitResignation">
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="resignationData.reason"
                    label="Reason for Resignation *"
                    variant="outlined"
                    rows="5"
                    counter="500"
                    maxlength="500"
                    :rules="[
                      v => !!v || 'Reason is required',
                      v => (v && v.length <= 500) || 'Reason must be 500 characters or less'
                    ]"
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
                  @click="router.push('/dashboard')"
                >
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </div>

      <!-- Snackbar for feedback -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        :timeout="3000"
        location="top"
      >
        {{ snackbarMessage }}
      </v-snackbar>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useResignationStore } from '@/stores/resignationStore';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';
import AppLayout from '@/components/layout/AppLayout.vue';

const router = useRouter();
const { user } = useAuth();
const resignationStore = useResignationStore();

const loading = ref(true);
const error = ref<string | null>(null);
const canShowForm = ref(false);
const formValid = ref(false);
const submitting = ref(false);
const resignationFormRef = ref();

const resignationData = ref({
  reason: '',
  exitDiscussion: false
});

// Snackbar
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const submitResignation = async () => {
  if (!resignationFormRef.value?.validate() || !formValid.value || !user.value) return;

  submitting.value = true;
  
  try {
    // Submit resignation (backend calculates LastWorkingDay)
    await exitEmployeeApi.addResignation({
      EmployeeId: user.value.id,
      DepartmentID: 1, // TODO: Get from user's employment details
      Reason: resignationData.value.reason,
      ExitDiscussion: resignationData.value.exitDiscussion
    });

    snackbarMessage.value = 'Resignation submitted successfully! Redirecting to your profile...';
    snackbarColor.value = 'success';
    showSnackbar.value = true;

    // Wait a bit longer to ensure backend has saved the data
    setTimeout(() => {
      // Use router.replace to avoid back button issues
      router.replace('/profile?tab=exit-details');
    }, 2500);
  } catch (err: any) {
    snackbarMessage.value = err.response?.data?.message || err.message || 'Failed to submit resignation';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
    submitting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  if (!user.value) {
    error.value = 'User not authenticated';
    loading.value = false;
    return;
  }

  try {
    // Check if resignation already exists
    const existsData = await resignationStore.checkResignationExists(user.value.id);
    
    // Legacy logic: Only allow new resignation if:
    // 1. No resignation exists, OR
    // 2. Previous resignation was cancelled/revoked (status 4 or 5)
    if (existsData.Exists && existsData.ResignationId) {
      const status = existsData.StatusValue; // Use StatusValue from backend
      
      // Status: 1=Pending, 2=Approved, 3=Rejected, 4=Revoked, 5=Completed
      // Allow new resignation only if previous was revoked (4)
      // Note: In legacy, both "cancelled" and "revoked" are status 4
      const canInitiateNew = status === 4;
      
      if (canInitiateNew) {
        // Can submit new resignation
        canShowForm.value = true;
      } else {
        // Redirect to profile's Exit Details tab
        snackbarMessage.value = 'You already have an active resignation. Redirecting to your profile...';
        snackbarColor.value = 'info';
        showSnackbar.value = true;
        
        setTimeout(() => {
          router.push('/profile?tab=exit-details');
        }, 1500);
      }
    } else {
      // No resignation exists, show form
      canShowForm.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to check resignation status';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading-state {
  text-align: center;
  padding: 60px 20px;
  min-height: 400px;
}

.gap-3 {
  gap: 12px;
}
</style>

