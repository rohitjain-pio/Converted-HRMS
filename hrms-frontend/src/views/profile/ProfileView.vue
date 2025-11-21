<template>
  <app-layout>
    <EmployeeDetailsComplete v-if="user?.id" :employee-id="user.id" />
    <v-container v-else>
      <v-alert type="error">
        Unable to load profile: Employee ID not found for current user
      </v-alert>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import EmployeeDetailsComplete from '@/components/employees/EmployeeDetailsComplete.vue';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();
</script>
