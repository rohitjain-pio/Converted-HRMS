# Asset Management Part 3: Maintenance & Disposal - Master Index

## Overview
Asset Management Part 3 covers comprehensive maintenance scheduling, work tracking, and asset disposal workflows. Due to the extensive nature of this module, the documentation has been split into focused sections:

## Documentation Structure

### 📋 Part 3A: Maintenance Scheduling
**File:** `05-asset-management-part3a-maintenance-ui.md`

**Content Coverage:**
- React component analysis for maintenance scheduling
- Vue.js maintenance management implementation
- Preventive and corrective maintenance workflows
- Progress tracking and technician assignment
- Calendar, list, and timeline view modes
- Advanced filtering and search capabilities
- Mobile-responsive maintenance interfaces

**Key Features:**
- Multi-view maintenance dashboard
- Real-time progress tracking
- Work log management
- Cost tracking and budget monitoring
- Technician assignment and scheduling

### 🗑️ Part 3B: Asset Disposal & Store Implementation  
**File:** `05-asset-management-part3b-disposal-store-ui.md`

**Content Coverage:**
- Complete asset disposal workflow management
- Multi-step disposal approval process
- Environmental compliance tracking
- Value recovery optimization
- Comprehensive Pinia store implementation
- Maintenance and disposal state management

**Key Features:**
- Disposal queue management
- Approval workflow with role-based permissions
- Environmental impact tracking
- Value recovery calculations
- Complete store architecture with error handling
- Advanced disposal analytics

## Integration Points

Both parts work together to provide:

1. **Seamless Workflow Transition**
   - Assets move from maintenance to disposal
   - Status synchronization across workflows
   - Complete audit trail maintenance

2. **Unified State Management**
   - Shared Pinia stores for asset data
   - Reactive updates across components
   - Consistent error handling patterns

3. **Mobile Optimization**
   - Touch-friendly interfaces
   - Photo documentation capabilities
   - Offline operation support
   - QR code scanning integration

## Migration Approach

### Phase 1: Core Maintenance (Part 3A)
- Implement basic maintenance scheduling
- Set up data tables and filtering
- Create progress tracking interfaces
- Establish technician assignment workflows

### Phase 2: Advanced Features (Part 3A)
- Add calendar and timeline views
- Implement work log management
- Create cost tracking systems
- Add mobile optimization

### Phase 3: Disposal Workflow (Part 3B)
- Implement disposal initiation
- Create approval workflows
- Add environmental compliance tracking
- Set up value recovery calculations

### Phase 4: Store Integration (Part 3B)
- Complete Pinia store implementation
- Add advanced state management
- Implement error handling and loading states
- Create data export capabilities

## Technical Architecture

### Frontend Stack
- **Framework:** Vue.js 3.4+ with Composition API
- **UI Library:** Vuetify 3.4+ with Material Design
- **State Management:** Pinia with TypeScript
- **Form Handling:** VeeValidate with Yup validation
- **Data Tables:** Vuetify Data Tables with server-side features

### Component Structure
```
AssetManagement/
├── Maintenance/
│   ├── MaintenanceManager.vue (Part 3A)
│   ├── MaintenanceStatCard.vue
│   ├── MaintenanceCalendarView.vue
│   ├── ScheduleMaintenanceDialog.vue
│   └── WorkLogDialog.vue
├── Disposal/
│   ├── AssetDisposalManager.vue (Part 3B)
│   ├── DisposalStatusChip.vue
│   ├── DisposalSummaryCard.vue
│   └── DisposalDetailsDialog.vue
└── stores/
    ├── maintenanceStore.ts (Part 3B)
    └── assetStore.ts (extensions)
```

### Store Architecture
- **MaintenanceStore:** Complete maintenance workflow management
- **AssetStore Extensions:** Disposal-specific actions and state
- **Shared Composables:** Common utilities and validation logic
- **API Integration:** RESTful endpoints with error handling

## Usage Guidelines

1. **Start with Part 3A** for basic maintenance functionality
2. **Implement Part 3B** for complete workflow coverage
3. **Follow the migration phases** for systematic implementation
4. **Test integration points** between maintenance and disposal
5. **Validate mobile interfaces** for field technician usage

This modular approach ensures manageable implementation while maintaining comprehensive coverage of all Asset Management Part 3 requirements.
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

          <!-- Technician Column -->
          <template #item.technician="{ item }">
            <div v-if="item.technician" class="d-flex align-center gap-2">
              <v-avatar size="24">
                <v-img
                  v-if="item.technician.avatar"
                  :src="item.technician.avatar"
                />
                <span v-else class="text-caption">
                  {{ item.technician.name.charAt(0) }}
                </span>
              </v-avatar>
              <span class="text-body-2">{{ item.technician.name }}</span>
            </div>
            <v-chip v-else color="grey" size="small" variant="tonal">
              Unassigned
            </v-chip>
          </template>

          <!-- Estimated Cost -->
          <template #item.estimatedCost="{ item }">
            <div class="text-right">
              <div class="font-weight-medium">
                {{ formatCurrency(item.estimatedCost) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Actual: {{ formatCurrency(item.actualCost || 0) }}
              </div>
            </div>
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

    <!-- Asset Disposal Section -->
    <AssetDisposalManager
      class="mt-6"
      @dispose="handleAssetDisposal"
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
import AssetDisposalManager from './AssetDisposalManager.vue';

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

const pagination = ref({
  page: 1,
  itemsPerPage: 25,
  sortBy: [{ key: 'scheduledDate', order: 'asc' }]
});

// Dialog states
const scheduleDialog = ref(false);
const detailsDialog = ref(false);
const workLogDialog = ref(false);
const progressDialog = ref(false);
const columnSettingsDialog = ref(false);
const advancedFiltersDialog = ref(false);

// Selected items
const selectedAsset = ref(null);
const selectedMaintenance = ref(null);

// Computed properties
const maintenanceRecords = computed(() => maintenanceStore.maintenanceRecords);
const totalRecords = computed(() => maintenanceStore.totalRecords);
const maintenanceStats = computed(() => maintenanceStore.maintenanceStats);

// Filter options
const maintenanceStatuses = [
  { name: 'All', value: '' },
  { name: 'Scheduled', value: 'scheduled' },
  { name: 'In Progress', value: 'in_progress' },
  { name: 'Completed', value: 'completed' },
  { name: 'Cancelled', value: 'cancelled' },
  { name: 'Overdue', value: 'overdue' }
];

const maintenanceTypes = [
  { name: 'All', value: '' },
  { name: 'Preventive', value: 'preventive' },
  { name: 'Corrective', value: 'corrective' },
  { name: 'Emergency', value: 'emergency' },
  { name: 'Inspection', value: 'inspection' }
];

const priorityLevels = [
  { name: 'All', value: '' },
  { name: 'Low', value: 'low' },
  { name: 'Medium', value: 'medium' },
  { name: 'High', value: 'high' },
  { name: 'Critical', value: 'critical' }
];

// Table headers
const maintenanceHeaders = computed(() => [
  {
    title: 'Asset',
    key: 'asset',
    width: 200,
    sortable: true
  },
  {
    title: 'Type',
    key: 'type',
    width: 120,
    sortable: true
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    sortable: true
  },
  {
    title: 'Scheduled Date',
    key: 'scheduledDate',
    width: 140,
    sortable: true
  },
  {
    title: 'Priority',
    key: 'priority',
    width: 100,
    sortable: true
  },
  {
    title: 'Technician',
    key: 'technician',
    width: 150,
    sortable: false
  },
  {
    title: 'Cost',
    key: 'estimatedCost',
    width: 120,
    sortable: true,
    align: 'end'
  },
  {
    title: 'Progress',
    key: 'progress',
    width: 120,
    sortable: true
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    sortable: false
  }
]);

// Methods
const loadMaintenanceRecords = async () => {
  loading.value = true;
  try {
    await maintenanceStore.fetchMaintenanceRecords({
      ...filters.value,
      page: pagination.value.page,
      itemsPerPage: pagination.value.itemsPerPage,
      sortBy: pagination.value.sortBy
    });
  } catch (error) {
    showError('Failed to load maintenance records');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    type: '',
    priority: '',
    dateRange: { start: '', end: '' }
  };
  pagination.value.page = 1;
  loadMaintenanceRecords();
};

const openScheduleDialog = (asset = null) => {
  selectedAsset.value = asset;
  scheduleDialog.value = true;
};

const viewMaintenanceDetails = (maintenance) => {
  selectedMaintenance.value = maintenance;
  detailsDialog.value = true;
};

const editMaintenance = (maintenance) => {
  selectedMaintenance.value = maintenance;
  scheduleDialog.value = true;
};

const updateProgress = (maintenance) => {
  selectedMaintenance.value = maintenance;
  progressDialog.value = true;
};

const addWorkLog = (maintenance) => {
  selectedMaintenance.value = maintenance;
  workLogDialog.value = true;
};

const startMaintenance = async (maintenance) => {
  try {
    await maintenanceStore.startMaintenance(maintenance.id);
    showSuccess('Maintenance started');
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to start maintenance');
  }
};

const completeMaintenance = async (maintenance) => {
  try {
    await maintenanceStore.completeMaintenance(maintenance.id);
    showSuccess('Maintenance completed');
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to complete maintenance');
  }
};

const cancelMaintenance = async (maintenance) => {
  try {
    await maintenanceStore.cancelMaintenance(maintenance.id);
    showSuccess('Maintenance cancelled');
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to cancel maintenance');
  }
};

const handleScheduleMaintenance = async (maintenanceData) => {
  try {
    await maintenanceStore.scheduleMaintenance(maintenanceData);
    showSuccess('Maintenance scheduled successfully');
    scheduleDialog.value = false;
    selectedAsset.value = null;
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to schedule maintenance');
  }
};

const handleProgressUpdate = async (progressData) => {
  try {
    await maintenanceStore.updateMaintenanceProgress(
      selectedMaintenance.value.id, 
      progressData
    );
    showSuccess('Progress updated');
    progressDialog.value = false;
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to update progress');
  }
};

const handleWorkLogSave = async (workLogData) => {
  try {
    await maintenanceStore.addWorkLog(
      selectedMaintenance.value.id,
      workLogData
    );
    showSuccess('Work log added');
    workLogDialog.value = false;
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to add work log');
  }
};

const handleAssetDisposal = async (disposalData) => {
  try {
    await assetStore.initiateDisposal(disposalData);
    showSuccess('Asset disposal initiated');
    loadMaintenanceRecords();
  } catch (error) {
    showError('Failed to initiate disposal');
  }
};

const exportMaintenanceData = async () => {
  try {
    await maintenanceStore.exportMaintenanceData(filters.value);
    showSuccess('Data exported successfully');
  } catch (error) {
    showError('Failed to export data');
  }
};

// Utility functions
const getAssetIcon = (category: string): string => {
  const iconMap = {
    'IT Equipment': 'mdi-laptop',
    'Office Furniture': 'mdi-chair-rolling',
    'Vehicles': 'mdi-car',
    'Tools': 'mdi-hammer-wrench'
  };
  return iconMap[category] || 'mdi-package-variant';
};

const getMaintenanceTypeColor = (type: string): string => {
  const colorMap = {
    'Preventive': 'success',
    'Corrective': 'warning',
    'Emergency': 'error',
    'Inspection': 'info'
  };
  return colorMap[type] || 'grey';
};

const getMaintenanceTypeIcon = (type: string): string => {
  const iconMap = {
    'Preventive': 'mdi-shield-check',
    'Corrective': 'mdi-wrench',
    'Emergency': 'mdi-alert',
    'Inspection': 'mdi-magnify'
  };
  return iconMap[type] || 'mdi-cog';
};

const getPriorityColor = (priority: string): string => {
  const colorMap = {
    'Low': 'grey',
    'Medium': 'blue',
    'High': 'orange',
    'Critical': 'red'
  };
  return colorMap[priority] || 'grey';
};

const getProgressColor = (progress: number): string => {
  if (progress < 30) return 'error';
  if (progress < 70) return 'warning';
  return 'success';
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getTimeFromNow = (date: string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

// Lifecycle
onMounted(() => {
  loadMaintenanceRecords();
  maintenanceStore.fetchMaintenanceStats();
});

// Watch filters
watch(() => filters.value, () => {
  pagination.value.page = 1;
  loadMaintenanceRecords();
}, { deep: true });
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

### 2. Asset Disposal Manager Component
```vue
<!-- AssetDisposalManager.vue -->
<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex align-center gap-2">
        <v-icon>mdi-delete-variant</v-icon>
        <span>Asset Disposal Management</span>
      </div>
      
      <v-btn
        color="error"
        variant="outlined"
        prepend-icon="mdi-plus"
        @click="openDisposalDialog"
      >
        Initiate Disposal
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Disposal Queue -->
      <v-row>
        <v-col cols="12" md="8">
          <h4 class="mb-3">Disposal Queue</h4>
          
          <v-data-table
            :headers="disposalHeaders"
            :items="disposalQueue"
            :loading="disposalLoading"
            density="compact"
          >
            <!-- Asset Column -->
            <template #item.asset="{ item }">
              <div class="d-flex align-center gap-2">
                <v-avatar size="32" rounded="4">
                  <v-img
                    v-if="item.asset.imageUrl"
                    :src="item.asset.imageUrl"
                  />
                  <v-icon v-else>{{ getAssetIcon(item.asset.category) }}</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.asset.name }}</div>
                  <div class="text-caption">{{ item.asset.assetCode }}</div>
                </div>
              </div>
            </template>

            <!-- Reason Column -->
            <template #item.reason="{ item }">
              <v-chip
                :color="getDisposalReasonColor(item.reason)"
                size="small"
                variant="tonal"
              >
                {{ item.reason }}
              </v-chip>
            </template>

            <!-- Status Column -->
            <template #item.status="{ item }">
              <DisposalStatusChip :status="item.status" />
            </template>

            <!-- Estimated Value -->
            <template #item.estimatedValue="{ item }">
              <div class="text-right">
                <div>{{ formatCurrency(item.estimatedValue) }}</div>
                <div class="text-caption text-success">
                  Recovery: {{ formatCurrency(item.recoveryValue || 0) }}
                </div>
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
                  <v-list-item @click="viewDisposalDetails(item)">
                    <v-list-item-title>View Details</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="item.status === 'Pending Approval'"
                    @click="approveDisposal(item)"
                  >
                    <v-list-item-title>Approve</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="item.status === 'Approved'"
                    @click="scheduleDisposal(item)"
                  >
                    <v-list-item-title>Schedule</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="rejectDisposal(item)">
                    <v-list-item-title>Reject</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-col>

        <!-- Disposal Summary -->
        <v-col cols="12" md="4">
          <DisposalSummaryCard :summary="disposalSummary" />
          
          <v-card class="mt-4" variant="outlined">
            <v-card-title class="text-subtitle-1">
              Disposal Methods
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="method in disposalMethods"
                  :key="method.id"
                >
                  <v-list-item-title>{{ method.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ method.description }}</v-list-item-subtitle>
                  <template #append>
                    <v-chip size="small" variant="outlined">
                      {{ method.assetCount }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Dialogs -->
    <AssetDisposalDialog
      v-model="disposalDialog"
      @dispose="handleAssetDisposal"
    />

    <DisposalDetailsDialog
      v-model="detailsDialog"
      :disposal="selectedDisposal"
      @update="updateDisposalStatus"
    />

    <DisposalScheduleDialog
      v-model="scheduleDialog"
      :disposal="selectedDisposal"
      @schedule="scheduleDisposalExecution"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAssetStore } from '@/stores/assetStore';
import { useToast } from '@/composables/useToast';

// Import child components
import DisposalStatusChip from './DisposalStatusChip.vue';
import DisposalSummaryCard from './DisposalSummaryCard.vue';
import AssetDisposalDialog from './AssetDisposalDialog.vue';
import DisposalDetailsDialog from './DisposalDetailsDialog.vue';
import DisposalScheduleDialog from './DisposalScheduleDialog.vue';

const assetStore = useAssetStore();
const { showSuccess, showError } = useToast();

// Reactive data
const disposalLoading = ref(false);
const disposalDialog = ref(false);
const detailsDialog = ref(false);
const scheduleDialog = ref(false);
const selectedDisposal = ref(null);

// Computed properties
const disposalQueue = computed(() => assetStore.disposalQueue);
const disposalSummary = computed(() => assetStore.disposalSummary);

const disposalMethods = [
  {
    id: 1,
    name: 'Recycling',
    description: 'Environmentally friendly disposal',
    assetCount: 15
  },
  {
    id: 2,
    name: 'Sale',
    description: 'Sell to recover value',
    assetCount: 8
  },
  {
    id: 3,
    name: 'Donation',
    description: 'Donate to charitable organizations',
    assetCount: 12
  },
  {
    id: 4,
    name: 'Destruction',
    description: 'Secure destruction for sensitive assets',
    assetCount: 3
  }
];

// Table headers
const disposalHeaders = [
  { title: 'Asset', key: 'asset', width: 200 },
  { title: 'Reason', key: 'reason', width: 120 },
  { title: 'Status', key: 'status', width: 120 },
  { title: 'Requested Date', key: 'requestedDate', width: 120 },
  { title: 'Value', key: 'estimatedValue', width: 120, align: 'end' },
  { title: 'Actions', key: 'actions', width: 100, sortable: false }
];

// Methods
const openDisposalDialog = () => {
  disposalDialog.value = true;
};

const viewDisposalDetails = (disposal) => {
  selectedDisposal.value = disposal;
  detailsDialog.value = true;
};

const approveDisposal = async (disposal) => {
  try {
    await assetStore.approveDisposal(disposal.id);
    showSuccess('Disposal approved');
    loadDisposalQueue();
  } catch (error) {
    showError('Failed to approve disposal');
  }
};

const rejectDisposal = async (disposal) => {
  try {
    await assetStore.rejectDisposal(disposal.id);
    showSuccess('Disposal rejected');
    loadDisposalQueue();
  } catch (error) {
    showError('Failed to reject disposal');
  }
};

const scheduleDisposal = (disposal) => {
  selectedDisposal.value = disposal;
  scheduleDialog.value = true;
};

const handleAssetDisposal = async (disposalData) => {
  try {
    await assetStore.initiateDisposal(disposalData);
    showSuccess('Asset disposal initiated');
    disposalDialog.value = false;
    loadDisposalQueue();
  } catch (error) {
    showError('Failed to initiate disposal');
  }
};

const updateDisposalStatus = async (statusData) => {
  try {
    await assetStore.updateDisposalStatus(
      selectedDisposal.value.id,
      statusData
    );
    showSuccess('Disposal status updated');
    detailsDialog.value = false;
    loadDisposalQueue();
  } catch (error) {
    showError('Failed to update disposal status');
  }
};

const scheduleDisposalExecution = async (scheduleData) => {
  try {
    await assetStore.scheduleDisposal(
      selectedDisposal.value.id,
      scheduleData
    );
    showSuccess('Disposal scheduled');
    scheduleDialog.value = false;
    loadDisposalQueue();
  } catch (error) {
    showError('Failed to schedule disposal');
  }
};

const loadDisposalQueue = async () => {
  disposalLoading.value = true;
  try {
    await assetStore.fetchDisposalQueue();
  } catch (error) {
    showError('Failed to load disposal queue');
  } finally {
    disposalLoading.value = false;
  }
};

// Utility functions
const getAssetIcon = (category: string): string => {
  const iconMap = {
    'IT Equipment': 'mdi-laptop',
    'Office Furniture': 'mdi-chair-rolling',
    'Vehicles': 'mdi-car'
  };
  return iconMap[category] || 'mdi-package';
};

const getDisposalReasonColor = (reason: string): string => {
  const colorMap = {
    'End of Life': 'grey',
    'Damaged': 'error',
    'Obsolete': 'warning',
    'Upgrade': 'info'
  };
  return colorMap[reason] || 'grey';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Lifecycle
onMounted(() => {
  loadDisposalQueue();
});
</script>
```

### 3. Maintenance Store (Pinia)
```typescript
// stores/maintenanceStore.ts
import { defineStore } from 'pinia';
import { maintenanceApi } from '@/api/maintenanceApi';

interface MaintenanceState {
  maintenanceRecords: MaintenanceRecord[];
  totalRecords: number;
  maintenanceStats: {
    scheduledThisWeek: number;
    overdue: number;
    inProgress: number;
    monthlyBudget: number;
    actualSpend: number;
  };
  workLogs: WorkLog[];
  maintenanceTemplates: MaintenanceTemplate[];
  technicians: Technician[];
}

export const useMaintenanceStore = defineStore('maintenance', {
  state: (): MaintenanceState => ({
    maintenanceRecords: [],
    totalRecords: 0,
    maintenanceStats: {
      scheduledThisWeek: 0,
      overdue: 0,
      inProgress: 0,
      monthlyBudget: 0,
      actualSpend: 0
    },
    workLogs: [],
    maintenanceTemplates: [],
    technicians: []
  }),

  getters: {
    getMaintenanceById: (state) => (id: string) => {
      return state.maintenanceRecords.find(record => record.id === id);
    },
    
    getOverdueMaintenance: (state) => {
      return state.maintenanceRecords.filter(record => 
        record.status === 'overdue' || 
        (new Date(record.scheduledDate) < new Date() && record.status === 'scheduled')
      );
    },
    
    getUpcomingMaintenance: (state) => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      return state.maintenanceRecords.filter(record =>
        record.status === 'scheduled' &&
        new Date(record.scheduledDate) <= nextWeek
      );
    }
  },

  actions: {
    async fetchMaintenanceRecords(params: any) {
      try {
        const response = await maintenanceApi.getMaintenanceRecords(params);
        this.maintenanceRecords = response.data.records;
        this.totalRecords = response.data.total;
        return response;
      } catch (error) {
        console.error('Failed to fetch maintenance records:', error);
        throw error;
      }
    },

    async scheduleMaintenance(maintenanceData: any) {
      try {
        const response = await maintenanceApi.scheduleMaintenance(maintenanceData);
        this.maintenanceRecords.unshift(response.data);
        this.totalRecords++;
        return response.data;
      } catch (error) {
        console.error('Failed to schedule maintenance:', error);
        throw error;
      }
    },

    async updateMaintenanceProgress(id: string, progressData: any) {
      try {
        const response = await maintenanceApi.updateProgress(id, progressData);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        if (index !== -1) {
          this.maintenanceRecords[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Failed to update maintenance progress:', error);
        throw error;
      }
    },

    async startMaintenance(id: string) {
      try {
        const response = await maintenanceApi.startMaintenance(id);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        if (index !== -1) {
          this.maintenanceRecords[index].status = 'in_progress';
          this.maintenanceRecords[index].actualStartDate = response.data.actualStartDate;
        }
        return response.data;
      } catch (error) {
        console.error('Failed to start maintenance:', error);
        throw error;
      }
    },

    async completeMaintenance(id: string) {
      try {
        const response = await maintenanceApi.completeMaintenance(id);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        if (index !== -1) {
          this.maintenanceRecords[index].status = 'completed';
          this.maintenanceRecords[index].completedDate = response.data.completedDate;
          this.maintenanceRecords[index].progress = 100;
        }
        return response.data;
      } catch (error) {
        console.error('Failed to complete maintenance:', error);
        throw error;
      }
    },

    async cancelMaintenance(id: string) {
      try {
        await maintenanceApi.cancelMaintenance(id);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        if (index !== -1) {
          this.maintenanceRecords[index].status = 'cancelled';
        }
      } catch (error) {
        console.error('Failed to cancel maintenance:', error);
        throw error;
      }
    },

    async addWorkLog(maintenanceId: string, workLogData: any) {
      try {
        const response = await maintenanceApi.addWorkLog(maintenanceId, workLogData);
        this.workLogs.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to add work log:', error);
        throw error;
      }
    },

    async fetchMaintenanceStats() {
      try {
        const response = await maintenanceApi.getMaintenanceStats();
        this.maintenanceStats = response.data;
      } catch (error) {
        console.error('Failed to fetch maintenance stats:', error);
      }
    },

    async fetchTechnicians() {
      try {
        const response = await maintenanceApi.getTechnicians();
        this.technicians = response.data;
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
      }
    },

    async exportMaintenanceData(filters: any) {
      try {
        const response = await maintenanceApi.exportData(filters);
        // Handle file download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'maintenance-report.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Failed to export maintenance data:', error);
        throw error;
      }
    }
  }
});
```

## Key Migration Features

### 1. **Comprehensive Maintenance Management**
- Preventive and corrective maintenance scheduling
- Progress tracking with visual indicators
- Work log management with photos and notes
- Cost tracking and budget management

### 2. **Advanced Scheduling**
- Calendar integration for maintenance planning
- Technician assignment and workload balancing
- Automated reminder notifications
- Recurring maintenance schedules

### 3. **Asset Disposal Workflow**
- Multi-step disposal approval process
- Environmental compliance tracking
- Value recovery optimization
- Disposal method selection and tracking

### 4. **Mobile-Optimized Interface**
- Touch-friendly maintenance logging
- Photo capture for work documentation
- Offline capability for field technicians
- QR code scanning for asset identification

### 5. **Analytics and Reporting**
- Maintenance cost analysis
- Asset reliability tracking
- Preventive vs corrective maintenance ratios
- Technician performance metrics

This implementation provides a complete asset maintenance and disposal system that preserves all React functionality while leveraging Vue.js 3 and Vuetify's modern architecture for enhanced user experience and maintainability.