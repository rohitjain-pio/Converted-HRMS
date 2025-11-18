# Asset Management Part 2: Asset Assignment & Transfer - UI Migration Guide

## Overview
This document provides comprehensive migration guidance for the Asset Assignment & Transfer module from React to Vue.js, focusing on asset assignment workflows, transfer processes, employee assignment interfaces, and approval workflows.

## React Component Analysis

### Current React Implementation
```typescript
// React: AssetAssignment/AssetAssignmentDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import {
  DatePicker,
  TimePicker
} from '@mui/x-date-pickers';
import {
  Person,
  Assignment,
  CheckCircle,
  Error
} from '@mui/icons-material';

interface AssetAssignmentProps {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
  onAssign: (assignmentData: AssignmentData) => void;
  employees: Employee[];
}

const AssetAssignmentDialog: React.FC<AssetAssignmentProps> = ({
  open,
  asset,
  onClose,
  onAssign,
  employees
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [assignmentData, setAssignmentData] = useState({
    employeeId: '',
    assignmentDate: new Date(),
    assignmentTime: null,
    purpose: '',
    notes: '',
    returnDate: null,
    condition: 'Good',
    accessories: [],
    requiresApproval: false,
    approverIds: []
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const steps = [
    'Select Employee',
    'Assignment Details',
    'Accessories & Condition',
    'Approval & Review'
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0:
        if (!selectedEmployee) {
          newErrors.employee = 'Please select an employee';
        }
        break;
      case 1:
        if (!assignmentData.purpose) {
          newErrors.purpose = 'Purpose is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Employee for Asset Assignment
            </Typography>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.name} - ${option.department}`}
              value={selectedEmployee}
              onChange={(_, newValue) => {
                setSelectedEmployee(newValue);
                setAssignmentData(prev => ({
                  ...prev,
                  employeeId: newValue?.id || ''
                }));
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar src={option.avatar} sx={{ mr: 2 }}>
                    {option.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.department} - {option.designation}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Employees"
                  error={!!errors.employee}
                  helperText={errors.employee}
                />
              )}
            />
            
            {selectedEmployee && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Employee Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Employee ID:</strong> {selectedEmployee.employeeId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Department:</strong> {selectedEmployee.department}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Manager:</strong> {selectedEmployee.manager}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Current Assets:</strong> {selectedEmployee.assignedAssets?.length || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assignment Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Assignment Date"
                  value={assignmentData.assignmentDate}
                  onChange={(date) => setAssignmentData(prev => ({
                    ...prev,
                    assignmentDate: date
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Assignment Time"
                  value={assignmentData.assignmentTime}
                  onChange={(time) => setAssignmentData(prev => ({
                    ...prev,
                    assignmentTime: time
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Purpose of Assignment"
                  value={assignmentData.purpose}
                  onChange={(e) => setAssignmentData(prev => ({
                    ...prev,
                    purpose: e.target.value
                  }))}
                  error={!!errors.purpose}
                  helperText={errors.purpose}
                  multiline
                  rows={2}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Additional Notes"
                  value={assignmentData.notes}
                  onChange={(e) => setAssignmentData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Expected Return Date (Optional)"
                  value={assignmentData.returnDate}
                  onChange={(date) => setAssignmentData(prev => ({
                    ...prev,
                    returnDate: date
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </Box>
        );

      // Additional cases for steps 2 and 3...
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        Assign Asset: {asset?.name}
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3, minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={loading}
        >
          {activeStep === steps.length - 1 ? 'Assign Asset' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Vue.js Implementation

### 1. Asset Assignment Dialog Component
```vue
<template>
  <v-dialog
    v-model="dialog"
    max-width="900px"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <h3>Assign Asset</h3>
          <div class="text-subtitle-2 text-medium-emphasis">
            {{ asset?.name }} ({{ asset?.assetCode }})
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- Stepper -->
        <v-stepper
          v-model="currentStep"
          :items="stepperItems"
          hide-actions
          class="elevation-0"
        >
          <template #item.1>
            <v-card flat>
              <v-card-title>Select Employee</v-card-title>
              <v-card-text>
                <EmployeeSelectionStep
                  v-model:selected-employee="assignmentData.employee"
                  :employees="employees"
                  :loading="employeeLoading"
                  @search="searchEmployees"
                />
                
                <EmployeeDetailsCard
                  v-if="assignmentData.employee"
                  :employee="assignmentData.employee"
                  class="mt-4"
                />
              </v-card-text>
            </v-card>
          </template>

          <template #item.2>
            <v-card flat>
              <v-card-title>Assignment Details</v-card-title>
              <v-card-text>
                <AssignmentDetailsForm
                  v-model="assignmentData"
                  :errors="validationErrors"
                />
              </v-card-text>
            </v-card>
          </template>

          <template #item.3>
            <v-card flat>
              <v-card-title>Asset Condition & Accessories</v-card-title>
              <v-card-text>
                <AssetConditionForm
                  v-model="assignmentData"
                  :asset="asset"
                />
              </v-card-text>
            </v-card>
          </template>

          <template #item.4>
            <v-card flat>
              <v-card-title>Approval & Review</v-card-title>
              <v-card-text>
                <ApprovalWorkflowForm
                  v-model="assignmentData"
                  :require-approval="requiresApproval"
                  :approvers="availableApprovers"
                />
                
                <AssignmentSummary
                  :assignment-data="assignmentData"
                  :asset="asset"
                  class="mt-4"
                />
              </v-card-text>
            </v-card>
          </template>
        </v-stepper>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        
        <v-btn
          variant="outlined"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        
        <v-btn
          v-if="currentStep > 1"
          variant="outlined"
          @click="previousStep"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Back
        </v-btn>
        
        <v-btn
          v-if="currentStep < 4"
          color="primary"
          @click="nextStep"
          :disabled="!canProceedToNext"
        >
          Next
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        
        <v-btn
          v-else
          color="success"
          @click="submitAssignment"
          :loading="submitting"
        >
          <v-icon start>mdi-check</v-icon>
          Assign Asset
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useAssetStore } from '@/stores/assetStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useToast } from '@/composables/useToast';
import { useDebounceFn } from '@vueuse/core';

// Import child components
import EmployeeSelectionStep from './EmployeeSelectionStep.vue';
import EmployeeDetailsCard from './EmployeeDetailsCard.vue';
import AssignmentDetailsForm from './AssignmentDetailsForm.vue';
import AssetConditionForm from './AssetConditionForm.vue';
import ApprovalWorkflowForm from './ApprovalWorkflowForm.vue';
import AssignmentSummary from './AssignmentSummary.vue';

// Props & Emits
interface Props {
  modelValue: boolean;
  asset: Asset | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'assign', assignmentData: AssetAssignmentData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Stores
const assetStore = useAssetStore();
const employeeStore = useEmployeeStore();
const { showSuccess, showError } = useToast();

// Reactive data
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const currentStep = ref(1);
const submitting = ref(false);
const employeeLoading = ref(false);

// Assignment form data
const assignmentData = ref<AssetAssignmentData>({
  employee: null,
  assignmentDate: new Date().toISOString().split('T')[0],
  assignmentTime: null,
  purpose: '',
  notes: '',
  expectedReturnDate: null,
  condition: 'Good',
  accessories: [],
  photos: [],
  requiresApproval: false,
  approvers: [],
  notifyEmployee: true,
  notifyManager: true
});

// Computed properties
const stepperItems = computed(() => [
  {
    title: 'Employee',
    subtitle: 'Select recipient',
    value: 1,
    icon: 'mdi-account-search'
  },
  {
    title: 'Details',
    subtitle: 'Assignment info',
    value: 2,
    icon: 'mdi-clipboard-text'
  },
  {
    title: 'Condition',
    subtitle: 'Asset status',
    value: 3,
    icon: 'mdi-shield-check'
  },
  {
    title: 'Review',
    subtitle: 'Approval & submit',
    value: 4,
    icon: 'mdi-check-circle'
  }
]);

const employees = computed(() => employeeStore.activeEmployees);
const availableApprovers = computed(() => employeeStore.managers);

const requiresApproval = computed(() => {
  if (!props.asset || !assignmentData.value.employee) return false;
  
  // Check if asset value exceeds approval threshold
  const highValueThreshold = 5000;
  const isHighValue = props.asset.currentValue > highValueThreshold;
  
  // Check if assignment is cross-department
  const isCrossDepartment = assignmentData.value.employee?.department !== props.asset.currentLocation?.department;
  
  return isHighValue || isCrossDepartment;
});

const validationErrors = ref<Record<string, string>>({});

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!assignmentData.value.employee;
    case 2:
      return !!assignmentData.value.purpose?.trim();
    case 3:
      return !!assignmentData.value.condition;
    case 4:
      return true;
    default:
      return false;
  }
});

// Methods
const searchEmployees = useDebounceFn(async (query: string) => {
  if (!query.trim()) return;
  
  employeeLoading.value = true;
  try {
    await employeeStore.searchEmployees({
      query,
      status: 'active',
      includeAvatar: true
    });
  } catch (error) {
    showError('Failed to search employees');
  } finally {
    employeeLoading.value = false;
  }
}, 300);

const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const validateCurrentStep = (): boolean => {
  const errors: Record<string, string> = {};
  
  switch (currentStep.value) {
    case 1:
      if (!assignmentData.value.employee) {
        errors.employee = 'Please select an employee';
      }
      break;
      
    case 2:
      if (!assignmentData.value.purpose?.trim()) {
        errors.purpose = 'Purpose is required';
      }
      if (!assignmentData.value.assignmentDate) {
        errors.assignmentDate = 'Assignment date is required';
      }
      break;
      
    case 3:
      if (!assignmentData.value.condition) {
        errors.condition = 'Asset condition must be specified';
      }
      break;
  }
  
  validationErrors.value = errors;
  
  if (Object.keys(errors).length > 0) {
    showError('Please fix the validation errors');
    return false;
  }
  
  return true;
};

const submitAssignment = async () => {
  if (!validateCurrentStep()) return;
  
  submitting.value = true;
  try {
    const submissionData = {
      assetId: props.asset!.id,
      employeeId: assignmentData.value.employee!.id,
      assignmentDate: assignmentData.value.assignmentDate,
      assignmentTime: assignmentData.value.assignmentTime,
      purpose: assignmentData.value.purpose,
      notes: assignmentData.value.notes,
      expectedReturnDate: assignmentData.value.expectedReturnDate,
      condition: assignmentData.value.condition,
      accessories: assignmentData.value.accessories,
      photos: assignmentData.value.photos,
      requiresApproval: requiresApproval.value,
      approvers: assignmentData.value.approvers,
      notifications: {
        notifyEmployee: assignmentData.value.notifyEmployee,
        notifyManager: assignmentData.value.notifyManager
      }
    };
    
    await assetStore.assignAsset(submissionData);
    
    showSuccess(
      requiresApproval.value 
        ? 'Asset assignment submitted for approval'
        : 'Asset assigned successfully'
    );
    
    emit('assign', submissionData);
    closeDialog();
  } catch (error) {
    showError('Failed to assign asset');
  } finally {
    submitting.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
};

const resetForm = () => {
  currentStep.value = 1;
  assignmentData.value = {
    employee: null,
    assignmentDate: new Date().toISOString().split('T')[0],
    assignmentTime: null,
    purpose: '',
    notes: '',
    expectedReturnDate: null,
    condition: 'Good',
    accessories: [],
    photos: [],
    requiresApproval: false,
    approvers: [],
    notifyEmployee: true,
    notifyManager: true
  };
  validationErrors.value = {};
};

// Watchers
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.asset) {
    // Load required data
    employeeStore.fetchActiveEmployees();
    employeeStore.fetchManagers();
    
    // Set approval requirement based on asset
    nextTick(() => {
      assignmentData.value.requiresApproval = requiresApproval.value;
    });
  } else if (!isOpen) {
    resetForm();
  }
});

watch(() => assignmentData.value.employee, (employee) => {
  if (employee && requiresApproval.value) {
    // Auto-select employee's manager as approver
    const manager = availableApprovers.value.find(
      approver => approver.id === employee.managerId
    );
    if (manager && !assignmentData.value.approvers.includes(manager)) {
      assignmentData.value.approvers.push(manager);
    }
  }
});
</script>
```

### 2. Employee Selection Step Component
```vue
<!-- EmployeeSelectionStep.vue -->
<template>
  <div class="employee-selection">
    <v-text-field
      v-model="searchQuery"
      label="Search Employees"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      clearable
      @update:model-value="$emit('search', $event)"
      class="mb-4"
    />

    <v-row>
      <v-col cols="12" md="8">
        <v-autocomplete
          v-model="selectedEmployee"
          :items="employees"
          item-title="name"
          item-value="id"
          label="Select Employee"
          variant="outlined"
          :loading="loading"
          return-object
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" class="employee-item">
              <template #prepend>
                <v-avatar>
                  <v-img
                    v-if="item.raw.avatar"
                    :src="item.raw.avatar"
                    :alt="item.raw.name"
                  />
                  <span v-else>{{ item.raw.name.charAt(0) }}</span>
                </v-avatar>
              </template>
              
              <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.raw.department }} - {{ item.raw.designation }}
              </v-list-item-subtitle>
              
              <template #append>
                <div class="text-right">
                  <v-chip size="small" :color="getEmployeeStatusColor(item.raw.status)">
                    {{ item.raw.status }}
                  </v-chip>
                  <div class="text-caption text-medium-emphasis">
                    ID: {{ item.raw.employeeId }}
                  </div>
                </div>
              </template>
            </v-list-item>
          </template>
          
          <template #no-data>
            <div class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-1">mdi-account-search</v-icon>
              <div class="text-h6 mt-2">No employees found</div>
              <div class="text-body-2 text-medium-emphasis">
                Try adjusting your search criteria
              </div>
            </div>
          </template>
        </v-autocomplete>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1">
            Quick Filters
          </v-card-title>
          <v-card-text class="pa-2">
            <v-chip-group
              v-model="selectedFilters"
              multiple
              column
            >
              <v-chip
                v-for="filter in quickFilters"
                :key="filter.value"
                :value="filter.value"
                size="small"
                filter
                variant="outlined"
              >
                {{ filter.label }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Assignments -->
    <v-card v-if="recentAssignments.length > 0" class="mt-4" variant="outlined">
      <v-card-title class="text-subtitle-1">
        Recently Assigned Employees
      </v-card-title>
      <v-card-text class="pa-2">
        <v-chip-group>
          <v-chip
            v-for="employee in recentAssignments"
            :key="employee.id"
            @click="selectedEmployee = employee"
            size="small"
            variant="tonal"
          >
            <v-avatar start>
              <v-img
                v-if="employee.avatar"
                :src="employee.avatar"
              />
              <span v-else>{{ employee.name.charAt(0) }}</span>
            </v-avatar>
            {{ employee.name }}
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Employee } from '@/types/employee';

interface Props {
  selectedEmployee: Employee | null;
  employees: Employee[];
  loading: boolean;
}

interface Emits {
  (e: 'update:selectedEmployee', employee: Employee | null): void;
  (e: 'search', query: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchQuery = ref('');
const selectedFilters = ref<string[]>([]);

const selectedEmployee = computed({
  get: () => props.selectedEmployee,
  set: (value) => emit('update:selectedEmployee', value)
});

const quickFilters = [
  { label: 'IT Department', value: 'dept_it' },
  { label: 'Sales', value: 'dept_sales' },
  { label: 'HR', value: 'dept_hr' },
  { label: 'Management', value: 'level_management' },
  { label: 'Remote Workers', value: 'remote' }
];

const recentAssignments = computed(() => {
  // Mock recent assignments - in real app, get from store
  return [];
});

const getEmployeeStatusColor = (status: string): string => {
  const colors = {
    'Active': 'success',
    'On Leave': 'warning',
    'Inactive': 'error'
  };
  return colors[status] || 'grey';
};

watch(() => selectedFilters.value, (filters) => {
  // Apply quick filters
  let query = searchQuery.value;
  
  if (filters.includes('dept_it')) {
    query += ' department:IT';
  }
  if (filters.includes('remote')) {
    query += ' remote:true';
  }
  
  emit('search', query);
});
</script>

<style scoped>
.employee-item :deep(.v-list-item__content) {
  flex-grow: 1;
}

.employee-selection {
  min-height: 400px;
}
</style>
```

### 3. Assignment Details Form
```vue
<!-- AssignmentDetailsForm.vue -->
<template>
  <v-form ref="formRef">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localData.assignmentDate"
          label="Assignment Date"
          type="date"
          variant="outlined"
          :error-messages="errors.assignmentDate"
          required
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localData.assignmentTime"
          label="Assignment Time"
          type="time"
          variant="outlined"
          hint="When the asset will be handed over"
        />
      </v-col>
      
      <v-col cols="12">
        <v-textarea
          v-model="localData.purpose"
          label="Purpose of Assignment"
          placeholder="Describe why this asset is being assigned..."
          variant="outlined"
          :error-messages="errors.purpose"
          rows="3"
          required
        />
      </v-col>
      
      <v-col cols="12">
        <v-textarea
          v-model="localData.notes"
          label="Additional Notes"
          placeholder="Any special instructions or conditions..."
          variant="outlined"
          rows="2"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localData.expectedReturnDate"
          label="Expected Return Date"
          type="date"
          variant="outlined"
          hint="When should this asset be returned?"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <v-select
          v-model="localData.priority"
          label="Assignment Priority"
          :items="priorityOptions"
          variant="outlined"
          hint="How urgent is this assignment?"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1">
            Notification Settings
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="localData.notifyEmployee"
                  label="Notify Employee"
                  color="primary"
                  hint="Send email notification to the assigned employee"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="localData.notifyManager"
                  label="Notify Manager"
                  color="primary"
                  hint="Send notification to employee's manager"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="localData.createCalendarEvent"
                  label="Create Calendar Event"
                  color="primary"
                  hint="Add assignment to employee's calendar"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="localData.sendReminder"
                  label="Send Return Reminder"
                  color="primary"
                  hint="Remind about return date if specified"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { AssetAssignmentData } from '@/types/asset';

interface Props {
  modelValue: AssetAssignmentData;
  errors: Record<string, string>;
}

interface Emits {
  (e: 'update:modelValue', value: AssetAssignmentData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();

const localData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const priorityOptions = [
  { title: 'Low', value: 'low' },
  { title: 'Normal', value: 'normal' },
  { title: 'High', value: 'high' },
  { title: 'Urgent', value: 'urgent' }
];

// Set default priority
watch(() => localData.value, (data) => {
  if (!data.priority) {
    localData.value = { ...data, priority: 'normal' };
  }
}, { immediate: true });
</script>
```

### 4. Asset Transfer Management
```vue
<!-- AssetTransferManager.vue -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2>Asset Transfers</h2>
          <v-btn
            color="primary"
            prepend-icon="mdi-swap-horizontal"
            @click="openTransferDialog"
          >
            New Transfer
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Transfer Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              label="Status"
              :items="transferStatuses"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.dateRange.start"
              label="From Date"
              type="date"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.dateRange.end"
              label="To Date"
              type="date"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Transfers Table -->
    <v-data-table-server
      :headers="transferHeaders"
      :items="transfers"
      :items-length="totalTransfers"
      :loading="loading"
      v-model:page="pagination.page"
      v-model:items-per-page="pagination.itemsPerPage"
      @update:options="loadTransfers"
    >
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

      <template #item.fromEmployee="{ item }">
        <EmployeeChip
          v-if="item.fromEmployee"
          :employee="item.fromEmployee"
        />
        <v-chip v-else size="small" variant="outlined">
          Available
        </v-chip>
      </template>

      <template #item.toEmployee="{ item }">
        <EmployeeChip
          v-if="item.toEmployee"
          :employee="item.toEmployee"
        />
        <v-chip v-else size="small" variant="outlined">
          Return to Pool
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <TransferStatusChip :status="item.status" />
      </template>

      <template #item.transferDate="{ item }">
        {{ formatDate(item.transferDate) }}
      </template>

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
            <v-list-item @click="viewTransfer(item)">
              <v-list-item-title>View Details</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="item.status === 'Pending'"
              @click="approveTransfer(item)"
            >
              <v-list-item-title>Approve</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="item.status === 'Pending'"
              @click="rejectTransfer(item)"
            >
              <v-list-item-title>Reject</v-list-item-title>
            </v-list-item>
            <v-list-item @click="cancelTransfer(item)">
              <v-list-item-title>Cancel</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table-server>

    <!-- Transfer Dialog -->
    <AssetTransferDialog
      v-model="transferDialog"
      @transfer="handleTransfer"
    />

    <!-- Transfer Details Dialog -->
    <TransferDetailsDialog
      v-model="detailsDialog"
      :transfer="selectedTransfer"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAssetStore } from '@/stores/assetStore';
import { useToast } from '@/composables/useToast';

// Import components
import AssetTransferDialog from './AssetTransferDialog.vue';
import TransferDetailsDialog from './TransferDetailsDialog.vue';
import EmployeeChip from '@/components/EmployeeChip.vue';
import TransferStatusChip from './TransferStatusChip.vue';

const assetStore = useAssetStore();
const { showSuccess, showError } = useToast();

// Reactive data
const transfers = computed(() => assetStore.transfers);
const totalTransfers = computed(() => assetStore.totalTransfers);
const loading = ref(false);

const transferDialog = ref(false);
const detailsDialog = ref(false);
const selectedTransfer = ref(null);

const filters = ref({
  status: '',
  dateRange: {
    start: '',
    end: ''
  },
  search: ''
});

const pagination = ref({
  page: 1,
  itemsPerPage: 25
});

// Table headers
const transferHeaders = [
  { title: 'Asset', key: 'asset', width: 200 },
  { title: 'From', key: 'fromEmployee', width: 150 },
  { title: 'To', key: 'toEmployee', width: 150 },
  { title: 'Transfer Date', key: 'transferDate', width: 130 },
  { title: 'Status', key: 'status', width: 120 },
  { title: 'Reason', key: 'reason', width: 200 },
  { title: 'Actions', key: 'actions', width: 100, sortable: false }
];

const transferStatuses = [
  { title: 'All', value: '' },
  { title: 'Pending', value: 'pending' },
  { title: 'Approved', value: 'approved' },
  { title: 'Completed', value: 'completed' },
  { title: 'Rejected', value: 'rejected' },
  { title: 'Cancelled', value: 'cancelled' }
];

// Methods
const loadTransfers = async () => {
  loading.value = true;
  try {
    await assetStore.fetchTransfers({
      ...filters.value,
      page: pagination.value.page,
      itemsPerPage: pagination.value.itemsPerPage
    });
  } catch (error) {
    showError('Failed to load transfers');
  } finally {
    loading.value = false;
  }
};

const openTransferDialog = () => {
  transferDialog.value = true;
};

const viewTransfer = (transfer: any) => {
  selectedTransfer.value = transfer;
  detailsDialog.value = true;
};

const approveTransfer = async (transfer: any) => {
  try {
    await assetStore.approveTransfer(transfer.id);
    showSuccess('Transfer approved successfully');
    loadTransfers();
  } catch (error) {
    showError('Failed to approve transfer');
  }
};

const rejectTransfer = async (transfer: any) => {
  try {
    await assetStore.rejectTransfer(transfer.id);
    showSuccess('Transfer rejected');
    loadTransfers();
  } catch (error) {
    showError('Failed to reject transfer');
  }
};

const cancelTransfer = async (transfer: any) => {
  try {
    await assetStore.cancelTransfer(transfer.id);
    showSuccess('Transfer cancelled');
    loadTransfers();
  } catch (error) {
    showError('Failed to cancel transfer');
  }
};

const handleTransfer = async (transferData: any) => {
  try {
    await assetStore.createTransfer(transferData);
    showSuccess('Transfer initiated successfully');
    transferDialog.value = false;
    loadTransfers();
  } catch (error) {
    showError('Failed to initiate transfer');
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const getAssetIcon = (category: string) => {
  const iconMap = {
    'IT Equipment': 'mdi-laptop',
    'Office Furniture': 'mdi-chair-rolling',
    'Vehicles': 'mdi-car'
  };
  return iconMap[category] || 'mdi-package';
};

// Lifecycle
onMounted(() => {
  loadTransfers();
});

// Watch filters
watch(() => filters.value, () => {
  pagination.value.page = 1;
  loadTransfers();
}, { deep: true });
</script>
```

## Key Migration Features

### 1. **Multi-step Assignment Workflow**
- Vue 3 Composition API with reactive forms
- Vuetify Stepper for guided user experience
- Real-time validation with immediate feedback
- Employee search with debouncing

### 2. **Advanced Assignment Features**
- Asset condition documentation with photos
- Accessory tracking and verification
- Approval workflows for high-value assets
- Automated notifications and reminders

### 3. **Transfer Management**
- Complete transfer tracking system
- Approval workflows with role-based permissions
- Bulk transfer operations
- Transfer history and audit trail

### 4. **Mobile Optimization**
- Touch-friendly stepper navigation
- Responsive form layouts
- Mobile camera integration for photos
- Optimized employee selection interface

### 5. **Integration Points**
- Employee directory integration
- Asset management system
- Notification system
- Calendar integration
- Approval workflow engine

This implementation provides a comprehensive asset assignment and transfer system that maintains all React functionality while leveraging Vue.js 3 and Vuetify's modern component architecture.