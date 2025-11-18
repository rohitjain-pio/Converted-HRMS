<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon size="120" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
        <h1 class="text-h2 mt-4 mb-2">404</h1>
        <h2 class="text-h5 mb-4">Page Not Found</h2>
        <p class="text-body-1 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <v-btn color="primary" size="large" @click="goHome">
          Go to Dashboard
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push({ name: 'Dashboard' });
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
