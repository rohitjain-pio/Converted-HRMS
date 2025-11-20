<template>
  <div class="clearance-tracker">
    <div v-if="loading" class="loading-state">
      <p>Loading clearance status...</p>
    </div>

    <div v-else class="progress-container">
      <div class="progress-steps">
        <div
          v-for="(stage, index) in stages"
          :key="stage.id"
          :class="['progress-step', getStepClass(stage.status)]"
        >
          <div class="step-indicator">
            <span v-if="stage.status === 'completed'" class="check-icon">✓</span>
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>
          <div class="step-content">
            <h4>{{ stage.label }}</h4>
            <p class="step-status">{{ stage.statusText }}</p>
            <p v-if="stage.completedBy" class="step-meta">
              By: {{ stage.completedBy }}
            </p>
            <p v-if="stage.completedOn" class="step-meta">
              On: {{ formatDate(stage.completedOn) }}
            </p>
          </div>
          <div v-if="index < stages.length - 1" class="step-connector" :class="{ completed: stage.status === 'completed' }"></div>
        </div>
      </div>

      <div class="overall-progress">
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ overallProgress }}% Complete</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClearanceStore } from '@/stores/clearanceStore';
import { formatDate } from '@/utils/exitManagementHelpers';

const props = defineProps<{
  resignationId: number;
}>();

const clearanceStore = useClearanceStore();
const loading = ref(false);

const stages = computed(() => [
  {
    id: 'hr',
    label: 'HR Clearance',
    status: getStageStatus(clearanceStore.hrClearance),
    statusText: getStageStatusText(clearanceStore.hrClearance),
    completedBy: clearanceStore.hrClearance?.CompletedBy,
    completedOn: clearanceStore.hrClearance?.CompletedOn,
  },
  {
    id: 'dept',
    label: 'Department Clearance',
    status: getStageStatus(clearanceStore.deptClearance),
    statusText: getStageStatusText(clearanceStore.deptClearance),
    completedBy: clearanceStore.deptClearance?.CompletedBy,
    completedOn: clearanceStore.deptClearance?.CompletedOn,
  },
  {
    id: 'it',
    label: 'IT Clearance',
    status: getStageStatus(clearanceStore.itClearance),
    statusText: getStageStatusText(clearanceStore.itClearance),
    completedBy: clearanceStore.itClearance?.CompletedBy,
    completedOn: clearanceStore.itClearance?.CompletedOn,
  },
  {
    id: 'account',
    label: 'Accounts Clearance',
    status: getStageStatus(clearanceStore.accountClearance),
    statusText: getStageStatusText(clearanceStore.accountClearance),
    completedBy: clearanceStore.accountClearance?.CompletedBy,
    completedOn: clearanceStore.accountClearance?.CompletedOn,
  },
]);

const overallProgress = computed(() => clearanceStore.clearanceProgress);

function getStageStatus(clearance: any): 'completed' | 'in-progress' | 'pending' {
  if (!clearance) return 'pending';
  if (clearance.IsCompleted) return 'completed';
  return 'in-progress';
}

function getStageStatusText(clearance: any): string {
  if (!clearance) return 'Not Started';
  if (clearance.IsCompleted) return 'Completed';
  return 'In Progress';
}

function getStepClass(status: string): string {
  return status;
}

async function loadClearances() {
  loading.value = true;
  await clearanceStore.fetchAllClearances(props.resignationId);
  loading.value = false;
}

onMounted(() => {
  loadClearances();
});
</script>

<style scoped>
.clearance-tracker {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #666;
  font-weight: 600;
  margin-bottom: 12px;
  z-index: 2;
  position: relative;
}

.progress-step.completed .step-indicator {
  background-color: #28a745;
  color: white;
}

.progress-step.in-progress .step-indicator {
  background-color: #ffc107;
  color: white;
}

.check-icon {
  font-size: 24px;
}

.step-content {
  text-align: center;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.step-status {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
}

.step-meta {
  margin: 2px 0;
  font-size: 11px;
  color: #999;
}

.step-connector {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 1;
}

.step-connector.completed {
  background-color: #28a745;
}

.progress-step:last-child .step-connector {
  display: none;
}

.overall-progress {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: #555;
  margin: 0;
}
</style>
