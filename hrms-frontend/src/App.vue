<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  // Initialize auth store from localStorage on app mount
  authStore.initializeFromStorage();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: 'Roboto', sans-serif !important;
  background-color: white !important;
}

.v-application {
  font-family: 'Roboto', sans-serif !important;
}

/* Legacy color utilities */
.blueColor {
  color: #1e75bb;
  font-weight: 600;
}

.dark-color {
  color: #283a50;
}
</style>
