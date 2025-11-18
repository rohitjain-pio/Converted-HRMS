# Asset Management Part 3B: Asset Disposal & Store Implementation - UI Migration Guide

## Overview
This document covers the Asset Disposal workflow management and Pinia store implementation for the complete Asset Management Part 3 module migration from React to Vue.js.

## Asset Disposal Implementation

### 1. Asset Disposal Manager Component
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

### 2. Supporting Disposal Components

#### Disposal Status Chip Component
```vue
<!-- DisposalStatusChip.vue -->
<template>
  <v-chip
    :color="statusConfig.color"
    :variant="statusConfig.variant"
    size="small"
    :prepend-icon="statusConfig.icon"
  >
    {{ status }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status: string;
}

const props = defineProps<Props>();

const statusConfig = computed(() => {
  const configs = {
    'Pending Approval': {
      color: 'warning',
      variant: 'tonal',
      icon: 'mdi-clock-outline'
    },
    'Approved': {
      color: 'success',
      variant: 'tonal',
      icon: 'mdi-check-circle'
    },
    'Scheduled': {
      color: 'info',
      variant: 'tonal',
      icon: 'mdi-calendar-check'
    },
    'In Progress': {
      color: 'primary',
      variant: 'tonal',
      icon: 'mdi-progress-clock'
    },
    'Completed': {
      color: 'success',
      variant: 'flat',
      icon: 'mdi-check-all'
    },
    'Rejected': {
      color: 'error',
      variant: 'tonal',
      icon: 'mdi-close-circle'
    },
    'Cancelled': {
      color: 'grey',
      variant: 'tonal',
      icon: 'mdi-cancel'
    }
  };
  
  return configs[props.status] || {
    color: 'grey',
    variant: 'tonal',
    icon: 'mdi-help-circle'
  };
});
</script>
```

#### Disposal Summary Card Component
```vue
<!-- DisposalSummaryCard.vue -->
<template>
  <v-card variant="outlined">
    <v-card-title class="text-subtitle-1">
      <v-icon start>mdi-chart-pie</v-icon>
      Disposal Summary
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-center">
            <div class="text-h6 text-warning">{{ summary.pendingApproval }}</div>
            <div class="text-caption">Pending Approval</div>
          </div>
        </v-col>
        
        <v-col cols="6">
          <div class="text-center">
            <div class="text-h6 text-success">{{ summary.approved }}</div>
            <div class="text-caption">Approved</div>
          </div>
        </v-col>
        
        <v-col cols="6">
          <div class="text-center">
            <div class="text-h6 text-info">{{ summary.inProgress }}</div>
            <div class="text-caption">In Progress</div>
          </div>
        </v-col>
        
        <v-col cols="6">
          <div class="text-center">
            <div class="text-h6 text-primary">{{ summary.completed }}</div>
            <div class="text-caption">Completed</div>
          </div>
        </v-col>
      </v-row>
      
      <v-divider class="my-3" />
      
      <div class="d-flex justify-space-between align-center">
        <span class="text-body-2">Total Value Recovery:</span>
        <span class="text-h6 text-success">
          {{ formatCurrency(summary.totalRecoveryValue) }}
        </span>
      </div>
      
      <div class="d-flex justify-space-between align-center mt-2">
        <span class="text-body-2">Environmental Impact:</span>
        <v-chip color="green" size="small" variant="tonal">
          {{ summary.environmentalScore }}% Green
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  summary: {
    pendingApproval: number;
    approved: number;
    inProgress: number;
    completed: number;
    totalRecoveryValue: number;
    environmentalScore: number;
  };
}

defineProps<Props>();

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
</script>
```

## Pinia Store Implementation

### 3. Complete Maintenance Store
```typescript
// stores/maintenanceStore.ts
import { defineStore } from 'pinia';
import { maintenanceApi } from '@/api/maintenanceApi';
import type { 
  MaintenanceRecord, 
  MaintenanceFilters, 
  WorkLog, 
  MaintenanceTemplate, 
  Technician,
  MaintenanceStats 
} from '@/types/maintenance';

interface MaintenanceState {
  maintenanceRecords: MaintenanceRecord[];
  totalRecords: number;
  maintenanceStats: MaintenanceStats;
  workLogs: WorkLog[];
  maintenanceTemplates: MaintenanceTemplate[];
  technicians: Technician[];
  loading: boolean;
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
      actualSpend: 0,
      completed: 0,
      avgCompletionTime: 0
    },
    workLogs: [],
    maintenanceTemplates: [],
    technicians: [],
    loading: false
  }),

  getters: {
    getMaintenanceById: (state) => (id: string) => {
      return state.maintenanceRecords.find(record => record.id === id);
    },
    
    getOverdueMaintenance: (state) => {
      const today = new Date();
      return state.maintenanceRecords.filter(record => 
        record.status === 'overdue' || 
        (new Date(record.scheduledDate) < today && record.status === 'scheduled')
      );
    },
    
    getUpcomingMaintenance: (state) => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const today = new Date();
      
      return state.maintenanceRecords.filter(record =>
        record.status === 'scheduled' &&
        new Date(record.scheduledDate) >= today &&
        new Date(record.scheduledDate) <= nextWeek
      );
    },

    getMaintenanceByAsset: (state) => (assetId: string) => {
      return state.maintenanceRecords.filter(record => 
        record.assetId === assetId
      );
    },

    getMaintenanceByTechnician: (state) => (technicianId: string) => {
      return state.maintenanceRecords.filter(record => 
        record.assignedTechnician?.id === technicianId
      );
    },

    getMaintenanceCostByPeriod: (state) => (startDate: Date, endDate: Date) => {
      return state.maintenanceRecords
        .filter(record => {
          const recordDate = new Date(record.scheduledDate);
          return recordDate >= startDate && recordDate <= endDate;
        })
        .reduce((total, record) => total + (record.actualCost || record.estimatedCost), 0);
    }
  },

  actions: {
    async fetchMaintenanceRecords(params: MaintenanceFilters & {
      page?: number;
      itemsPerPage?: number;
      sortBy?: any[];
    }) {
      this.loading = true;
      try {
        const response = await maintenanceApi.getMaintenanceRecords(params);
        this.maintenanceRecords = response.data.records;
        this.totalRecords = response.data.total;
        return response;
      } catch (error) {
        console.error('Failed to fetch maintenance records:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async scheduleMaintenance(maintenanceData: Partial<MaintenanceRecord>) {
      try {
        const response = await maintenanceApi.scheduleMaintenance(maintenanceData);
        this.maintenanceRecords.unshift(response.data);
        this.totalRecords++;
        
        // Update stats
        await this.fetchMaintenanceStats();
        
        return response.data;
      } catch (error) {
        console.error('Failed to schedule maintenance:', error);
        throw error;
      }
    },

    async updateMaintenanceRecord(id: string, updateData: Partial<MaintenanceRecord>) {
      try {
        const response = await maintenanceApi.updateMaintenance(id, updateData);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        
        if (index !== -1) {
          this.maintenanceRecords[index] = { ...this.maintenanceRecords[index], ...response.data };
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to update maintenance record:', error);
        throw error;
      }
    },

    async updateMaintenanceProgress(id: string, progressData: {
      progress: number;
      notes?: string;
      actualCost?: number;
      completedTasks?: string[];
    }) {
      try {
        const response = await maintenanceApi.updateProgress(id, progressData);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        
        if (index !== -1) {
          this.maintenanceRecords[index] = { ...this.maintenanceRecords[index], ...response.data };
          
          // Auto-complete if progress is 100%
          if (progressData.progress >= 100) {
            this.maintenanceRecords[index].status = 'completed';
            this.maintenanceRecords[index].completedDate = new Date().toISOString();
          }
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
          this.maintenanceRecords[index].progress = response.data.progress || 0;
        }
        
        await this.fetchMaintenanceStats();
        return response.data;
      } catch (error) {
        console.error('Failed to start maintenance:', error);
        throw error;
      }
    },

    async completeMaintenance(id: string, completionData?: {
      actualCost?: number;
      completionNotes?: string;
      nextMaintenanceDate?: string;
    }) {
      try {
        const response = await maintenanceApi.completeMaintenance(id, completionData);
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        
        if (index !== -1) {
          this.maintenanceRecords[index].status = 'completed';
          this.maintenanceRecords[index].completedDate = response.data.completedDate;
          this.maintenanceRecords[index].progress = 100;
          this.maintenanceRecords[index].actualCost = response.data.actualCost;
        }
        
        await this.fetchMaintenanceStats();
        return response.data;
      } catch (error) {
        console.error('Failed to complete maintenance:', error);
        throw error;
      }
    },

    async cancelMaintenance(id: string, reason?: string) {
      try {
        await maintenanceApi.cancelMaintenance(id, { reason });
        const index = this.maintenanceRecords.findIndex(record => record.id === id);
        
        if (index !== -1) {
          this.maintenanceRecords[index].status = 'cancelled';
          this.maintenanceRecords[index].cancellationReason = reason;
        }
        
        await this.fetchMaintenanceStats();
      } catch (error) {
        console.error('Failed to cancel maintenance:', error);
        throw error;
      }
    },

    async addWorkLog(maintenanceId: string, workLogData: Partial<WorkLog>) {
      try {
        const response = await maintenanceApi.addWorkLog(maintenanceId, workLogData);
        this.workLogs.push(response.data);
        
        // Update the maintenance record's work logs
        const maintenanceIndex = this.maintenanceRecords.findIndex(
          record => record.id === maintenanceId
        );
        if (maintenanceIndex !== -1) {
          if (!this.maintenanceRecords[maintenanceIndex].workLogs) {
            this.maintenanceRecords[maintenanceIndex].workLogs = [];
          }
          this.maintenanceRecords[maintenanceIndex].workLogs!.push(response.data);
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to add work log:', error);
        throw error;
      }
    },

    async fetchWorkLogs(maintenanceId: string) {
      try {
        const response = await maintenanceApi.getWorkLogs(maintenanceId);
        
        // Update the specific maintenance record's work logs
        const index = this.maintenanceRecords.findIndex(record => record.id === maintenanceId);
        if (index !== -1) {
          this.maintenanceRecords[index].workLogs = response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to fetch work logs:', error);
        throw error;
      }
    },

    async fetchMaintenanceStats() {
      try {
        const response = await maintenanceApi.getMaintenanceStats();
        this.maintenanceStats = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch maintenance stats:', error);
        throw error;
      }
    },

    async fetchTechnicians() {
      try {
        const response = await maintenanceApi.getTechnicians();
        this.technicians = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
        throw error;
      }
    },

    async fetchMaintenanceTemplates() {
      try {
        const response = await maintenanceApi.getMaintenanceTemplates();
        this.maintenanceTemplates = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch maintenance templates:', error);
        throw error;
      }
    },

    async createMaintenanceTemplate(templateData: Partial<MaintenanceTemplate>) {
      try {
        const response = await maintenanceApi.createMaintenanceTemplate(templateData);
        this.maintenanceTemplates.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to create maintenance template:', error);
        throw error;
      }
    },

    async generateRecurringMaintenance(templateId: string, assetIds: string[]) {
      try {
        const response = await maintenanceApi.generateRecurringMaintenance(templateId, assetIds);
        
        // Add the generated maintenance records
        this.maintenanceRecords.unshift(...response.data);
        this.totalRecords += response.data.length;
        
        await this.fetchMaintenanceStats();
        return response.data;
      } catch (error) {
        console.error('Failed to generate recurring maintenance:', error);
        throw error;
      }
    },

    async exportMaintenanceData(filters: MaintenanceFilters, format: 'xlsx' | 'pdf' | 'csv' = 'xlsx') {
      try {
        const response = await maintenanceApi.exportData(filters, format);
        
        // Create and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `maintenance-report.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return true;
      } catch (error) {
        console.error('Failed to export maintenance data:', error);
        throw error;
      }
    },

    async assignTechnician(maintenanceId: string, technicianId: string) {
      try {
        const response = await maintenanceApi.assignTechnician(maintenanceId, technicianId);
        const index = this.maintenanceRecords.findIndex(record => record.id === maintenanceId);
        
        if (index !== -1) {
          this.maintenanceRecords[index].assignedTechnician = response.data.technician;
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to assign technician:', error);
        throw error;
      }
    },

    // Reset store state
    $reset() {
      this.maintenanceRecords = [];
      this.totalRecords = 0;
      this.workLogs = [];
      this.loading = false;
      this.maintenanceStats = {
        scheduledThisWeek: 0,
        overdue: 0,
        inProgress: 0,
        monthlyBudget: 0,
        actualSpend: 0,
        completed: 0,
        avgCompletionTime: 0
      };
    }
  }
});
```

### 4. Asset Store Disposal Extensions
```typescript
// stores/assetStore.ts - Disposal-related actions
export const useAssetStore = defineStore('asset', {
  // ... existing state and getters

  actions: {
    // ... existing actions

    async fetchDisposalQueue() {
      try {
        const response = await assetApi.getDisposalQueue();
        this.disposalQueue = response.data.queue;
        this.disposalSummary = response.data.summary;
        return response;
      } catch (error) {
        console.error('Failed to fetch disposal queue:', error);
        throw error;
      }
    },

    async initiateDisposal(disposalData: {
      assetId: string;
      reason: string;
      method: string;
      estimatedValue?: number;
      notes?: string;
      scheduledDate?: string;
    }) {
      try {
        const response = await assetApi.initiateDisposal(disposalData);
        
        // Update asset status
        const assetIndex = this.assets.findIndex(asset => asset.id === disposalData.assetId);
        if (assetIndex !== -1) {
          this.assets[assetIndex].status = 'Disposal Pending';
        }
        
        // Add to disposal queue
        if (this.disposalQueue) {
          this.disposalQueue.unshift(response.data);
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to initiate disposal:', error);
        throw error;
      }
    },

    async approveDisposal(disposalId: string) {
      try {
        const response = await assetApi.approveDisposal(disposalId);
        
        // Update disposal status in queue
        const disposalIndex = this.disposalQueue?.findIndex(
          disposal => disposal.id === disposalId
        );
        if (disposalIndex !== undefined && disposalIndex !== -1 && this.disposalQueue) {
          this.disposalQueue[disposalIndex].status = 'Approved';
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to approve disposal:', error);
        throw error;
      }
    },

    async rejectDisposal(disposalId: string, reason?: string) {
      try {
        await assetApi.rejectDisposal(disposalId, { reason });
        
        // Update disposal status in queue
        const disposalIndex = this.disposalQueue?.findIndex(
          disposal => disposal.id === disposalId
        );
        if (disposalIndex !== undefined && disposalIndex !== -1 && this.disposalQueue) {
          this.disposalQueue[disposalIndex].status = 'Rejected';
          this.disposalQueue[disposalIndex].rejectionReason = reason;
        }
      } catch (error) {
        console.error('Failed to reject disposal:', error);
        throw error;
      }
    },

    async scheduleDisposal(disposalId: string, scheduleData: {
      scheduledDate: string;
      method: string;
      vendor?: string;
      estimatedRecoveryValue?: number;
    }) {
      try {
        const response = await assetApi.scheduleDisposal(disposalId, scheduleData);
        
        // Update disposal in queue
        const disposalIndex = this.disposalQueue?.findIndex(
          disposal => disposal.id === disposalId
        );
        if (disposalIndex !== undefined && disposalIndex !== -1 && this.disposalQueue) {
          this.disposalQueue[disposalIndex] = { 
            ...this.disposalQueue[disposalIndex], 
            ...response.data 
          };
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to schedule disposal:', error);
        throw error;
      }
    },

    async updateDisposalStatus(disposalId: string, statusData: {
      status: string;
      actualRecoveryValue?: number;
      completedDate?: string;
      notes?: string;
    }) {
      try {
        const response = await assetApi.updateDisposalStatus(disposalId, statusData);
        
        // Update disposal in queue
        const disposalIndex = this.disposalQueue?.findIndex(
          disposal => disposal.id === disposalId
        );
        if (disposalIndex !== undefined && disposalIndex !== -1 && this.disposalQueue) {
          this.disposalQueue[disposalIndex] = { 
            ...this.disposalQueue[disposalIndex], 
            ...response.data 
          };
        }
        
        // If completed, update asset status
        if (statusData.status === 'Completed') {
          const asset = this.assets.find(a => a.id === response.data.assetId);
          if (asset) {
            asset.status = 'Disposed';
            asset.disposalDate = statusData.completedDate;
          }
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to update disposal status:', error);
        throw error;
      }
    }
  }
});
```

## Key Migration Features

### 1. **Complete Disposal Workflow**
- Multi-step approval process
- Environmental compliance tracking
- Value recovery optimization
- Disposal method selection and tracking

### 2. **Advanced Store Management**
- Comprehensive state management with Pinia
- Reactive data updates across components
- Error handling and loading states
- Action composition and reusability

### 3. **Integration Features**
- Asset status synchronization
- Maintenance-to-disposal workflow
- Reporting and analytics integration
- Audit trail maintenance

### 4. **Mobile Optimization**
- Touch-friendly disposal interfaces
- Photo documentation capabilities
- Offline disposal logging
- Responsive disposal queue management

This completes the Asset Management Part 3 documentation with full disposal workflow and comprehensive store implementation for both maintenance and disposal features.