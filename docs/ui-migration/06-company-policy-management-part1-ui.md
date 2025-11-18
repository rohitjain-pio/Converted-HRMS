# Company Policy Management Part 1: Document Creation & Management - UI Migration Guide

## Overview
This document provides comprehensive migration guidance for the Company Policy Management Part 1 module from React to Vue.js, focusing on document creation, management, categorization, and basic policy administration workflows.

## React Component Analysis

### Current React Implementation
```typescript
// React: CompanyPolicy/index.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from '@mui/x-data-grid';
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";

interface CompanyPolicyType {
  id: string;
  name: string;
  versionNo: number;
  documentCategory: string;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
  status: string;
  fileName?: string;
  fileOriginalName?: string;
  description?: string;
}

const CompanyPolicy = () => {
  const [data, setData] = useState<CompanyPolicyType[]>([]);
  const [sortColumnName, setSortColumnName] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<string>("");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [name, setName] = useState<string | undefined>("");
  const [documentCategoryId, setDocumentCategoryId] = useState(0);
  const [statusId, setStatusId] = useState(CompanyPolicyStatus.Active);

  const headerCells = [
    {
      label: "S.No",
      renderColumn: (_row: CompanyPolicyType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    {
      label: "Document Name",
      accessor: "name",
      enableSorting: true,
      renderColumn: (row: CompanyPolicyType) =>
        hasPermission(VIEW) ? (
          <RouterMaterialLink to={`/company-policy/view/${row.id}`}>
            <TruncatedText text={row.name} maxLength={20} />
          </RouterMaterialLink>
        ) : (
          <TruncatedText text={row.name} maxLength={20} />
        ),
    },
    { label: "Version", accessor: "versionNo" },
    { label: "Category", accessor: "documentCategory" },
    { label: "Created By", accessor: "createdBy" },
    { label: "Created On", accessor: "createdOn", enableSorting: true },
    { label: "Updated By", accessor: "modifiedBy" },
    { label: "Updated On", accessor: "modifiedOn", enableSorting: true },
    { label: "Status", accessor: "status" }
  ];

  return (
    <Paper elevation={3}>
      <PageHeader
        title="Company Policy"
        actionButton={
          <FilterForm
            onSearch={handleSearch}
            addIcon={
              hasPermission(CREATE) && (
                <RoundActionIconButton
                  onClick={() => navigate("/company-policy/add")}
                  label="Add Document"
                  icon={<AddIcon />}
                />
              )
            }
          />
        }
      />
      <DataTable
        data={data}
        headerCells={headerCells}
        setSortColumnName={setSortColumnName}
        setSortDirection={setSortDirection}
        setStartIndex={setStartIndex}
        pageSize={pageSize}
        totalRecords={totalRecords}
      />
    </Paper>
  );
};
```

### Policy Form Component Analysis
```typescript
// React: CompanyPolicyForm.tsx
import { FormProvider, Controller } from "react-hook-form";
import { Grid, Paper, Box, Checkbox, FormControlLabel } from "@mui/material";

const PolicyDocumentForm = ({
  id, method, isLoading, isSaving, 
  companyPolicyData, onSubmitIntercept
}) => {
  return (
    <Paper>
      <PageHeader title={`${id ? "Edit" : "Add"} Policy Documents`} goBack />
      <FormProvider {...method}>
        <form onSubmit={handleSubmit(onSubmitIntercept)}>
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              <FormTextField name="name" label="Name" required />
            </Grid>
            <Grid item sm={6} xs={12}>
              <CategorySelect required={true} />
            </Grid>
          </Grid>
          
          <StatusSelect required={true} />
          
          <FormTextField
            name="description"
            label="Description"
            multiline
            maxLength={600}
            rows={5}
            required
          />
          
          <Controller
            name="accessibility"
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Accessibility"
              />
            )}
          />
          
          <Controller
            name="emailRequest"
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} />}
                label="Notify via Email"
              />
            )}
          />
          
          <FileUpload />
          {id && <ViewDocument companyPolicyId={id} />}
        </form>
      </FormProvider>
    </Paper>
  );
};
```

### Filter Form Component
```typescript
// React: FilterForm.tsx
const FilterForm = ({ onSearch, addIcon }) => {
  const method = useForm({
    defaultValues: {
      name: "",
      documentCategoryId: "",
      statusId: userData.roleName !== role.EMPLOYEE 
        ? "" 
        : String(CompanyPolicyStatus.Active)
    }
  });

  return (
    <FormProvider {...method}>
      <form onSubmit={method.handleSubmit(handleSubmit)}>
        <Grid container sx={{ gap: 2 }}>
          <Grid item xs={12} md="auto">
            <FormTextField name="name" label="Document Name" />
          </Grid>
          <Grid item xs={12} md="auto">
            <CategorySelect required={false} />
          </Grid>
          {userData.roleName !== role.EMPLOYEE && (
            <Grid item xs={12} md="auto">
              <StatusSelect required={false} />
            </Grid>
          )}
          <Grid item xs={12} md="auto">
            <RoundActionIconButton
              label="Search"
              type="submit"
              icon={<SearchIcon />}
            />
            <ResetButton onClick={handleReset} />
            {addIcon}
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};
```

## Vue.js Migration Implementation

### 1. Main Policy Management Component
```vue
<!-- Vue: PolicyManagement.vue -->
<template>
  <div class="policy-management">
    <!-- Header Section -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center pa-6">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-file-document-multiple</v-icon>
          <span class="text-h4">Company Policy Management</span>
        </div>
        
        <!-- Action Buttons -->
        <div class="d-flex gap-2">
          <v-btn
            v-if="hasPermission('CREATE')"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            @click="navigateToAdd"
          >
            Add Policy
          </v-btn>
          
          <v-btn
            variant="outlined"
            prepend-icon="mdi-export"
            @click="exportPolicies"
          >
            Export
          </v-btn>
        </div>
      </v-card-title>

      <!-- Filter Section -->
      <v-card-text class="pt-0">
        <PolicyFilterForm
          v-model:filters="filters"
          @search="handleSearch"
          @reset="handleReset"
        />
      </v-card-text>
    </v-card>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="48" color="primary" class="mb-2">
              mdi-file-document
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.totalPolicies }}</div>
            <div class="text-body-2 text-medium-emphasis">Total Policies</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="48" color="success" class="mb-2">
              mdi-check-circle
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.activePolicies }}</div>
            <div class="text-body-2 text-medium-emphasis">Active Policies</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="48" color="warning" class="mb-2">
              mdi-clock-outline
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.draftPolicies }}</div>
            <div class="text-body-2 text-medium-emphasis">Draft Policies</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="48" color="info" class="mb-2">
              mdi-folder-multiple
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.categories }}</div>
            <div class="text-body-2 text-medium-emphasis">Categories</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Policies Data Table -->
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2">mdi-table</v-icon>
        Policy Documents
        <v-spacer />
        
        <!-- View Toggle -->
        <v-btn-toggle v-model="viewMode" variant="outlined" divided>
          <v-btn value="table" size="small">
            <v-icon>mdi-table</v-icon>
          </v-btn>
          <v-btn value="grid" size="small">
            <v-icon>mdi-grid</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-card-title>

      <!-- Table View -->
      <v-data-table-server
        v-if="viewMode === 'table'"
        :headers="headers"
        :items="policies"
        :items-length="totalRecords"
        :loading="loading"
        :items-per-page="pageSize"
        :page="currentPage"
        :sort-by="sortBy"
        class="elevation-0"
        item-value="id"
        show-select
        @update:options="handleTableOptions"
      >
        <!-- Custom Column Renderers -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-icon class="mr-2" size="small">
              {{ getPolicyIcon(item.documentCategory) }}
            </v-icon>
            <div>
              <router-link
                v-if="hasPermission('VIEW')"
                :to="`/company-policy/view/${item.id}`"
                class="text-decoration-none"
              >
                <v-tooltip>
                  <template #activator="{ props }">
                    <span v-bind="props" class="text-primary font-weight-medium">
                      {{ truncateText(item.name, 30) }}
                    </span>
                  </template>
                  {{ item.name }}
                </v-tooltip>
              </router-link>
              <span v-else class="text-body-2">
                {{ truncateText(item.name, 30) }}
              </span>
              <div class="text-caption text-medium-emphasis">
                Version {{ item.versionNo }}
              </div>
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            :prepend-icon="getStatusIcon(item.status)"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.documentCategory="{ item }">
          <v-chip
            color="info"
            variant="outlined"
            size="small"
            prepend-icon="mdi-folder-outline"
          >
            {{ item.documentCategory }}
          </v-chip>
        </template>

        <template #item.createdOn="{ item }">
          <div class="text-body-2">
            {{ formatDate(item.createdOn) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            by {{ item.createdBy }}
          </div>
        </template>

        <template #item.modifiedOn="{ item }">
          <div class="text-body-2">
            {{ item.modifiedOn ? formatDate(item.modifiedOn) : 'N/A' }}
          </div>
          <div v-if="item.modifiedOn" class="text-caption text-medium-emphasis">
            by {{ item.modifiedBy }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              v-if="hasPermission('VIEW')"
              icon
              variant="text"
              size="small"
              @click="viewPolicy(item.id)"
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent">View Policy</v-tooltip>
            </v-btn>
            
            <v-btn
              v-if="hasPermission('EDIT')"
              icon
              variant="text"
              size="small"
              color="primary"
              @click="editPolicy(item.id)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent">Edit Policy</v-tooltip>
            </v-btn>
            
            <v-btn
              v-if="hasPermission('DELETE') && item.status === 'Draft'"
              icon
              variant="text"
              size="small"
              color="error"
              @click="deletePolicy(item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent">Delete Policy</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>

      <!-- Grid View -->
      <div v-else class="pa-4">
        <v-row>
          <v-col
            v-for="policy in policies"
            :key="policy.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <PolicyCard
              :policy="policy"
              @view="viewPolicy"
              @edit="editPolicy"
              @delete="deletePolicy"
            />
          </v-col>
        </v-row>

        <!-- Pagination for Grid View -->
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :length="totalPages"
          class="mt-4"
        />
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirm Delete
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete the policy "{{ deleteDialog.policy?.name }}"?
          This action cannot be undone.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog.show = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePolicyStore } from '@/stores/policyStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import PolicyFilterForm from './components/PolicyFilterForm.vue'
import PolicyCard from './components/PolicyCard.vue'

// Props & Emits
interface PolicyData {
  id: string
  name: string
  versionNo: number
  documentCategory: string
  createdBy: string
  createdOn: string
  modifiedBy: string
  modifiedOn: string
  status: 'Draft' | 'Active' | 'Inactive'
  fileName?: string
  fileOriginalName?: string
  description?: string
}

// State
const router = useRouter()
const policyStore = usePolicyStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const deleting = ref(false)
const viewMode = ref<'table' | 'grid'>('table')
const currentPage = ref(1)
const pageSize = ref(10)
const sortBy = ref([{ key: 'createdOn', order: 'desc' }])

const filters = ref({
  name: '',
  documentCategoryId: '',
  statusId: authStore.userRole === 'EMPLOYEE' ? 'Active' : ''
})

const deleteDialog = ref({
  show: false,
  policy: null as PolicyData | null
})

// Computed
const policies = computed(() => policyStore.policies)
const totalRecords = computed(() => policyStore.totalRecords)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const stats = computed(() => ({
  totalPolicies: policyStore.stats.total,
  activePolicies: policyStore.stats.active,
  draftPolicies: policyStore.stats.draft,
  categories: policyStore.stats.categories
}))

// Table Headers
const headers = computed(() => [
  {
    title: 'Document Name',
    key: 'name',
    sortable: true,
    width: '250px'
  },
  {
    title: 'Category',
    key: 'documentCategory',
    sortable: true,
    width: '150px'
  },
  {
    title: 'Status',
    key: 'status',
    sortable: true,
    width: '120px'
  },
  {
    title: 'Created',
    key: 'createdOn',
    sortable: true,
    width: '180px'
  },
  {
    title: 'Modified',
    key: 'modifiedOn',
    sortable: true,
    width: '180px'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: '120px'
  }
])

// Methods
const hasPermission = (permission: string): boolean => {
  return authStore.hasPermission(`CompanyPolicy.${permission}`)
}

const handleTableOptions = async (options: any) => {
  currentPage.value = options.page
  pageSize.value = options.itemsPerPage
  if (options.sortBy.length > 0) {
    sortBy.value = options.sortBy
  }
  await loadPolicies()
}

const handleSearch = async (searchFilters: any) => {
  filters.value = { ...searchFilters }
  currentPage.value = 1
  await loadPolicies()
}

const handleReset = async () => {
  filters.value = {
    name: '',
    documentCategoryId: '',
    statusId: authStore.userRole === 'EMPLOYEE' ? 'Active' : ''
  }
  currentPage.value = 1
  await loadPolicies()
}

const loadPolicies = async () => {
  try {
    loading.value = true
    await policyStore.fetchPolicies({
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      filters: filters.value
    })
  } catch (error) {
    notificationStore.showError('Failed to load policies')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    await policyStore.fetchStats()
  } catch (error) {
    console.error('Failed to load policy stats:', error)
  }
}

const navigateToAdd = () => {
  router.push('/company-policy/add')
}

const viewPolicy = (id: string) => {
  router.push(`/company-policy/view/${id}`)
}

const editPolicy = (id: string) => {
  router.push(`/company-policy/edit/${id}`)
}

const deletePolicy = (policy: PolicyData) => {
  deleteDialog.value = {
    show: true,
    policy
  }
}

const confirmDelete = async () => {
  if (!deleteDialog.value.policy) return
  
  try {
    deleting.value = true
    await policyStore.deletePolicy(deleteDialog.value.policy.id)
    notificationStore.showSuccess('Policy deleted successfully')
    deleteDialog.value.show = false
    await loadPolicies()
  } catch (error) {
    notificationStore.showError('Failed to delete policy')
  } finally {
    deleting.value = false
  }
}

const exportPolicies = async () => {
  try {
    await policyStore.exportPolicies(filters.value)
    notificationStore.showSuccess('Export completed successfully')
  } catch (error) {
    notificationStore.showError('Failed to export policies')
  }
}

// Utility Functions
const getPolicyIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'HR Policy': 'mdi-account-group',
    'IT Policy': 'mdi-laptop',
    'Security Policy': 'mdi-shield-check',
    'Financial Policy': 'mdi-currency-usd',
    'General Policy': 'mdi-file-document'
  }
  return iconMap[category] || 'mdi-file-document'
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'Active': 'success',
    'Draft': 'warning',
    'Inactive': 'error'
  }
  return colorMap[status] || 'default'
}

const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    'Active': 'mdi-check-circle',
    'Draft': 'mdi-clock-outline',
    'Inactive': 'mdi-pause-circle'
  }
  return iconMap[status] || 'mdi-circle'
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadPolicies(),
    loadStats()
  ])
})

// Watch for filter changes
watch(
  [currentPage, pageSize],
  () => {
    loadPolicies()
  }
)
</script>

<style scoped>
.policy-management {
  padding: 24px;
}

.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
```

### 2. Policy Filter Form Component
```vue
<!-- Vue: PolicyFilterForm.vue -->
<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row align="center" class="mb-2">
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model="localFilters.name"
          label="Document Name"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="localFilters.documentCategoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Category"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-folder-outline"
          clearable
          hide-details
        />
      </v-col>
      
      <v-col 
        v-if="!isEmployee"
        cols="12" 
        sm="6" 
        md="2"
      >
        <v-select
          v-model="localFilters.statusId"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          label="Status"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-information-outline"
          clearable
          hide-details
        />
      </v-col>
      
      <v-col cols="12" sm="6" md="auto">
        <div class="d-flex gap-2">
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-magnify"
          >
            Search
          </v-btn>
          
          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="handleReset"
          >
            Reset
          </v-btn>
          
          <slot name="actions" />
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePolicyStore } from '@/stores/policyStore'
import { useAuthStore } from '@/stores/authStore'

// Props & Emits
const props = defineProps<{
  filters: {
    name: string
    documentCategoryId: string
    statusId: string
  }
}>()

const emit = defineEmits<{
  'update:filters': [filters: typeof props.filters]
  'search': [filters: typeof props.filters]
  'reset': []
}>()

// State
const policyStore = usePolicyStore()
const authStore = useAuthStore()

const localFilters = ref({ ...props.filters })

// Computed
const isEmployee = computed(() => authStore.userRole === 'EMPLOYEE')

const categories = computed(() => [
  { id: '', name: 'All Categories' },
  ...policyStore.categories
])

const statusOptions = computed(() => [
  { value: '', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Inactive', label: 'Inactive' }
])

// Methods
const handleSubmit = () => {
  emit('update:filters', { ...localFilters.value })
  emit('search', { ...localFilters.value })
}

const handleReset = () => {
  localFilters.value = {
    name: '',
    documentCategoryId: '',
    statusId: isEmployee.value ? 'Active' : ''
  }
  emit('update:filters', { ...localFilters.value })
  emit('reset')
}

// Lifecycle
onMounted(async () => {
  await policyStore.fetchCategories()
})

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>
```

## Pinia Store Implementation

### Policy Store
```typescript
// stores/policyStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as policyAPI from '@/services/policyAPI'

export interface PolicyData {
  id: string
  name: string
  versionNo: number
  documentCategory: string
  documentCategoryId: string
  createdBy: string
  createdOn: string
  modifiedBy: string
  modifiedOn: string
  status: 'Draft' | 'Active' | 'Inactive'
  fileName?: string
  fileOriginalName?: string
  description?: string
  accessibility?: boolean
}

export interface PolicyFilters {
  name?: string
  documentCategoryId?: string
  statusId?: string
}

export interface PolicyCategory {
  id: string
  name: string
  description?: string
}

export const usePolicyStore = defineStore('policy', () => {
  // State
  const policies = ref<PolicyData[]>([])
  const categories = ref<PolicyCategory[]>([])
  const totalRecords = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const stats = ref({
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
    categories: 0
  })

  // Computed
  const activePolicies = computed(() => 
    policies.value.filter(p => p.status === 'Active')
  )
  
  const draftPolicies = computed(() => 
    policies.value.filter(p => p.status === 'Draft')
  )

  // Actions
  const fetchPolicies = async (params: {
    page: number
    pageSize: number
    sortBy?: Array<{ key: string; order: string }>
    filters?: PolicyFilters
  }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await policyAPI.getPolicies({
        startIndex: (params.page - 1) * params.pageSize + 1,
        pageSize: params.pageSize,
        sortColumnName: params.sortBy?.[0]?.key || '',
        sortDirection: params.sortBy?.[0]?.order || '',
        filters: params.filters || {}
      })
      
      policies.value = response.data.companyPolicyList || []
      totalRecords.value = response.data.totalRecords || 0
      
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch policies'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await policyAPI.getCategories()
      categories.value = response.data || []
    } catch (err: any) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await policyAPI.getPolicyStats()
      stats.value = response.data || {
        total: 0,
        active: 0,
        draft: 0,
        inactive: 0,
        categories: 0
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const createPolicy = async (policyData: Omit<PolicyData, 'id' | 'createdOn' | 'createdBy'>) => {
    try {
      loading.value = true
      const response = await policyAPI.createPolicy(policyData)
      
      // Refresh the policy list
      await fetchPolicies({ page: 1, pageSize: 10 })
      await fetchStats()
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to create policy'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePolicy = async (id: string, policyData: Partial<PolicyData>) => {
    try {
      loading.value = true
      const response = await policyAPI.updatePolicy(id, policyData)
      
      // Update local state
      const index = policies.value.findIndex(p => p.id === id)
      if (index !== -1) {
        policies.value[index] = { ...policies.value[index], ...policyData }
      }
      
      await fetchStats()
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update policy'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePolicy = async (id: string) => {
    try {
      loading.value = true
      await policyAPI.deletePolicy(id)
      
      // Remove from local state
      policies.value = policies.value.filter(p => p.id !== id)
      totalRecords.value -= 1
      
      await fetchStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to delete policy'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPolicyById = async (id: string): Promise<PolicyData> => {
    try {
      const response = await policyAPI.getPolicyById(id)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch policy'
      throw err
    }
  }

  const exportPolicies = async (filters?: PolicyFilters) => {
    try {
      const response = await policyAPI.exportPolicies(filters)
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `policies_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
    } catch (err: any) {
      error.value = err.message || 'Failed to export policies'
      throw err
    }
  }

  // Reset state
  const resetState = () => {
    policies.value = []
    categories.value = []
    totalRecords.value = 0
    loading.value = false
    error.value = null
    stats.value = {
      total: 0,
      active: 0,
      draft: 0,
      inactive: 0,
      categories: 0
    }
  }

  return {
    // State
    policies,
    categories,
    totalRecords,
    loading,
    error,
    stats,
    
    // Computed
    activePolicies,
    draftPolicies,
    
    // Actions
    fetchPolicies,
    fetchCategories,
    fetchStats,
    createPolicy,
    updatePolicy,
    deletePolicy,
    getPolicyById,
    exportPolicies,
    resetState
  }
})
```

This concludes Part 1 of the Company Policy Management UI migration documentation. The implementation provides comprehensive policy document management with filtering, categorization, permissions-based access, and both table and grid view modes, all built with Vue.js 3 and Vuetify components while preserving the original React functionality.

## Key Migration Benefits

1. **Enhanced UI/UX**: Modern Vuetify components with Material Design 3
2. **Better State Management**: Reactive Pinia stores with TypeScript
3. **Improved Performance**: Vue 3 Composition API with efficient reactivity
4. **Mobile Optimization**: Responsive design with touch-friendly interfaces
5. **Type Safety**: Full TypeScript integration throughout the application
6. **Accessibility**: WCAG compliant components and proper ARIA labels