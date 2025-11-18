<template>
  <app-layout>
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-btn
                icon
                variant="text"
                @click="$router.push(`/employees/${employeeId}`)"
                class="mr-2"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-icon class="mr-2">mdi-account-edit</v-icon>
              <span>Edit Employee</span>
            </v-card-title>
            <v-card-text>
              <EmployeeForm 
                :employeeId="employeeId"
                :isEdit="true"
                @saved="handleSaved" 
                @cancelled="handleCancelled" 
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';

const route = useRoute();
const router = useRouter();

const employeeId = computed(() => parseInt(route.params.id as string));

const handleSaved = () => {
  router.push(`/employees/${employeeId.value}`);
};

const handleCancelled = () => {
  router.push(`/employees/${employeeId.value}`);
};
</script>
