# Time Doctor Integration - UI Migration Guide

## Overview
This document provides comprehensive migration guidance for the Time Doctor Integration module from React to Vue.js, focusing on user management, time tracking synchronization, productivity monitoring, and reporting features.

## React Component Analysis

### Current React Implementation
```typescript
// React: FetchTimeDoctorStatsForm.tsx
import { forwardRef, useImperativeHandle } from "react";
import * as Yup from "yup";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import moment from "moment";

const validationSchema = Yup.object().shape({
  forDate: Yup.mixed<moment.Moment>()
    .defined()
    .required("For Date is required"),
});

type TriggerPayload = {
  forDate: string;
};

type FormValues = Yup.InferType<typeof validationSchema>;

const FetchTimeDoctorStatsFormForm = forwardRef<FilterFormHandle, FilterFormProps>((props, ref) => {
  const { onTrigger, loading } = props;

  const method = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      forDate: moment(),
    },
  });

  const onSubmit: SubmitHandler<FormValues> = ({ forDate }) => {
    onTrigger({
      forDate: momentToFormatString(forDate),
    });
  };

  return (
    <FormProvider {...method}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <FormDatePicker
              name="forDate"
              label="For Date"
              format="MMM Do, YYYY"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <Stack direction="row" sx={{ gap: 2, justifyContent: "center" }}>
              <SubmitButtonSimple loading={loading}>Run</SubmitButtonSimple>
              <ResetButton onClick={handleReset} />
            </Stack>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
});
```

### Employee Time Doctor Integration
```typescript
// React: Employee form with Time Doctor field
interface EmployeeFormData {
  timeDoctorUserId: string | null;
  // ... other fields
}

const AddEmployeeForm = () => {
  const formSchema = Yup.object().shape({
    timeDoctorUserId: Yup.string()
      .nullable()
      .test('valid-timedoctor-id', 'Invalid Time Doctor User ID', async function (value) {
        if (!value) return true;
        // Validation logic here
        return await validateTimeDoctorUserId(value);
      })
  });

  return (
    <FormProvider {...methods}>
      <Grid item xs={12}>
        <FormTextField
          label="Time Doctor User Id"
          name="timeDoctorUserId"
        />
      </Grid>
    </FormProvider>
  );
};
```

## Vue.js Migration Implementation

### 1. Time Doctor Management Dashboard
```vue
<!-- Vue: TimeDoctorDashboard.vue -->
<template>
  <div class="time-doctor-dashboard">
    <!-- Header Section -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center pa-6">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="primary" size="large">mdi-clock-outline</v-icon>
          <div>
            <h1 class="text-h4 mb-1">Time Doctor Integration</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Monitor productivity and track time across your organization
            </p>
          </div>
        </div>
        
        <!-- Connection Status -->
        <div class="d-flex align-center gap-4">
          <v-chip
            :color="connectionStatus.color"
            :prepend-icon="connectionStatus.icon"
            variant="tonal"
          >
            {{ connectionStatus.label }}
          </v-chip>
          
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-sync"
            @click="syncNow"
            :loading="syncing"
          >
            Sync Now
          </v-btn>
        </div>
      </v-card-title>
    </v-card>

    <!-- Stats Overview -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="primary" class="mb-2">
            mdi-account-multiple
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ stats.connectedUsers }}</div>
          <div class="text-body-2 text-medium-emphasis">Connected Users</div>
          <v-progress-linear
            :model-value="(stats.connectedUsers / stats.totalEmployees) * 100"
            color="primary"
            class="mt-2"
            height="4"
          />
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="success" class="mb-2">
            mdi-clock-check
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ formatTime(stats.totalHoursToday) }}</div>
          <div class="text-body-2 text-medium-emphasis">Hours Today</div>
          <v-chip
            size="small"
            :color="getChangeColor(stats.hoursChange)"
            variant="tonal"
            class="mt-2"
          >
            {{ stats.hoursChange > 0 ? '+' : '' }}{{ stats.hoursChange }}%
          </v-chip>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="info" class="mb-2">
            mdi-trending-up
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ stats.avgProductivity }}%</div>
          <div class="text-body-2 text-medium-emphasis">Avg. Productivity</div>
          <v-rating
            :model-value="stats.avgProductivity / 20"
            color="warning"
            half-increments
            readonly
            size="small"
            class="mt-1"
          />
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="warning" class="mb-2">
            mdi-account-alert
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ stats.inactiveUsers }}</div>
          <div class="text-body-2 text-medium-emphasis">Inactive Users</div>
          <v-chip
            size="small"
            color="warning"
            variant="outlined"
            class="mt-2"
          >
            Needs Attention
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Tabs -->
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="start" color="primary">
        <v-tab value="overview">
          <v-icon class="mr-2">mdi-view-dashboard</v-icon>
          Overview
        </v-tab>
        
        <v-tab value="users">
          <v-icon class="mr-2">mdi-account-group</v-icon>
          User Management
        </v-tab>
        
        <v-tab value="tracking">
          <v-icon class="mr-2">mdi-clock-outline</v-icon>
          Time Tracking
        </v-tab>
        
        <v-tab value="productivity">
          <v-icon class="mr-2">mdi-chart-line</v-icon>
          Productivity
        </v-tab>
        
        <v-tab value="reports">
          <v-icon class="mr-2">mdi-file-chart</v-icon>
          Reports
        </v-tab>
        
        <v-tab value="settings">
          <v-icon class="mr-2">mdi-cog</v-icon>
          Settings
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab">
        <!-- Overview Tab -->
        <v-tabs-window-item value="overview">
          <TimeDoctorOverviewPanel 
            :stats="stats"
            :recent-activity="recentActivity"
            @refresh="loadStats"
          />
        </v-tabs-window-item>

        <!-- User Management Tab -->
        <v-tabs-window-item value="users">
          <TimeDoctorUserManagement 
            :users="users"
            :loading="loadingUsers"
            @link-user="linkUser"
            @unlink-user="unlinkUser"
            @sync-user="syncUser"
            @refresh="loadUsers"
          />
        </v-tabs-window-item>

        <!-- Time Tracking Tab -->
        <v-tabs-window-item value="tracking">
          <TimeDoctorTrackingPanel 
            :tracking-data="trackingData"
            @fetch-stats="fetchTimesheetStats"
            @export-data="exportTrackingData"
          />
        </v-tabs-window-item>

        <!-- Productivity Tab -->
        <v-tabs-window-item value="productivity">
          <TimeDoctorProductivityPanel 
            :productivity-data="productivityData"
            @analyze="analyzeProductivity"
            @generate-insights="generateInsights"
          />
        </v-tabs-window-item>

        <!-- Reports Tab -->
        <v-tabs-window-item value="reports">
          <TimeDoctorReportsPanel 
            @generate-report="generateReport"
            @schedule-report="scheduleReport"
          />
        </v-tabs-window-item>

        <!-- Settings Tab -->
        <v-tabs-window-item value="settings">
          <TimeDoctorSettingsPanel 
            :settings="integrationSettings"
            @update-settings="updateSettings"
            @test-connection="testConnection"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>

    <!-- Quick Actions FAB -->
    <v-speed-dial
      location="bottom end"
      transition="slide-y-reverse-transition"
    >
      <template #activator="{ props: activatorProps }">
        <v-fab
          v-bind="activatorProps"
          color="primary"
          icon="mdi-plus"
          size="large"
        />
      </template>

      <v-fab
        color="success"
        icon="mdi-account-plus"
        size="small"
        @click="openLinkUserDialog"
      >
        <v-tooltip activator="parent" location="left">Link User</v-tooltip>
      </v-fab>

      <v-fab
        color="info"
        icon="mdi-clock-fast"
        size="small"
        @click="openQuickSyncDialog"
      >
        <v-tooltip activator="parent" location="left">Quick Sync</v-tooltip>
      </v-fab>

      <v-fab
        color="warning"
        icon="mdi-chart-line"
        size="small"
        @click="openAnalyticsDialog"
      >
        <v-tooltip activator="parent" location="left">Analytics</v-tooltip>
      </v-fab>
    </v-speed-dial>

    <!-- Dialogs -->
    <LinkUserDialog
      v-model="linkUserDialog.show"
      :available-employees="availableEmployees"
      @link="handleLinkUser"
      @close="linkUserDialog.show = false"
    />

    <QuickSyncDialog
      v-model="quickSyncDialog.show"
      @sync="handleQuickSync"
      @close="quickSyncDialog.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeDoctorStore } from '@/stores/timeDoctorStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import TimeDoctorOverviewPanel from './components/TimeDoctorOverviewPanel.vue'
import TimeDoctorUserManagement from './components/TimeDoctorUserManagement.vue'
import TimeDoctorTrackingPanel from './components/TimeDoctorTrackingPanel.vue'
import TimeDoctorProductivityPanel from './components/TimeDoctorProductivityPanel.vue'
import TimeDoctorReportsPanel from './components/TimeDoctorReportsPanel.vue'
import TimeDoctorSettingsPanel from './components/TimeDoctorSettingsPanel.vue'
import LinkUserDialog from './dialogs/LinkUserDialog.vue'
import QuickSyncDialog from './dialogs/QuickSyncDialog.vue'

// State
const timeDoctorStore = useTimeDoctorStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const activeTab = ref('overview')
const syncing = ref(false)
const loadingUsers = ref(false)
const refreshInterval = ref<NodeJS.Timeout | null>(null)

const linkUserDialog = ref({
  show: false
})

const quickSyncDialog = ref({
  show: false
})

// Computed
const stats = computed(() => timeDoctorStore.stats)
const users = computed(() => timeDoctorStore.users)
const trackingData = computed(() => timeDoctorStore.trackingData)
const productivityData = computed(() => timeDoctorStore.productivityData)
const integrationSettings = computed(() => timeDoctorStore.settings)
const recentActivity = computed(() => timeDoctorStore.recentActivity)
const availableEmployees = computed(() => timeDoctorStore.availableEmployees)

const connectionStatus = computed(() => {
  const isConnected = timeDoctorStore.isConnected
  return {
    color: isConnected ? 'success' : 'error',
    icon: isConnected ? 'mdi-check-circle' : 'mdi-alert-circle',
    label: isConnected ? 'Connected' : 'Disconnected'
  }
})

// Methods
const loadStats = async () => {
  try {
    await timeDoctorStore.fetchStats()
  } catch (error) {
    notificationStore.showError('Failed to load Time Doctor stats')
  }
}

const loadUsers = async () => {
  try {
    loadingUsers.value = true
    await timeDoctorStore.fetchUsers()
  } catch (error) {
    notificationStore.showError('Failed to load users')
  } finally {
    loadingUsers.value = false
  }
}

const syncNow = async () => {
  try {
    syncing.value = true
    await timeDoctorStore.syncAllData()
    notificationStore.showSuccess('Synchronization completed successfully')
    await Promise.all([loadStats(), loadUsers()])
  } catch (error) {
    notificationStore.showError('Synchronization failed')
  } finally {
    syncing.value = false
  }
}

const linkUser = async (employeeId: string, timeDoctorUserId: string) => {
  try {
    await timeDoctorStore.linkUser(employeeId, timeDoctorUserId)
    notificationStore.showSuccess('User linked successfully')
    await loadUsers()
  } catch (error) {
    notificationStore.showError('Failed to link user')
  }
}

const unlinkUser = async (employeeId: string) => {
  try {
    await timeDoctorStore.unlinkUser(employeeId)
    notificationStore.showSuccess('User unlinked successfully')
    await loadUsers()
  } catch (error) {
    notificationStore.showError('Failed to unlink user')
  }
}

const syncUser = async (employeeId: string) => {
  try {
    await timeDoctorStore.syncUser(employeeId)
    notificationStore.showSuccess('User synchronized successfully')
    await loadUsers()
  } catch (error) {
    notificationStore.showError('Failed to sync user')
  }
}

const fetchTimesheetStats = async (dateParams: any) => {
  try {
    await timeDoctorStore.fetchTimesheetStats(dateParams)
    notificationStore.showSuccess('Timesheet stats updated')
  } catch (error) {
    notificationStore.showError('Failed to fetch timesheet stats')
  }
}

const exportTrackingData = async (filters: any) => {
  try {
    await timeDoctorStore.exportTrackingData(filters)
    notificationStore.showSuccess('Export completed successfully')
  } catch (error) {
    notificationStore.showError('Failed to export data')
  }
}

const analyzeProductivity = async (params: any) => {
  try {
    await timeDoctorStore.analyzeProductivity(params)
  } catch (error) {
    notificationStore.showError('Failed to analyze productivity')
  }
}

const generateInsights = async () => {
  try {
    await timeDoctorStore.generateInsights()
    notificationStore.showSuccess('Insights generated successfully')
  } catch (error) {
    notificationStore.showError('Failed to generate insights')
  }
}

const generateReport = async (reportConfig: any) => {
  try {
    await timeDoctorStore.generateReport(reportConfig)
    notificationStore.showSuccess('Report generated successfully')
  } catch (error) {
    notificationStore.showError('Failed to generate report')
  }
}

const scheduleReport = async (scheduleConfig: any) => {
  try {
    await timeDoctorStore.scheduleReport(scheduleConfig)
    notificationStore.showSuccess('Report scheduled successfully')
  } catch (error) {
    notificationStore.showError('Failed to schedule report')
  }
}

const updateSettings = async (settings: any) => {
  try {
    await timeDoctorStore.updateSettings(settings)
    notificationStore.showSuccess('Settings updated successfully')
  } catch (error) {
    notificationStore.showError('Failed to update settings')
  }
}

const testConnection = async () => {
  try {
    const isValid = await timeDoctorStore.testConnection()
    if (isValid) {
      notificationStore.showSuccess('Connection test successful')
    } else {
      notificationStore.showError('Connection test failed')
    }
  } catch (error) {
    notificationStore.showError('Failed to test connection')
  }
}

const openLinkUserDialog = () => {
  linkUserDialog.value.show = true
}

const openQuickSyncDialog = () => {
  quickSyncDialog.value.show = true
}

const openAnalyticsDialog = () => {
  // Navigate to analytics view or open dialog
  activeTab.value = 'productivity'
}

const handleLinkUser = async (data: any) => {
  await linkUser(data.employeeId, data.timeDoctorUserId)
  linkUserDialog.value.show = false
}

const handleQuickSync = async (options: any) => {
  try {
    await timeDoctorStore.quickSync(options)
    notificationStore.showSuccess('Quick sync completed')
    quickSyncDialog.value.show = false
  } catch (error) {
    notificationStore.showError('Quick sync failed')
  }
}

// Utility Functions
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getChangeColor = (change: number): string => {
  if (change > 0) return 'success'
  if (change < 0) return 'error'
  return 'info'
}

const setupRefreshInterval = () => {
  refreshInterval.value = setInterval(async () => {
    await loadStats()
  }, 5 * 60 * 1000) // Refresh every 5 minutes
}

const clearRefreshInterval = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadUsers(),
    timeDoctorStore.fetchSettings(),
    timeDoctorStore.fetchAvailableEmployees()
  ])
  
  setupRefreshInterval()
})

onUnmounted(() => {
  clearRefreshInterval()
})
</script>

<style scoped>
.time-doctor-dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
```

### 2. Time Doctor User Management Component
```vue
<!-- Vue: TimeDoctorUserManagement.vue -->
<template>
  <v-card-text class="pa-6">
    <!-- User Management Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h3 class="text-h5 mb-2">User Management</h3>
        <p class="text-body-2 text-medium-emphasis">
          Link employees with their Time Doctor accounts for tracking synchronization
        </p>
      </div>
      
      <div class="d-flex gap-2">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-account-plus"
          @click="openLinkDialog"
        >
          Link User
        </v-btn>
        
        <v-btn
          variant="outlined"
          prepend-icon="mdi-sync"
          @click="bulkSync"
          :loading="bulkSyncing"
        >
          Bulk Sync
        </v-btn>
        
        <v-btn
          variant="outlined"
          prepend-icon="mdi-export"
          @click="exportUserData"
        >
          Export
        </v-btn>
      </div>
    </div>

    <!-- Filter and Search -->
    <v-card variant="outlined" class="mb-6">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="Search users..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.department"
              :items="departmentOptions"
              item-title="name"
              item-value="id"
              label="Department"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="elevated"
              block
              @click="applyFilters"
            >
              Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users Data Table -->
    <v-data-table-server
      :headers="headers"
      :items="filteredUsers"
      :items-length="totalUsers"
      :loading="loading"
      :items-per-page="pageSize"
      :page="currentPage"
      class="elevation-0"
      item-value="employeeId"
      show-select
      @update:options="handleTableOptions"
    >
      <template #item.employee="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-3">
            <v-img
              v-if="item.avatar"
              :src="item.avatar"
              :alt="item.employeeName"
            />
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          <div>
            <div class="text-body-1 font-weight-medium">
              {{ item.employeeName }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.email }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.department }} - {{ item.designation }}
            </div>
          </div>
        </div>
      </template>

      <template #item.timeDoctorStatus="{ item }">
        <v-chip
          :color="getTimeDoctorStatusColor(item.timeDoctorStatus)"
          :prepend-icon="getTimeDoctorStatusIcon(item.timeDoctorStatus)"
          variant="tonal"
          size="small"
        >
          {{ item.timeDoctorStatus }}
        </v-chip>
      </template>

      <template #item.timeDoctorUserId="{ item }">
        <div v-if="item.timeDoctorUserId">
          <div class="text-body-2 font-weight-medium">
            {{ item.timeDoctorUserId }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Last sync: {{ formatDate(item.lastSyncDate) }}
          </div>
        </div>
        <v-chip v-else color="warning" variant="outlined" size="small">
          Not Linked
        </v-chip>
      </template>

      <template #item.productivity="{ item }">
        <div v-if="item.timeDoctorUserId">
          <div class="d-flex align-center">
            <v-progress-circular
              :model-value="item.productivity"
              :color="getProductivityColor(item.productivity)"
              size="32"
              width="3"
              class="mr-2"
            >
              <span class="text-caption">{{ item.productivity }}%</span>
            </v-progress-circular>
            <div>
              <div class="text-body-2">{{ item.productivity }}%</div>
              <div class="text-caption text-medium-emphasis">
                {{ getProductivityLabel(item.productivity) }}
              </div>
            </div>
          </div>
        </div>
        <span v-else class="text-medium-emphasis">—</span>
      </template>

      <template #item.hoursToday="{ item }">
        <div v-if="item.timeDoctorUserId">
          <div class="text-body-1 font-weight-medium">
            {{ formatTime(item.hoursToday) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Target: {{ formatTime(item.targetHours) }}
          </div>
          <v-progress-linear
            :model-value="(item.hoursToday / item.targetHours) * 100"
            :color="getHoursProgressColor(item.hoursToday, item.targetHours)"
            height="4"
            class="mt-1"
          />
        </div>
        <span v-else class="text-medium-emphasis">—</span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <v-btn
            v-if="!item.timeDoctorUserId"
            icon
            variant="text"
            size="small"
            color="primary"
            @click="openLinkUserDialog(item)"
          >
            <v-icon>mdi-link</v-icon>
            <v-tooltip activator="parent">Link User</v-tooltip>
          </v-btn>
          
          <v-btn
            v-if="item.timeDoctorUserId"
            icon
            variant="text"
            size="small"
            color="info"
            @click="syncUser(item.employeeId)"
          >
            <v-icon>mdi-sync</v-icon>
            <v-tooltip activator="parent">Sync User</v-tooltip>
          </v-btn>
          
          <v-btn
            v-if="item.timeDoctorUserId"
            icon
            variant="text"
            size="small"
            @click="viewUserDetails(item)"
          >
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent">View Details</v-tooltip>
          </v-btn>
          
          <v-btn
            v-if="item.timeDoctorUserId"
            icon
            variant="text"
            size="small"
            color="error"
            @click="unlinkUser(item)"
          >
            <v-icon>mdi-link-off</v-icon>
            <v-tooltip activator="parent">Unlink User</v-tooltip>
          </v-btn>
        </div>
      </template>
    </v-data-table-server>

    <!-- User Details Dialog -->
    <UserDetailsDialog
      v-model="userDetailsDialog.show"
      :user="userDetailsDialog.user"
      @close="userDetailsDialog.show = false"
    />

    <!-- Link User Dialog -->
    <LinkUserDialog
      v-model="linkUserDialog.show"
      :employee="linkUserDialog.employee"
      @link="handleUserLink"
      @close="linkUserDialog.show = false"
    />

    <!-- Unlink Confirmation Dialog -->
    <v-dialog v-model="unlinkDialog.show" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Confirm Unlink
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to unlink {{ unlinkDialog.user?.employeeName }} from Time Doctor?
          This will stop time tracking synchronization for this user.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="unlinkDialog.show = false">Cancel</v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="unlinking"
            @click="confirmUnlink"
          >
            Unlink
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeDoctorStore } from '@/stores/timeDoctorStore'
import { useNotificationStore } from '@/stores/notificationStore'
import UserDetailsDialog from '../dialogs/UserDetailsDialog.vue'
import LinkUserDialog from '../dialogs/LinkUserDialog.vue'

// Props & Emits
const props = defineProps<{
  users: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  'link-user': [employeeId: string, timeDoctorUserId: string]
  'unlink-user': [employeeId: string]
  'sync-user': [employeeId: string]
  'refresh': []
}>()

// State
const timeDoctorStore = useTimeDoctorStore()
const notificationStore = useNotificationStore()

const bulkSyncing = ref(false)
const unlinking = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const filters = ref({
  search: '',
  status: '',
  department: ''
})

const userDetailsDialog = ref({
  show: false,
  user: null
})

const linkUserDialog = ref({
  show: false,
  employee: null
})

const unlinkDialog = ref({
  show: false,
  user: null
})

// Computed
const filteredUsers = computed(() => {
  let filtered = props.users
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(user => 
      user.employeeName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }
  
  if (filters.value.status) {
    filtered = filtered.filter(user => user.timeDoctorStatus === filters.value.status)
  }
  
  if (filters.value.department) {
    filtered = filtered.filter(user => user.departmentId === filters.value.department)
  }
  
  return filtered
})

const totalUsers = computed(() => filteredUsers.value.length)

const statusOptions = computed(() => [
  { label: 'All Status', value: '' },
  { label: 'Linked', value: 'Linked' },
  { label: 'Not Linked', value: 'Not Linked' },
  { label: 'Inactive', value: 'Inactive' }
])

const departmentOptions = computed(() => timeDoctorStore.departments)

// Table Headers
const headers = [
  { title: 'Employee', key: 'employee', width: '280px' },
  { title: 'Time Doctor Status', key: 'timeDoctorStatus', width: '150px' },
  { title: 'Time Doctor ID', key: 'timeDoctorUserId', width: '200px' },
  { title: 'Productivity', key: 'productivity', width: '150px' },
  { title: 'Hours Today', key: 'hoursToday', width: '150px' },
  { title: 'Actions', key: 'actions', width: '150px', sortable: false }
]

// Methods
const handleTableOptions = (options: any) => {
  currentPage.value = options.page
  pageSize.value = options.itemsPerPage
}

const applyFilters = () => {
  currentPage.value = 1
  // Filters are applied reactively through computed property
}

const openLinkDialog = () => {
  linkUserDialog.value = {
    show: true,
    employee: null
  }
}

const openLinkUserDialog = (employee: any) => {
  linkUserDialog.value = {
    show: true,
    employee
  }
}

const viewUserDetails = (user: any) => {
  userDetailsDialog.value = {
    show: true,
    user
  }
}

const unlinkUser = (user: any) => {
  unlinkDialog.value = {
    show: true,
    user
  }
}

const confirmUnlink = async () => {
  if (!unlinkDialog.value.user) return
  
  try {
    unlinking.value = true
    emit('unlink-user', unlinkDialog.value.user.employeeId)
    unlinkDialog.value.show = false
  } finally {
    unlinking.value = false
  }
}

const handleUserLink = (data: any) => {
  emit('link-user', data.employeeId, data.timeDoctorUserId)
}

const syncUser = (employeeId: string) => {
  emit('sync-user', employeeId)
}

const bulkSync = async () => {
  try {
    bulkSyncing.value = true
    // Implement bulk sync logic
    await timeDoctorStore.bulkSyncUsers()
    notificationStore.showSuccess('Bulk sync completed successfully')
    emit('refresh')
  } catch (error) {
    notificationStore.showError('Bulk sync failed')
  } finally {
    bulkSyncing.value = false
  }
}

const exportUserData = async () => {
  try {
    await timeDoctorStore.exportUserData(filters.value)
    notificationStore.showSuccess('Export completed successfully')
  } catch (error) {
    notificationStore.showError('Failed to export data')
  }
}

// Utility Functions
const getTimeDoctorStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'Linked': 'success',
    'Not Linked': 'warning',
    'Inactive': 'error'
  }
  return colorMap[status] || 'default'
}

const getTimeDoctorStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    'Linked': 'mdi-check-circle',
    'Not Linked': 'mdi-link-off',
    'Inactive': 'mdi-account-cancel'
  }
  return iconMap[status] || 'mdi-circle'
}

const getProductivityColor = (productivity: number): string => {
  if (productivity >= 80) return 'success'
  if (productivity >= 60) return 'info'
  if (productivity >= 40) return 'warning'
  return 'error'
}

const getProductivityLabel = (productivity: number): string => {
  if (productivity >= 80) return 'Excellent'
  if (productivity >= 60) return 'Good'
  if (productivity >= 40) return 'Average'
  return 'Low'
}

const getHoursProgressColor = (current: number, target: number): string => {
  const percentage = (current / target) * 100
  if (percentage >= 100) return 'success'
  if (percentage >= 80) return 'info'
  if (percentage >= 60) return 'warning'
  return 'error'
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for prop changes
watch(() => props.users, () => {
  // Reset to first page when users change
  currentPage.value = 1
})
</script>
```

This concludes the first part of the Time Doctor Integration documentation. The implementation provides comprehensive user management and dashboard functionality with real-time synchronization capabilities. Would you like me to continue with the remaining components (Tracking Panel, Productivity Panel, and Reports Panel) to complete the documentation?

## Key Features Implemented

✅ **Time Doctor Dashboard**: Comprehensive overview with connection status and statistics
✅ **User Management**: Link/unlink employees with Time Doctor accounts
✅ **Real-time Sync**: Manual and automated synchronization capabilities  
✅ **Productivity Tracking**: Visual productivity metrics and insights
✅ **Filter and Search**: Advanced user filtering and search functionality
✅ **Bulk Operations**: Bulk synchronization and management features