<template>
  <div class="admin-resignation-detail">
    <div v-if="loading" class="loading-state">
      <p>Loading resignation details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else-if="resignation" class="detail-content">
      <div class="header-section">
        <div>
          <h2>Resignation Details</h2>
          <p class="employee-info">{{ getEmployeeName(resignation.EmployeeId) }} - {{ getDepartmentName(resignation.DepartmentID) }}</p>
        </div>
        <span class="status-badge" :style="{ backgroundColor: getStatusColor(resignation.Status) }">
          {{ getResignationStatusLabel(resignation.Status) }}
        </span>
      </div>

      <div class="details-card">
        <h3>Basic Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Employee ID:</label>
            <span>{{ resignation.EmployeeId }}</span>
          </div>
          <div class="detail-item">
            <label>Submission Date:</label>
            <span>{{ formatDate(resignation.CreatedOn) }}</span>
          </div>
          <div class="detail-item">
            <label>Last Working Day:</label>
            <span>{{ formatDate(resignation.LastWorkingDay) }}</span>
          </div>
          <div class="detail-item">
            <label>Exit Discussion:</label>
            <span>{{ resignation.ExitDiscussion ? 'Yes' : 'No' }}</span>
          </div>
          <div class="detail-item full-width">
            <label>Reason:</label>
            <span>{{ resignation.Reason }}</span>
          </div>
        </div>
      </div>

      <div v-if="resignation.EarlyReleaseDate" class="details-card">
        <h3>Early Release Request</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Requested Date:</label>
            <span>{{ formatDate(resignation.EarlyReleaseDate) }}</span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span>{{ getEarlyReleaseStatusLabel(resignation.EarlyReleaseStatus) }}</span>
          </div>
          <div v-if="resignation.RejectEarlyReleaseReason" class="detail-item full-width">
            <label>Rejection Reason:</label>
            <span>{{ resignation.RejectEarlyReleaseReason }}</span>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button
          v-if="resignation.Status === 1"
          @click="showAcceptDialog = true"
          class="btn-success"
        >
          Accept Resignation
        </button>
        <button
          v-if="resignation.Status === 1"
          @click="showRejectDialog = true"
          class="btn-danger"
        >
          Reject Resignation
        </button>
        <button
          v-if="resignation.EarlyReleaseStatus === 1"
          @click="showEarlyReleaseDialog = true"
          class="btn-primary"
        >
          Process Early Release
        </button>
        <button
          v-if="resignation.Status === 2"
          @click="showUpdateLWDDialog = true"
          class="btn-secondary"
        >
          Update Last Working Day
        </button>
      </div>

      <div class="clearances-section">
        <h3>Clearance Status</h3>
        <ClearanceTracker :resignation-id="resignation.Id" />
      </div>

      <div class="tabs-section">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <HRClearanceForm v-if="activeTab === 'hr'" :resignation-id="resignation.Id" />
          <DepartmentClearanceForm v-if="activeTab === 'dept'" :resignation-id="resignation.Id" />
          <ITClearanceForm v-if="activeTab === 'it'" :resignation-id="resignation.Id" />
          <AccountClearanceForm v-if="activeTab === 'account'" :resignation-id="resignation.Id" />
        </div>
      </div>
    </div>

    <AcceptRejectResignationDialog
      :show="showAcceptDialog"
      :resignation-id="resignation?.Id || 0"
      action="accept"
      @close="showAcceptDialog = false"
      @completed="handleActionCompleted"
    />

    <AcceptRejectResignationDialog
      :show="showRejectDialog"
      :resignation-id="resignation?.Id || 0"
      action="reject"
      @close="showRejectDialog = false"
      @completed="handleActionCompleted"
    />

    <EarlyReleaseApprovalDialog
      :show="showEarlyReleaseDialog"
      :resignation-id="resignation?.Id || 0"
      @close="showEarlyReleaseDialog = false"
      @completed="handleActionCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';
import {
  formatDate,
  getResignationStatusLabel,
  getEarlyReleaseStatusLabel,
  getStatusBadgeColor,
} from '@/utils/exitManagementHelpers';
import ClearanceTracker from './ClearanceTracker.vue';
import HRClearanceForm from '../clearances/HRClearanceForm.vue';
import DepartmentClearanceForm from '../clearances/DepartmentClearanceForm.vue';
import ITClearanceForm from '../clearances/ITClearanceForm.vue';
import AccountClearanceForm from '../clearances/AccountClearanceForm.vue';
import AcceptRejectResignationDialog from './AcceptRejectResignationDialog.vue';
import EarlyReleaseApprovalDialog from './EarlyReleaseApprovalDialog.vue';

const route = useRoute();

const resignation = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('hr');
const showAcceptDialog = ref(false);
const showRejectDialog = ref(false);
const showEarlyReleaseDialog = ref(false);
const showUpdateLWDDialog = ref(false);

const tabs = [
  { id: 'hr', label: 'HR Clearance' },
  { id: 'dept', label: 'Department Clearance' },
  { id: 'it', label: 'IT Clearance' },
  { id: 'account', label: 'Accounts Clearance' },
];

function getStatusColor(status: number) {
  const color = getStatusBadgeColor(status);
  const colorMap: Record<string, string> = {
    'orange': '#ffc107',
    'green': '#28a745',
    'red': '#dc3545',
    'gray': '#6c757d',
    'blue': '#17a2b8',
  };
  return colorMap[color] || '#6c757d';
}

function getEmployeeName(employeeId: number): string {
  return `Employee ${employeeId}`; // Replace with actual employee lookup
}

function getDepartmentName(deptId: number): string {
  return `Department ${deptId}`; // Replace with actual department lookup
}

async function loadResignation() {
  const resignationId = parseInt(route.params.id as string);
  loading.value = true;
  error.value = null;

  const result = await adminExitEmployeeApi.getResignationById(resignationId);

  loading.value = false;

  if (result.data.StatusCode === 200) {
    resignation.value = result.data.Data;
  } else {
    error.value = result.data.Message || 'Failed to load resignation details';
  }
}

function handleActionCompleted() {
  loadResignation();
}

onMounted(() => {
  loadResignation();
});
</script>

<style scoped>
.admin-resignation-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-message {
  color: #dc3545;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.employee-info {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 8px 20px;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.details-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.details-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  font-size: 14px;
}

.detail-item span {
  color: #333;
}

.actions-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-success,
.btn-danger,
.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: white;
}

.btn-success {
  background-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary {
  background-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.clearances-section {
  margin-bottom: 24px;
}

.clearances-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.tabs-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  flex: 1;
  padding: 16px;
  background: #f8f9fa;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #e9ecef;
}

.tab-button.active {
  background: white;
  border-bottom-color: #007bff;
  color: #007bff;
}

.tab-content {
  padding: 24px;
}
</style>
