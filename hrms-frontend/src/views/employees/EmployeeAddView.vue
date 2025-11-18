<template>
  <app-layout>
    <v-container fluid class="pa-4">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-btn
            icon
            variant="text"
            @click="$router.push('/employees/list')"
            class="mr-2"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          <span>Add New Employee</span>
        </v-card-title>
        <v-card-text>
          <EmployeeForm @saved="handleSaved" @cancelled="handleCancelled" />
        </v-card-text>
      </v-card>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';

const router = useRouter();

const handleSaved = (employeeId: number) => {
  router.push(`/employees/${employeeId}`);
};

const handleCancelled = () => {
  router.push('/employees/list');
};
</script>
