<template>
  <div class="exit-details-tab">
    <div v-if="loading" class="loading-state">
      <p>Loading exit details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else-if="!resignation" class="no-resignation">
      <p>No resignation submitted yet.</p>
    </div>

    <div v-else class="resignation-details">
      <div class="details-section">
        <h3>Resignation Information</h3>
        <div class="details-grid">
          <div class="detail-item">
            <label>Status:</label>
            <span class="status-badge" :class="'status-' + resignation.Status">
              {{ getResignationStatusLabel(resignation.Status) }}
            </span>
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
            <label>Reason:</label>
            <span>{{ resignation.Reason }}</span>
          </div>
        </div>
      </div>

      <div v-if="resignation.EarlyReleaseDate" class="details-section">
        <h3>Early Release Request</h3>
        <div class="details-grid">
          <div class="detail-item">
            <label>Early Release Date:</label>
            <span>{{ formatDate(resignation.EarlyReleaseDate) }}</span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span class="status-badge">
              {{ getEarlyReleaseStatusLabel(resignation.EarlyReleaseStatus) }}
            </span>
          </div>
          <div v-if="resignation.RejectEarlyReleaseReason" class="detail-item full-width">
            <label>Rejection Reason:</label>
            <span>{{ resignation.RejectEarlyReleaseReason }}</span>
          </div>
        </div>
      </div>

      <div class="details-section">
        <h3>Clearance Status</h3>
        <div class="clearance-grid">
          <div class="clearance-item">
            <label>HR Clearance:</label>
            <span :class="clearanceClass(resignation.hrClearance)">
              {{ formatClearanceStatus(resignation.hrClearance) }}
            </span>
          </div>
          <div class="clearance-item">
            <label>Department Clearance:</label>
            <span :class="clearanceClass(resignation.departmentClearance)">
              {{ formatClearanceStatus(resignation.departmentClearance) }}
            </span>
          </div>
          <div class="clearance-item">
            <label>IT Clearance:</label>
            <span :class="clearanceClass(resignation.itClearance)">
              {{ formatClearanceStatus(resignation.itClearance) }}
            </span>
          </div>
          <div class="clearance-item">
            <label>Accounts Clearance:</label>
            <span :class="clearanceClass(resignation.accountClearance)">
              {{ formatClearanceStatus(resignation.accountClearance) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="resignation.SettlementDate" class="details-section">
        <h3>Settlement Information</h3>
        <div class="details-grid">
          <div class="detail-item">
            <label>Settlement Status:</label>
            <span>{{ resignation.SettlementStatus }}</span>
          </div>
          <div class="detail-item">
            <label>Settlement Date:</label>
            <span>{{ formatDate(resignation.SettlementDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useResignationStore } from '@/stores/resignationStore';
import { 
  formatDate, 
  getResignationStatusLabel, 
  getEarlyReleaseStatusLabel,
  formatClearanceStatus 
} from '@/utils/exitManagementHelpers';

const props = defineProps<{
  employeeId: number;
}>();

const resignationStore = useResignationStore();
const resignation = computed(() => resignationStore.currentResignation);
const loading = ref(false);
const error = ref<string | null>(null);

const clearanceClass = (clearance: any) => {
  return clearance ? 'clearance-completed' : 'clearance-pending';
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const existsData = await resignationStore.checkResignationExists(props.employeeId);
    if (existsData.Exists && existsData.ResignationId) {
      await resignationStore.fetchResignation(existsData.ResignationId);
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load resignation details';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.exit-details-tab {
  padding: 20px;
}

.loading-state,
.error-state,
.no-resignation {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-message {
  color: #dc3545;
}

.resignation-details {
  max-width: 1200px;
}

.details-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.details-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.details-grid,
.clearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item,
.clearance-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label,
.clearance-item label {
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  font-size: 14px;
}

.detail-item span,
.clearance-item span {
  color: #333;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.status-badge.status-1 {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.status-2 {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.status-3 {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.status-4 {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-badge.status-5 {
  background-color: #d1ecf1;
  color: #0c5460;
}

.clearance-completed {
  color: #28a745;
  font-weight: 600;
}

.clearance-pending {
  color: #ffc107;
  font-weight: 600;
}
</style>
