<template>
  <v-app-bar color="primary" elevation="2">
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    
    <v-toolbar-title>
      <span class="font-weight-bold">HRMS</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Notifications -->
    <v-btn icon>
      <v-badge color="error" content="3" overlap>
        <v-icon>mdi-bell</v-icon>
      </v-badge>
    </v-btn>

    <!-- User Menu -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar size="32">
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>{{ user?.name || 'User' }}</v-list-item-title>
          <v-list-item-subtitle>{{ user?.email || '' }}</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="navigateToProfile">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="navigateToSettings">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="handleExitClick" :disabled="checkingResignation">
          <template v-slot:prepend>
            <v-icon color="orange">mdi-exit-to-app</v-icon>
          </template>
          <v-list-item-title>
            {{ checkingResignation ? 'Checking...' : 'Exit Portal' }}
          </v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Resignation Confirmation Dialog -->
    <v-dialog v-model="showResignationDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-warning pa-4">
          <v-icon left class="mr-2">mdi-alert</v-icon>
          Are you sure you want to resign?
        </v-card-title>
        
        <v-card-text class="pa-6">
          <p class="text-body-1">
            Submitting your resignation will start the exit process, including notice period calculation and final approvals.
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showResignationDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            @click="confirmResignation"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';

defineEmits(['toggle-drawer']);

const router = useRouter();
const { user, logout } = useAuth();

const checkingResignation = ref(false);
const showResignationDialog = ref(false);
const errorMessage = ref('');

const handleLogout = async () => {
  await logout();
};

const navigateToProfile = () => {
  router.push('/profile');
};

const navigateToSettings = () => {
  // TODO: Implement settings navigation
  console.log('Navigate to settings');
};

const handleExitClick = async () => {
  if (!user.value?.id) return;

  checkingResignation.value = true;
  errorMessage.value = '';
  
  try {
    // Check if resignation exists
    const response = await exitEmployeeApi.isResignationExist(user.value.id);
    
    if (response.data.StatusCode === 200) {
      const resignationData = response.data.Data;
      
      // Check if user can initiate new resignation
      // Can initiate if: no resignation exists OR status is revoked(4) or rejected(3)
      const canInitiateNew = !resignationData?.Exists || 
                             resignationData?.ResignationStatus === 4 || 
                             resignationData?.ResignationStatus === 3;
      
      if (canInitiateNew) {
        // Show confirmation dialog before navigating to resignation form
        showResignationDialog.value = true;
      } else {
        // Active resignation exists - navigate directly to exit details
        await router.push('/profile?tab=exit-details');
      }
    }
  } catch (error) {
    console.error('Error checking resignation status:', error);
    errorMessage.value = 'Failed to check resignation status';
  } finally {
    checkingResignation.value = false;
  }
};

const confirmResignation = () => {
  showResignationDialog.value = false;
  // Navigate to resignation form to fill out details
  router.push('/resignation-form');
};
</script>
