<template>
  <app-layout>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Dashboard</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-overline mb-1">Total Employees</div>
              <div class="text-h5">0</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-overline mb-1">Present Today</div>
              <div class="text-h5">0</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-overline mb-1">On Leave</div>
              <div class="text-h5">0</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-overline mb-1">Pending Approvals</div>
              <div class="text-h5">0</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Welcome, {{ user?.name }}</v-card-title>
            <v-card-text>
              <p>Email: {{ user?.email }}</p>
              <p>Role ID: {{ user?.role }}</p>
              <p>Permissions: {{ permissions.length }} granted</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { useAuth } from '@/composables/useAuth';

const { user, permissions } = useAuth();
</script>
