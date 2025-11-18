<template>
  <app-layout>
    <v-container fluid class="pa-4">
      <EmployeeListNew />
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import EmployeeListNew from '@/components/employees/EmployeeListNew.vue';
</script>
