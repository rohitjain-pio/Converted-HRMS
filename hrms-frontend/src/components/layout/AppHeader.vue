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

        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

defineEmits(['toggle-drawer']);

const { user, logout } = useAuth();

const handleLogout = async () => {
  await logout();
};

const navigateToProfile = () => {
  // TODO: Implement profile navigation
  console.log('Navigate to profile');
};

const navigateToSettings = () => {
  // TODO: Implement settings navigation
  console.log('Navigate to settings');
};
</script>
