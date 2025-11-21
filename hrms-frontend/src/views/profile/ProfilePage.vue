<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Page Header -->
        <div class="d-flex align-center mb-6">
          <v-icon size="32" color="primary" class="mr-3">mdi-account</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">My Profile</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">
              View and manage your personal information
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
              <p class="text-center mt-4">Loading profile...</p>
            </v-col>
          </v-row>
        </v-card>

        <!-- Profile Tabs -->
        <v-card v-else elevation="2">
          <v-tabs
            v-model="activeTab"
            bg-color="primary"
            dark
            slider-color="white"
          >
            <v-tab value="personal">
              <v-icon start>mdi-account</v-icon>
              Personal Details
            </v-tab>
            <v-tab value="employment">
              <v-icon start>mdi-briefcase</v-icon>
              Employment Details
            </v-tab>
            <v-tab value="official">
              <v-icon start>mdi-office-building</v-icon>
              Official Details
            </v-tab>
            <v-tab v-if="hasResignation" value="exit-details">
              <v-icon start>mdi-exit-to-app</v-icon>
              Exit Details
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- Personal Details Tab -->
            <v-window-item value="personal">
              <v-card-text class="pa-6">
                <div class="text-center mb-6">
                  <v-avatar size="120" color="primary">
                    <v-icon size="60">mdi-account</v-icon>
                  </v-avatar>
                  <h2 class="text-h5 mt-4">{{ user?.name || 'User' }}</h2>
                  <p class="text-body-1 text-grey-darken-1">{{ user?.email }}</p>
                </div>
                
                <v-alert type="info" variant="tonal" class="mb-4">
                  <v-alert-title>Personal Details Module</v-alert-title>
                  This section will display comprehensive personal information including contact details, emergency contacts, and personal documents.
                </v-alert>

                <!-- Placeholder for actual personal details component -->
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-account-details</v-icon>
                  <p class="text-h6 mt-4 text-grey">Personal details component to be implemented</p>
                </div>
              </v-card-text>
            </v-window-item>

            <!-- Employment Details Tab -->
            <v-window-item value="employment">
              <v-card-text class="pa-6">
                <v-alert type="info" variant="tonal" class="mb-4">
                  <v-alert-title>Employment Details Module</v-alert-title>
                  This section will display employment information including job title, department, manager, joining date, and work history.
                </v-alert>

                <!-- Placeholder for actual employment details component -->
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-briefcase-variant</v-icon>
                  <p class="text-h6 mt-4 text-grey">Employment details component to be implemented</p>
                </div>
              </v-card-text>
            </v-window-item>

            <!-- Official Details Tab -->
            <v-window-item value="official">
              <v-card-text class="pa-6">
                <v-alert type="info" variant="tonal" class="mb-4">
                  <v-alert-title>Official Details Module</v-alert-title>
                  This section will display official documents and information including ID proofs, certificates, and compliance documents.
                </v-alert>

                <!-- Placeholder for actual official details component -->
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-file-document</v-icon>
                  <p class="text-h6 mt-4 text-grey">Official details component to be implemented</p>
                </div>
              </v-card-text>
            </v-window-item>

            <!-- Exit Details Tab -->
            <v-window-item v-if="hasResignation" value="exit-details">
              <ExitDetailsTab :employee-id="user?.id || 0" />
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';
import ExitDetailsTab from '@/components/employees/tabs/ExitDetailsTab.vue';

const route = useRoute();
const { user } = useAuth();

const activeTab = ref('personal');
const loading = ref(true);
const hasResignation = ref(false);

// Check if user has resignation on mount
const checkResignationStatus = async () => {
  if (!user.value?.id) {
    loading.value = false;
    return;
  }

  try {
    const response = await exitEmployeeApi.isResignationExist(user.value.id);
    if (response.data.StatusCode === 200) {
      const resignationData = response.data.Data;
      // Show tab if ANY resignation exists (including revoked/rejected)
      hasResignation.value = resignationData?.Exists === true;
    }
  } catch (error) {
    console.error('Error checking resignation status:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for tab query parameter
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && typeof newTab === 'string') {
      activeTab.value = newTab;
    }
  },
  { immediate: true }
);

onMounted(() => {
  checkResignationStatus();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
