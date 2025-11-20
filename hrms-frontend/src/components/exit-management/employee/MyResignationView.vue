<template>
  <div class="my-resignation-view">
    <div v-if="loading" class="loading-state">
      <p>Loading resignation details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else-if="!resignation" class="no-resignation">
      <p>You have not submitted any resignation yet.</p>
      <button @click="$emit('submit-new')" class="btn-primary">Submit Resignation</button>
    </div>

    <div v-else class="resignation-content">
      <div class="status-header">
        <h2>My Resignation</h2>
        <span class="status-badge" :style="{ backgroundColor: getBadgeColor(resignation.Status) }">
          {{ getResignationStatusLabel(resignation.Status) }}
        </span>
      </div>

      <div class="details-section">
        <div class="detail-row">
          <label>Submission Date:</label>
          <span>{{ formatDate(resignation.CreatedOn) }}</span>
        </div>
        <div class="detail-row">
          <label>Last Working Day:</label>
          <span>{{ formatDate(resignation.LastWorkingDay) }}</span>
        </div>
        <div class="detail-row">
          <label>Reason:</label>
          <span>{{ resignation.Reason }}</span>
        </div>
        <div class="detail-row">
          <label>Exit Discussion:</label>
          <span>{{ resignation.ExitDiscussion ? 'Yes' : 'No' }}</span>
        </div>
      </div>

      <div v-if="resignation.EarlyReleaseDate" class="details-section">
        <h3>Early Release Request</h3>
        <div class="detail-row">
          <label>Requested Date:</label>
          <span>{{ formatDate(resignation.EarlyReleaseDate) }}</span>
        </div>
        <div class="detail-row">
          <label>Status:</label>
          <span>{{ getEarlyReleaseStatusLabel(resignation.EarlyReleaseStatus) }}</span>
        </div>
        <div v-if="resignation.RejectEarlyReleaseReason" class="detail-row">
          <label>Rejection Reason:</label>
          <span>{{ resignation.RejectEarlyReleaseReason }}</span>
        </div>
      </div>

      <div v-if="resignation.RejectResignationReason" class="details-section rejection-section">
        <h3>Rejection Reason</h3>
        <p>{{ resignation.RejectResignationReason }}</p>
      </div>

      <div class="actions-section">
        <button
          v-if="canRevoke"
          @click="handleRevoke"
          class="btn-secondary"
        >
          Withdraw Resignation
        </button>
        <button
          v-if="canRequestEarlyRelease"
          @click="$emit('request-early-release')"
          class="btn-primary"
        >
          Request Early Release
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useResignationStore } from '@/stores/resignationStore';
import { 
  formatDate, 
  getResignationStatusLabel, 
  getEarlyReleaseStatusLabel,
  getStatusBadgeColor 
} from '@/utils/exitManagementHelpers';

defineEmits(['submit-new', 'request-early-release']);

const resignationStore = useResignationStore();

const resignation = computed(() => resignationStore.currentResignation);
const loading = computed(() => resignationStore.loading);
const error = computed(() => resignationStore.error);
const canRevoke = computed(() => resignationStore.canRevoke);
const canRequestEarlyRelease = computed(() => resignationStore.canRequestEarlyRelease);

function getBadgeColor(status: number) {
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

async function handleRevoke() {
  if (!resignation.value) return;
  
  if (confirm('Are you sure you want to withdraw your resignation? This action cannot be undone.')) {
    await resignationStore.revokeResignation(resignation.value.Id);
  }
}
</script>

<style scoped>
.my-resignation-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.loading-state,
.error-state,
.no-resignation {
  text-align: center;
  padding: 60px 20px;
}

.error-message {
  color: #dc3545;
  margin-bottom: 16px;
}

.btn-primary {
  padding: 10px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.resignation-content {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-header h2 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 16px;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.details-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.details-section:last-of-type {
  border-bottom: none;
}

.details-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #555;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-row label {
  min-width: 180px;
  font-weight: 600;
  color: #555;
}

.detail-row span {
  color: #333;
}

.rejection-section {
  background-color: #f8d7da;
  padding: 16px;
  border-radius: 4px;
}

.rejection-section p {
  margin: 0;
  color: #721c24;
}

.actions-section {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
}

.btn-secondary {
  padding: 10px 24px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
