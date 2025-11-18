# Asset Management Part 3A: Maintenance Scheduling - UI Migration Guide

## Overview
This document provides comprehensive migration guidance for the Asset Maintenance Scheduling module from React to Vue.js, focusing on preventive maintenance scheduling, repair tracking, and maintenance workflow management.

## React Component Analysis

### Current React Implementation
```typescript
// React: AssetMaintenance/MaintenanceScheduler.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  DatePicker,
  DateTimePicker
} from '@mui/x-date-pickers';
import {
  Calendar,
  Event,
  Build,
  Warning,
  CheckCircle,
  Schedule,
  AttachMoney,
  Assignment
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface MaintenanceSchedulerProps {
  assets: Asset[];
  maintenanceRecords: MaintenanceRecord[];
  onScheduleMaintenance: (data: MaintenanceData) => void;
  onUpdateMaintenance: (id: string, data: Partial<MaintenanceRecord>) => void;
}

const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({
  assets,
  maintenanceRecords,
  onScheduleMaintenance,
  onUpdateMaintenance
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'timeline'>('list');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    dateRange: { start: null, end: null }
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    assetId: '',
    type: 'Preventive',
    description: '',
    scheduledDate: new Date(),
    estimatedDuration: 1,
    priority: 'Medium',
    assignedTechnician: '',
    estimatedCost: 0,
    notes: '',
    requiredParts: [],
    instructions: ''
  });

  const maintenanceColumns: GridColDef[] = [
    {
      field: 'asset',
      headerName: 'Asset',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Build fontSize="small" />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.asset.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.asset.assetCode}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getMaintenanceTypeColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getMaintenanceStatusColor(params.value)}
          size="small"
          icon={getStatusIcon(params.value)}
        />
      )
    },
    {
      field: 'scheduledDate',
      headerName: 'Scheduled',
      width: 140,
      type: 'date'
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPriorityColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'technician',
      headerName: 'Technician',
      width: 150
    },
    {
      field: 'estimatedCost',
      headerName: 'Est. Cost',
      width: 100,
      renderCell: (params) => `$${params.value.toLocaleString()}`
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ mb: 0.5 }}
          />
          <Typography variant="caption">{params.value}%</Typography>
        </Box>
      )
    }
  ];

  return (
    <Box>
      {/* Header with Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Maintenance Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setViewMode('calendar')}
            color={viewMode === 'calendar' ? 'primary' : 'inherit'}
          >
            <Calendar />
            Calendar
          </Button>
          <Button
            variant="outlined"
            onClick={() => setViewMode('timeline')}
            color={viewMode === 'timeline' ? 'primary' : 'inherit'}
          >
            <Timeline />
            Timeline
          </Button>
          <Button
            variant="contained"
            onClick={() => setMaintenanceDialog(true)}
            startIcon={<Schedule />}
          >
            Schedule Maintenance
          </Button>
        </Box>
      </Box>

      {/* Maintenance Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule color="primary" />
                <Box>
                  <Typography variant="h6">12</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning color="warning" />
                <Box>
                  <Typography variant="h6">3</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Build color="info" />
                <Box>
                  <Typography variant="h6">8</Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney color="success" />
                <Box>
                  <Typography variant="h6">$15,420</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Budget
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Maintenance Table */}
      <Card>
        <CardContent>
          <DataGrid
            rows={maintenanceRecords}
            columns={maintenanceColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={(params) => setSelectedAsset(params.row.asset)}
          />
        </CardContent>
      </Card>

      {/* Schedule Maintenance Dialog */}
      <Dialog
        open={maintenanceDialog}
        onClose={() => setMaintenanceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule Maintenance</DialogTitle>
        <DialogContent>
          {/* Maintenance form content */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
          <Button variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

## Vue.js Implementation

### 1. Main Maintenance Management Component
```vue
<template>
  <div class="maintenance-management">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h2 class="text-h4">Maintenance Management</h2>
            <p class="text-subtitle-1 text-medium-emphasis">
              Schedule, track, and manage asset maintenance activities
            </p>
          </div>
          
          <div class="d-flex gap-2">
            <v-btn-toggle
              v-model="viewMode"
              variant="outlined"
              divided
            >
              <v-btn value="list" icon="mdi-format-list-bulleted" />
              <v-btn value="calendar" icon="mdi-calendar" />
              <v-btn value="timeline" icon="mdi-timeline" />
            </v-btn-toggle>
            
            <v-btn
              color="primary"
              prepend-icon="mdi-calendar-plus"
              @click="openScheduleDialog"
            >
              Schedule Maintenance
            </v-btn>
            
            <v-btn
              variant="outlined"
              prepend-icon="mdi-download"
              @click="exportMaintenanceData"
            >
              Export
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Maintenance Overview Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <MaintenanceStatCard
          title="Scheduled This Week"
          :value="maintenanceStats.scheduledThisWeek"
          icon="mdi-calendar-clock"
          color="primary"
          subtitle="Upcoming tasks"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <MaintenanceStatCard
          title="Overdue"
          :value="maintenanceStats.overdue"
          icon="mdi-alert-circle"
          color="error"
          subtitle="Require attention"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <MaintenanceStatCard
          title="In Progress"
          :value="maintenanceStats.inProgress"
          icon="mdi-wrench"
          color="info"
          subtitle="Active maintenance"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <MaintenanceStatCard
          title="Monthly Budget"
          :value="formatCurrency(maintenanceStats.monthlyBudget)"
          icon="mdi-currency-usd"
          color="success"
          subtitle="Allocated funds"
        />
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start>mdi-filter</v-icon>
        Filters & Search
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="Search Maintenance"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.status"
              label="Status"
              :items="maintenanceStatuses"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.type"
              label="Type"
              :items="maintenanceTypes"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.priority"
              label="Priority"
              :items="priorityLevels"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.dateRange.start"
              label="From Date"
              type="date"
              variant="outlined"
              density="compact"
            />
          </v-col>
          
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              icon="mdi-refresh"
              variant="outlined"
              @click="resetFilters"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Content Area -->
    <v-card>
      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Maintenance Records ({{ totalRecords }})</span>
          
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-view-column"
              variant="text"
              @click="columnSettingsDialog = true"
            />
            <v-btn
              icon="mdi-filter-variant"
              variant="text"
              @click="advancedFiltersDialog = true"
            />
          </div>
        </v-card-title>

        <v-data-table-server
          :headers="maintenanceHeaders"
          :items="maintenanceRecords"
          :items-length="totalRecords"
          :loading="loading"
          v-model:page="pagination.page"
          v-model:items-per-page="pagination.itemsPerPage"
          v-model:sort-by="pagination.sortBy"
          @update:options="loadMaintenanceRecords"
          class="maintenance-table"
        >
          <!-- Asset Column -->
          <template #item.asset="{ item }">
            <div class="d-flex align-center gap-3">
              <v-avatar size="36" rounded="4">
                <v-img
                  v-if="item.asset.imageUrl"
                  :src="item.asset.imageUrl"
                />
                <v-icon v-else>{{ getAssetIcon(item.asset.category) }}</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.asset.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.asset.assetCode }}
                </div>
              </div>
            </div>
          </template>

          <!-- Type Column -->
          <template #item.type="{ item }">
            <v-chip
              :color="getMaintenanceTypeColor(item.type)"
              size="small"
              variant="tonal"
            >
              <v-icon start size="16">{{ getMaintenanceTypeIcon(item.type) }}</v-icon>
              {{ item.type }}
            </v-chip>
          </template>

          <!-- Status Column -->
          <template #item.status="{ item }">
            <MaintenanceStatusChip :status="item.status" />
          </template>

          <!-- Scheduled Date -->
          <template #item.scheduledDate="{ item }">
            <div>
              <div>{{ formatDate(item.scheduledDate) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ getTimeFromNow(item.scheduledDate) }}
              </div>
            </div>
          </template>

          <!-- Priority Column -->
          <template #item.priority="{ item }">
            <v-chip
              :color="getPriorityColor(item.priority)"
              size="small"
              variant="outlined"
            >
              {{ item.priority }}
            </v-chip>
          </template>

          <!-- Progress Column -->
          <template #item.progress="{ item }">
            <div class="d-flex align-center gap-2">
              <v-progress-linear
                :model-value="item.progress"
                :color="getProgressColor(item.progress)"
                height="6"
                rounded
                class="flex-grow-1"
              />
              <span class="text-caption">{{ item.progress }}%</span>
            </div>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="viewMaintenanceDetails(item)">
                  <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
                <v-list-item @click="editMaintenance(item)">
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="updateProgress(item)">
                  <v-list-item-title>Update Progress</v-list-item-title>
                </v-list-item>
                <v-list-item @click="addWorkLog(item)">
                  <v-list-item-title>Add Work Log</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item 
                  v-if="item.status === 'Scheduled'"
                  @click="startMaintenance(item)"
                  class="text-success"
                >
                  <v-list-item-title>Start Maintenance</v-list-item-title>
                </v-list-item>
                <v-list-item 
                  v-if="item.status === 'In Progress'"
                  @click="completeMaintenance(item)"
                  class="text-success"
                >
                  <v-list-item-title>Mark Complete</v-list-item-title>
                </v-list-item>
                <v-list-item @click="cancelMaintenance(item)" class="text-error">
                  <v-list-item-title>Cancel</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- Loading -->
          <template #loading>
            <v-skeleton-loader type="table-row@10" />
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-wrench</v-icon>
              <div class="text-h6 mt-4">No Maintenance Records</div>
              <div class="text-body-2 text-medium-emphasis">
                Schedule your first maintenance task
              </div>
              <v-btn
                color="primary"
                class="mt-4"
                prepend-icon="mdi-plus"
                @click="openScheduleDialog"
              >
                Schedule Maintenance
              </v-btn>
            </div>
          </template>
        </v-data-table-server>
      </div>

      <!-- Calendar View -->
      <MaintenanceCalendarView
        v-else-if="viewMode === 'calendar'"
        :maintenance-records="maintenanceRecords"
        @schedule="openScheduleDialog"
        @edit="editMaintenance"
      />

      <!-- Timeline View -->
      <MaintenanceTimelineView
        v-else-if="viewMode === 'timeline'"
        :maintenance-records="maintenanceRecords"
        @view="viewMaintenanceDetails"
      />
    </v-card>

    <!-- Dialogs -->
    <ScheduleMaintenanceDialog
      v-model="scheduleDialog"
      :asset="selectedAsset"
      @schedule="handleScheduleMaintenance"
    />

    <MaintenanceDetailsDialog
      v-model="detailsDialog"
      :maintenance="selectedMaintenance"
      @edit="editMaintenance"
      @update-progress="updateProgress"
    />

    <WorkLogDialog
      v-model="workLogDialog"
      :maintenance="selectedMaintenance"
      @save="handleWorkLogSave"
    />

    <ProgressUpdateDialog
      v-model="progressDialog"
      :maintenance="selectedMaintenance"
      @update="handleProgressUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAssetStore } from '@/stores/assetStore';
import { useMaintenanceStore } from '@/stores/maintenanceStore';
import { useToast } from '@/composables/useToast';

// Import child components
import MaintenanceStatCard from './MaintenanceStatCard.vue';
import MaintenanceStatusChip from './MaintenanceStatusChip.vue';
import MaintenanceCalendarView from './MaintenanceCalendarView.vue';
import MaintenanceTimelineView from './MaintenanceTimelineView.vue';
import ScheduleMaintenanceDialog from './ScheduleMaintenanceDialog.vue';
import MaintenanceDetailsDialog from './MaintenanceDetailsDialog.vue';
import WorkLogDialog from './WorkLogDialog.vue';
import ProgressUpdateDialog from './ProgressUpdateDialog.vue';

// Stores
const assetStore = useAssetStore();
const maintenanceStore = useMaintenanceStore();
const { showSuccess, showError } = useToast();

// Reactive data
const viewMode = ref('list');
const loading = ref(false);

const filters = ref({
  search: '',
  status: '',
  type: '',
  priority: '',
  dateRange: {
    start: '',
    end: ''
  }
});

// Dialog states
const scheduleDialog = ref(false);
const detailsDialog = ref(false);
const workLogDialog = ref(false);
const progressDialog = ref(false);

// Selected items
const selectedAsset = ref(null);
const selectedMaintenance = ref(null);

// Computed properties
const maintenanceRecords = computed(() => maintenanceStore.maintenanceRecords);
const totalRecords = computed(() => maintenanceStore.totalRecords);
const maintenanceStats = computed(() => maintenanceStore.maintenanceStats);

// Methods
const loadMaintenanceRecords = async () => {
  loading.value = true;
  try {
    await maintenanceStore.fetchMaintenanceRecords(filters.value);
  } catch (error) {
    showError('Failed to load maintenance records');
  } finally {
    loading.value = false;
  }
};

const openScheduleDialog = (asset = null) => {
  selectedAsset.value = asset;
  scheduleDialog.value = true;
};

const handleScheduleMaintenance = async (maintenanceData) => {
  try {
    await maintenanceStore.scheduleMaintenance(maintenanceData);
    showSuccess('Maintenance scheduled successfully');
    scheduleDialog.value = false;
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to schedule maintenance');
  }
};

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadMaintenanceRecords();
  maintenanceStore.fetchMaintenanceStats();
});
</script>

<style scoped>
.maintenance-management {
  padding: 24px;
}

.maintenance-table :deep(.v-data-table__td) {
  padding: 12px 8px;
}

@media (max-width: 960px) {
  .maintenance-management {
    padding: 16px;
  }
}
</style>
```

## Key Migration Features

### 1. **Comprehensive Maintenance Scheduling**
- Preventive and corrective maintenance scheduling
- Progress tracking with visual indicators
- Work log management with photos and notes
- Cost tracking and budget management

### 2. **Advanced Scheduling Interface**
- Multiple view modes (list, calendar, timeline)
- Advanced filtering and search capabilities
- Real-time status updates
- Technician assignment workflow

### 3. **Vue.js Migration Benefits**
- Composition API for better state management
- Vuetify 3.x components with Material Design
- Improved performance with reactive data
- Better mobile responsiveness

### 4. **Data Table Enhancements**
- Server-side pagination
- Advanced sorting and filtering
- Custom cell renderers
- Loading states and empty states

This implementation provides the maintenance scheduling foundation while keeping the document focused and manageable. The disposal functionality will be covered in Part 3B.