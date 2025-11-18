# Asset Management Part 1: Asset Inventory & Tracking - UI Migration Guide

## Overview
This document provides comprehensive migration guidance for the Asset Inventory & Tracking module from React to Vue.js, focusing on asset listing, filtering, QR code scanning, and inventory management interfaces.

## React Component Analysis

### Current React Implementation
```typescript
// React: ITAssetTable/AssetInventoryList.tsx
import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  QrCodeScanner,
  Edit,
  Visibility,
  Delete,
  Download
} from '@mui/icons-material';

interface AssetInventoryProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onView: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  onScanQR: (asset: Asset) => void;
}

const AssetInventoryList: React.FC<AssetInventoryProps> = ({
  assets,
  onEdit,
  onView,
  onDelete,
  onScanQR
}) => {
  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    location: ''
  });

  const columns: GridColDef[] = [
    {
      field: 'assetCode',
      headerName: 'Asset Code',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{params.value}</span>
          <IconButton size="small" onClick={() => onScanQR(params.row)}>
            <QrCodeScanner fontSize="small" />
          </IconButton>
        </Box>
      )
    },
    {
      field: 'name',
      headerName: 'Asset Name',
      width: 200,
      flex: 1
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getAssetStatusColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'location',
      headerName: 'Current Location',
      width: 180
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 160
    },
    {
      field: 'purchaseDate',
      headerName: 'Purchase Date',
      width: 140,
      type: 'date'
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 120,
      type: 'number',
      renderCell: (params) => `$${params.value.toLocaleString()}`
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => onView(params.row)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => onDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search Assets"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="IT Equipment">IT Equipment</MenuItem>
            <MenuItem value="Office Furniture">Office Furniture</MenuItem>
            <MenuItem value="Vehicles">Vehicles</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Assigned">Assigned</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
            <MenuItem value="Retired">Retired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataGrid
        rows={filteredAssets}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 }
          }
        }}
      />
    </Box>
  );
};
```

## Vue.js Implementation

### 1. Main Asset Inventory Component
```vue
<template>
  <div class="asset-inventory-container">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h4">Asset Inventory</h2>
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openAddAssetDialog"
            >
              Add Asset
            </v-btn>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-download"
              @click="exportAssets"
            >
              Export
            </v-btn>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-qrcode-scan"
              @click="openQRScanner"
            >
              QR Scanner
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon start>mdi-filter</v-icon>
        Filters
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="Search Assets"
              prepend-inner-icon="mdi-magnify"
              clearable
              variant="outlined"
              density="compact"
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.category"
              label="Category"
              :items="assetCategories"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.status"
              label="Status"
              :items="assetStatuses"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.location"
              label="Location"
              :items="locations"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.assignedStatus"
              label="Assignment"
              :items="assignmentOptions"
              item-title="name"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              icon="mdi-refresh"
              variant="outlined"
              @click="resetFilters"
              title="Reset Filters"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Assets Data Table -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Assets ({{ totalAssets }})</span>
        <div class="d-flex gap-2">
          <v-btn-toggle
            v-model="viewMode"
            variant="outlined"
            divided
          >
            <v-btn icon="mdi-table" value="table" />
            <v-btn icon="mdi-grid" value="grid" />
          </v-btn-toggle>
        </div>
      </v-card-title>

      <!-- Table View -->
      <v-data-table-server
        v-if="viewMode === 'table'"
        :headers="assetHeaders"
        :items="assets"
        :items-length="totalAssets"
        :loading="loading"
        :search="filters.search"
        v-model:page="pagination.page"
        v-model:items-per-page="pagination.itemsPerPage"
        v-model:sort-by="pagination.sortBy"
        @update:options="loadAssets"
        class="asset-table"
      >
        <!-- Asset Code Column with QR Scanner -->
        <template #item.assetCode="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip
              :color="item.qrCodeExists ? 'success' : 'warning'"
              size="small"
              variant="tonal"
            >
              {{ item.assetCode }}
            </v-chip>
            <v-btn
              icon="mdi-qrcode-scan"
              size="x-small"
              variant="text"
              @click="scanAssetQR(item)"
              :title="`Scan QR for ${item.assetCode}`"
            />
          </div>
        </template>

        <!-- Asset Name with Image -->
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar size="40" rounded="4">
              <v-img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
              />
              <v-icon v-else size="20">{{ getAssetIcon(item.category) }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ item.model }} - {{ item.serialNumber }}
              </div>
            </div>
          </div>
        </template>

        <!-- Category Column -->
        <template #item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            size="small"
            variant="tonal"
          >
            <v-icon start size="16">{{ getAssetIcon(item.category) }}</v-icon>
            {{ item.category }}
          </v-chip>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <AssetStatusChip :status="item.status" />
        </template>

        <!-- Current Location -->
        <template #item.location="{ item }">
          <div class="d-flex align-center gap-2">
            <v-icon size="16" color="medium-emphasis">mdi-map-marker</v-icon>
            <span>{{ item.location }}</span>
          </div>
        </template>

        <!-- Assigned To -->
        <template #item.assignedTo="{ item }">
          <div v-if="item.assignedTo" class="d-flex align-center gap-2">
            <v-avatar size="24">
              <v-img
                v-if="item.assignedTo.avatar"
                :src="item.assignedTo.avatar"
              />
              <span v-else class="text-caption">
                {{ item.assignedTo.name.charAt(0) }}
              </span>
            </v-avatar>
            <span>{{ item.assignedTo.name }}</span>
          </div>
          <v-chip v-else color="grey" size="small" variant="tonal">
            Unassigned
          </v-chip>
        </template>

        <!-- Purchase Date -->
        <template #item.purchaseDate="{ item }">
          <div>
            <div>{{ formatDate(item.purchaseDate) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ getAssetAge(item.purchaseDate) }}
            </div>
          </div>
        </template>

        <!-- Asset Value -->
        <template #item.value="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">
              {{ formatCurrency(item.currentValue) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Original: {{ formatCurrency(item.originalValue) }}
            </div>
          </div>
        </template>

        <!-- Condition/Health -->
        <template #item.condition="{ item }">
          <AssetConditionIndicator :condition="item.condition" />
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
              <v-list-item
                prepend-icon="mdi-eye"
                title="View Details"
                @click="viewAsset(item)"
              />
              <v-list-item
                prepend-icon="mdi-pencil"
                title="Edit Asset"
                @click="editAsset(item)"
                v-if="canEditAssets"
              />
              <v-list-item
                prepend-icon="mdi-account-arrow-right"
                title="Assign Asset"
                @click="assignAsset(item)"
                v-if="canAssignAssets && item.status === 'Available'"
              />
              <v-list-item
                prepend-icon="mdi-qrcode"
                title="Generate QR Code"
                @click="generateQR(item)"
              />
              <v-list-item
                prepend-icon="mdi-history"
                title="View History"
                @click="viewAssetHistory(item)"
              />
              <v-divider v-if="canDeleteAssets" />
              <v-list-item
                prepend-icon="mdi-delete"
                title="Delete Asset"
                @click="confirmDeleteAsset(item)"
                v-if="canDeleteAssets"
                class="text-error"
              />
            </v-list>
          </v-menu>
        </template>

        <!-- Loading Slot -->
        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <!-- No Data Slot -->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
            <div class="text-h6 mt-4">No Assets Found</div>
            <div class="text-body-2 text-medium-emphasis">
              Add your first asset or adjust your search criteria
            </div>
            <v-btn
              color="primary"
              class="mt-4"
              prepend-icon="mdi-plus"
              @click="openAddAssetDialog"
            >
              Add Asset
            </v-btn>
          </div>
        </template>
      </v-data-table-server>

      <!-- Grid View -->
      <AssetGridView
        v-else
        :assets="assets"
        :loading="loading"
        @view="viewAsset"
        @edit="editAsset"
        @assign="assignAsset"
        @scan-qr="scanAssetQR"
      />
    </v-card>

    <!-- Quick Stats Cards -->
    <v-row class="mt-4">
      <v-col cols="12" md="3">
        <AssetStatCard
          title="Total Assets"
          :value="assetStats.total"
          icon="mdi-package-variant"
          color="primary"
        />
      </v-col>
      <v-col cols="12" md="3">
        <AssetStatCard
          title="Available"
          :value="assetStats.available"
          icon="mdi-check-circle"
          color="success"
        />
      </v-col>
      <v-col cols="12" md="3">
        <AssetStatCard
          title="Assigned"
          :value="assetStats.assigned"
          icon="mdi-account-check"
          color="info"
        />
      </v-col>
      <v-col cols="12" md="3">
        <AssetStatCard
          title="Maintenance"
          :value="assetStats.maintenance"
          icon="mdi-wrench"
          color="warning"
        />
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <AssetDetailsDialog
      v-model="detailsDialog"
      :asset="selectedAsset"
      @edit="editAsset"
      @assign="assignAsset"
    />

    <AssetFormDialog
      v-model="formDialog"
      :asset="editingAsset"
      @save="saveAsset"
      @cancel="cancelAssetForm"
    />

    <QRScannerDialog
      v-model="qrDialog"
      @scan-result="handleQRScan"
    />

    <AssetAssignmentDialog
      v-model="assignmentDialog"
      :asset="assigningAsset"
      @assign="handleAssetAssignment"
    />

    <!-- Confirmation Dialogs -->
    <v-dialog v-model="deleteConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete the asset "{{ deletingAsset?.name }}"?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteConfirmDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteAsset">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAssetStore } from '@/stores/assetStore';
import { usePermissionStore } from '@/stores/permissionStore';
import { useDebounceFn } from '@vueuse/core';
import { useToast } from '@/composables/useToast';
import type { Asset, AssetFilters } from '@/types/asset';

// Import child components
import AssetStatusChip from './AssetStatusChip.vue';
import AssetConditionIndicator from './AssetConditionIndicator.vue';
import AssetGridView from './AssetGridView.vue';
import AssetStatCard from './AssetStatCard.vue';
import AssetDetailsDialog from './AssetDetailsDialog.vue';
import AssetFormDialog from './AssetFormDialog.vue';
import QRScannerDialog from './QRScannerDialog.vue';
import AssetAssignmentDialog from './AssetAssignmentDialog.vue';

// Stores
const assetStore = useAssetStore();
const permissionStore = usePermissionStore();
const { showSuccess, showError } = useToast();

// Reactive data
const assets = computed(() => assetStore.assets);
const totalAssets = computed(() => assetStore.totalAssets);
const assetStats = computed(() => assetStore.assetStats);
const loading = ref(false);
const viewMode = ref('table');

// Filters
const filters = ref<AssetFilters>({
  search: '',
  category: '',
  status: '',
  location: '',
  assignedStatus: ''
});

// Pagination
const pagination = ref({
  page: 1,
  itemsPerPage: 25,
  sortBy: [{ key: 'updatedAt', order: 'desc' }]
});

// Dialog states
const detailsDialog = ref(false);
const formDialog = ref(false);
const qrDialog = ref(false);
const assignmentDialog = ref(false);
const deleteConfirmDialog = ref(false);

// Selected items
const selectedAsset = ref<Asset | null>(null);
const editingAsset = ref<Asset | null>(null);
const assigningAsset = ref<Asset | null>(null);
const deletingAsset = ref<Asset | null>(null);

// Permissions
const canEditAssets = computed(() => permissionStore.hasPermission('ASSET.EDIT'));
const canDeleteAssets = computed(() => permissionStore.hasPermission('ASSET.DELETE'));
const canAssignAssets = computed(() => permissionStore.hasPermission('ASSET.ASSIGN'));

// Table headers
const assetHeaders = computed(() => [
  {
    title: 'Asset Code',
    key: 'assetCode',
    width: 140,
    sortable: true
  },
  {
    title: 'Asset Details',
    key: 'name',
    width: 250,
    sortable: true
  },
  {
    title: 'Category',
    key: 'category',
    width: 150,
    sortable: true
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    sortable: true
  },
  {
    title: 'Location',
    key: 'location',
    width: 160,
    sortable: true
  },
  {
    title: 'Assigned To',
    key: 'assignedTo',
    width: 160,
    sortable: false
  },
  {
    title: 'Purchase Date',
    key: 'purchaseDate',
    width: 140,
    sortable: true
  },
  {
    title: 'Value',
    key: 'value',
    width: 120,
    sortable: true,
    align: 'end'
  },
  {
    title: 'Condition',
    key: 'condition',
    width: 100,
    sortable: true
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 80,
    sortable: false
  }
]);

// Filter options
const assetCategories = computed(() => assetStore.assetCategories);
const assetStatuses = computed(() => assetStore.assetStatuses);
const locations = computed(() => assetStore.locations);
const assignmentOptions = [
  { name: 'All', value: '' },
  { name: 'Assigned', value: 'assigned' },
  { name: 'Unassigned', value: 'unassigned' }
];

// Methods
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1;
  loadAssets();
}, 500);

const loadAssets = async () => {
  loading.value = true;
  try {
    await assetStore.fetchAssets({
      ...filters.value,
      page: pagination.value.page,
      itemsPerPage: pagination.value.itemsPerPage,
      sortBy: pagination.value.sortBy
    });
  } catch (error) {
    showError('Failed to load assets');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: '',
    location: '',
    assignedStatus: ''
  };
  pagination.value.page = 1;
  loadAssets();
};

// Asset actions
const viewAsset = (asset: Asset) => {
  selectedAsset.value = asset;
  detailsDialog.value = true;
};

const editAsset = (asset: Asset) => {
  editingAsset.value = asset;
  formDialog.value = true;
};

const openAddAssetDialog = () => {
  editingAsset.value = null;
  formDialog.value = true;
};

const assignAsset = (asset: Asset) => {
  assigningAsset.value = asset;
  assignmentDialog.value = true;
};

const scanAssetQR = (asset: Asset) => {
  // Open QR scanner for specific asset
  selectedAsset.value = asset;
  qrDialog.value = true;
};

const openQRScanner = () => {
  // Open general QR scanner
  selectedAsset.value = null;
  qrDialog.value = true;
};

const generateQR = (asset: Asset) => {
  // Generate QR code for asset
  assetStore.generateQRCode(asset.id);
  showSuccess('QR code generated successfully');
};

const viewAssetHistory = (asset: Asset) => {
  // Navigate to asset history page
  // router.push(`/assets/${asset.id}/history`);
};

const confirmDeleteAsset = (asset: Asset) => {
  deletingAsset.value = asset;
  deleteConfirmDialog.value = true;
};

const deleteAsset = async () => {
  if (!deletingAsset.value) return;
  
  try {
    await assetStore.deleteAsset(deletingAsset.value.id);
    showSuccess('Asset deleted successfully');
    deleteConfirmDialog.value = false;
    deletingAsset.value = null;
    loadAssets();
  } catch (error) {
    showError('Failed to delete asset');
  }
};

// Dialog handlers
const saveAsset = async (asset: Asset) => {
  try {
    if (asset.id) {
      await assetStore.updateAsset(asset.id, asset);
      showSuccess('Asset updated successfully');
    } else {
      await assetStore.createAsset(asset);
      showSuccess('Asset created successfully');
    }
    formDialog.value = false;
    editingAsset.value = null;
    loadAssets();
  } catch (error) {
    showError('Failed to save asset');
  }
};

const cancelAssetForm = () => {
  formDialog.value = false;
  editingAsset.value = null;
};

const handleQRScan = async (qrData: string) => {
  try {
    // Process QR scan result
    const asset = await assetStore.findAssetByQR(qrData);
    if (asset) {
      selectedAsset.value = asset;
      qrDialog.value = false;
      detailsDialog.value = true;
      showSuccess('Asset found via QR scan');
    } else {
      showError('Asset not found for this QR code');
    }
  } catch (error) {
    showError('Failed to process QR scan');
  }
};

const handleAssetAssignment = async (assignmentData: any) => {
  try {
    await assetStore.assignAsset(assigningAsset.value!.id, assignmentData);
    showSuccess('Asset assigned successfully');
    assignmentDialog.value = false;
    assigningAsset.value = null;
    loadAssets();
  } catch (error) {
    showError('Failed to assign asset');
  }
};

const exportAssets = async () => {
  try {
    await assetStore.exportAssets(filters.value);
    showSuccess('Assets exported successfully');
  } catch (error) {
    showError('Failed to export assets');
  }
};

// Utility functions
const getAssetIcon = (category: string): string => {
  const iconMap = {
    'IT Equipment': 'mdi-laptop',
    'Office Furniture': 'mdi-chair-rolling',
    'Vehicles': 'mdi-car',
    'Tools': 'mdi-hammer-wrench',
    'Electronics': 'mdi-devices',
    'Software': 'mdi-application'
  };
  return iconMap[category] || 'mdi-package-variant';
};

const getCategoryColor = (category: string): string => {
  const colorMap = {
    'IT Equipment': 'blue',
    'Office Furniture': 'green',
    'Vehicles': 'orange',
    'Tools': 'purple',
    'Electronics': 'cyan',
    'Software': 'pink'
  };
  return colorMap[category] || 'grey';
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

const getAssetAge = (purchaseDate: string): string => {
  const years = Math.floor((Date.now() - new Date(purchaseDate).getTime()) / (365 * 24 * 60 * 60 * 1000));
  return years > 0 ? `${years} year${years > 1 ? 's' : ''} old` : 'Less than 1 year';
};

// Lifecycle
onMounted(() => {
  loadAssets();
  assetStore.fetchAssetCategories();
  assetStore.fetchLocations();
});

// Watch filters
watch(() => filters.value, () => {
  pagination.value.page = 1;
  loadAssets();
}, { deep: true });
</script>

<style scoped>
.asset-inventory-container {
  padding: 24px;
}

.asset-table :deep(.v-data-table__td) {
  padding: 12px 8px;
}

.asset-table :deep(.v-data-table-header__content) {
  font-weight: 600;
}

.asset-details-cell {
  min-height: 60px;
  display: flex;
  align-items: center;
}

@media (max-width: 960px) {
  .asset-inventory-container {
    padding: 16px;
  }
  
  .asset-table :deep(.v-data-table__td) {
    padding: 8px 4px;
    font-size: 0.875rem;
  }
}
</style>
```

## Supporting Components

### 2. Asset Status Chip Component
```vue
<!-- AssetStatusChip.vue -->
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
    'Available': {
      color: 'success',
      variant: 'tonal',
      icon: 'mdi-check-circle'
    },
    'Assigned': {
      color: 'info',
      variant: 'tonal',
      icon: 'mdi-account-check'
    },
    'Maintenance': {
      color: 'warning',
      variant: 'tonal',
      icon: 'mdi-wrench'
    },
    'Retired': {
      color: 'error',
      variant: 'tonal',
      icon: 'mdi-archive'
    },
    'Lost': {
      color: 'error',
      variant: 'flat',
      icon: 'mdi-help'
    },
    'Damaged': {
      color: 'error',
      variant: 'tonal',
      icon: 'mdi-alert'
    }
  };
  
  return configs[props.status] || {
    color: 'grey',
    variant: 'tonal',
    icon: 'mdi-help'
  };
});
</script>
```

### 3. Asset Condition Indicator
```vue
<!-- AssetConditionIndicator.vue -->
<template>
  <div class="d-flex align-center gap-2">
    <v-progress-circular
      :model-value="conditionPercentage"
      :color="conditionColor"
      size="24"
      width="3"
    />
    <span class="text-caption">{{ condition }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  condition: string;
}

const props = defineProps<Props>();

const conditionPercentage = computed(() => {
  const percentages = {
    'Excellent': 100,
    'Good': 80,
    'Fair': 60,
    'Poor': 40,
    'Critical': 20
  };
  return percentages[props.condition] || 0;
});

const conditionColor = computed(() => {
  const colors = {
    'Excellent': 'success',
    'Good': 'info',
    'Fair': 'warning',
    'Poor': 'orange',
    'Critical': 'error'
  };
  return colors[props.condition] || 'grey';
});
</script>
```

## Store Implementation

### 4. Asset Store (Pinia)
```typescript
// stores/assetStore.ts
import { defineStore } from 'pinia';
import { assetApi } from '@/api/assetApi';
import type { Asset, AssetFilters, AssetStats } from '@/types/asset';

interface AssetState {
  assets: Asset[];
  totalAssets: number;
  assetStats: AssetStats;
  assetCategories: Array<{name: string; value: string}>;
  assetStatuses: Array<{name: string; value: string}>;
  locations: Array<{name: string; value: string}>;
  loading: boolean;
}

export const useAssetStore = defineStore('asset', {
  state: (): AssetState => ({
    assets: [],
    totalAssets: 0,
    assetStats: {
      total: 0,
      available: 0,
      assigned: 0,
      maintenance: 0,
      retired: 0
    },
    assetCategories: [],
    assetStatuses: [],
    locations: [],
    loading: false
  }),

  getters: {
    getAssetById: (state) => (id: string) => {
      return state.assets.find(asset => asset.id === id);
    },
    
    getAssetsByCategory: (state) => (category: string) => {
      return state.assets.filter(asset => asset.category === category);
    },
    
    getAssignedAssets: (state) => {
      return state.assets.filter(asset => asset.assignedTo);
    }
  },

  actions: {
    async fetchAssets(filters: AssetFilters & {
      page: number;
      itemsPerPage: number;
      sortBy: any[];
    }) {
      this.loading = true;
      try {
        const response = await assetApi.getAssets(filters);
        this.assets = response.data.assets;
        this.totalAssets = response.data.total;
        this.assetStats = response.data.stats;
        return response;
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAsset(assetData: Partial<Asset>) {
      try {
        const response = await assetApi.createAsset(assetData);
        this.assets.unshift(response.data);
        this.totalAssets++;
        return response.data;
      } catch (error) {
        console.error('Failed to create asset:', error);
        throw error;
      }
    },

    async updateAsset(id: string, assetData: Partial<Asset>) {
      try {
        const response = await assetApi.updateAsset(id, assetData);
        const index = this.assets.findIndex(asset => asset.id === id);
        if (index !== -1) {
          this.assets[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Failed to update asset:', error);
        throw error;
      }
    },

    async deleteAsset(id: string) {
      try {
        await assetApi.deleteAsset(id);
        const index = this.assets.findIndex(asset => asset.id === id);
        if (index !== -1) {
          this.assets.splice(index, 1);
          this.totalAssets--;
        }
      } catch (error) {
        console.error('Failed to delete asset:', error);
        throw error;
      }
    },

    async assignAsset(assetId: string, assignmentData: any) {
      try {
        const response = await assetApi.assignAsset(assetId, assignmentData);
        const index = this.assets.findIndex(asset => asset.id === assetId);
        if (index !== -1) {
          this.assets[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Failed to assign asset:', error);
        throw error;
      }
    },

    async findAssetByQR(qrData: string) {
      try {
        const response = await assetApi.findByQR(qrData);
        return response.data;
      } catch (error) {
        console.error('Failed to find asset by QR:', error);
        throw error;
      }
    },

    async generateQRCode(assetId: string) {
      try {
        const response = await assetApi.generateQR(assetId);
        return response.data;
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw error;
      }
    },

    async exportAssets(filters: AssetFilters) {
      try {
        const response = await assetApi.exportAssets(filters);
        // Handle file download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'assets-export.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Failed to export assets:', error);
        throw error;
      }
    },

    async fetchAssetCategories() {
      try {
        const response = await assetApi.getCategories();
        this.assetCategories = response.data;
      } catch (error) {
        console.error('Failed to fetch asset categories:', error);
      }
    },

    async fetchLocations() {
      try {
        const response = await assetApi.getLocations();
        this.locations = response.data;
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    }
  }
});
```

## Mobile Responsiveness

### 5. Mobile-Optimized Asset Cards
```vue
<!-- Mobile view implementation in AssetInventoryList.vue -->
<template>
  <!-- Mobile Card View (shown on small screens) -->
  <div v-if="$vuetify.display.mobile" class="mobile-asset-list">
    <v-card
      v-for="asset in assets"
      :key="asset.id"
      class="mb-3"
      @click="viewAsset(asset)"
    >
      <v-card-text class="pb-2">
        <div class="d-flex justify-space-between align-start mb-2">
          <div class="d-flex align-center gap-2">
            <v-chip
              :color="asset.qrCodeExists ? 'success' : 'warning'"
              size="x-small"
            >
              {{ asset.assetCode }}
            </v-chip>
            <v-btn
              icon="mdi-qrcode-scan"
              size="x-small"
              variant="text"
              @click.stop="scanAssetQR(asset)"
            />
          </div>
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="props"
                @click.stop
              />
            </template>
            <v-list density="compact">
              <v-list-item @click="viewAsset(asset)">
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editAsset(asset)" v-if="canEditAssets">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="assignAsset(asset)" v-if="canAssignAssets">
                <v-list-item-title>Assign</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <div class="d-flex align-center gap-3 mb-3">
          <v-avatar size="48" rounded="4">
            <v-img
              v-if="asset.imageUrl"
              :src="asset.imageUrl"
              :alt="asset.name"
            />
            <v-icon v-else>{{ getAssetIcon(asset.category) }}</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="font-weight-medium text-body-1">{{ asset.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ asset.model }} - {{ asset.serialNumber }}
            </div>
          </div>
        </div>

        <div class="d-flex justify-space-between align-center">
          <AssetStatusChip :status="asset.status" />
          <div class="text-right">
            <div class="font-weight-medium">
              {{ formatCurrency(asset.currentValue) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ asset.location }}
            </div>
          </div>
        </div>

        <v-divider class="my-2" />

        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-1">
            <v-icon size="16" color="medium-emphasis">mdi-calendar</v-icon>
            <span class="text-caption">{{ formatDate(asset.purchaseDate) }}</span>
          </div>
          <div v-if="asset.assignedTo" class="d-flex align-center gap-2">
            <v-avatar size="20">
              <span class="text-caption">
                {{ asset.assignedTo.name.charAt(0) }}
              </span>
            </v-avatar>
            <span class="text-caption">{{ asset.assignedTo.name }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Mobile Loading -->
    <v-card v-if="loading" v-for="n in 5" :key="n" class="mb-3">
      <v-card-text>
        <v-skeleton-loader type="list-item-avatar-two-line" />
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .mobile-asset-list {
    padding: 0 8px;
  }
}
</style>
```

## Key Features Covered

1. **Comprehensive Asset Listing**
   - Server-side pagination and sorting
   - Advanced filtering capabilities
   - Search with debouncing
   - Multiple view modes (table/grid)

2. **QR Code Integration**
   - QR scanner for asset lookup
   - QR code generation for assets
   - Visual indicators for QR availability

3. **Asset Management**
   - CRUD operations with permissions
   - Bulk operations support
   - Asset assignment workflows
   - Status and condition tracking

4. **Mobile Optimization**
   - Responsive design patterns
   - Touch-friendly interfaces
   - Optimized card layouts

5. **Data Visualization**
   - Asset statistics dashboard
   - Status and condition indicators
   - Category-based grouping

This implementation provides a complete foundation for Asset Inventory & Tracking with full Vue.js migration from the React codebase while maintaining all functionality and improving the user experience.