<template>
  <app-layout>
    <EmployeeDetailsComplete :employeeId="employeeId" />
  </app-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import EmployeeDetailsComplete from '@/components/employees/EmployeeDetailsComplete.vue';

const route = useRoute();
const employeeId = computed(() => parseInt(route.params.id as string));
</script>
