<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon size="120" color="error">mdi-lock-alert</v-icon>
        <h1 class="text-h2 mt-4 mb-2">403</h1>
        <h2 class="text-h5 mb-4">Access Denied</h2>
        <p class="text-body-1 mb-6">
          You don't have permission to access this resource.
        </p>
        <v-btn color="primary" size="large" @click="goBack">
          Go Back
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
