<template>
  <div v-if="data && data.sections" class="profile-completeness-container">
    <div class="completeness-header">
      <div class="header-content">
        <h3>Profile Completeness</h3>
        <div class="overall-percentage">
          <div class="circular-progress">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle 
                cx="40" 
                cy="40" 
                r="35" 
                fill="none" 
                stroke="#e0e0e0" 
                stroke-width="8"
              />
              <circle 
                cx="40" 
                cy="40" 
                r="35" 
                fill="none" 
                :stroke="getProgressColor(data.overall_percentage || 0)"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                transform="rotate(-90 40 40)"
                style="transition: stroke-dashoffset 0.5s ease"
              />
            </svg>
            <div class="percentage-text">
              <span class="number">{{ Math.round(data.overall_percentage || 0) }}</span>
              <span class="symbol">%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="status-message">
        <span class="message-icon" :class="getStatusClass(data.overall_percentage || 0)">
          {{ getStatusIcon(data.overall_percentage || 0) }}
        </span>
        <span class="message-text">{{ getStatusMessage(data.overall_percentage || 0) }}</span>
      </div>
    </div>

    <div class="sections-grid">
      <div 
        v-for="(value, key) in data.sections" 
        :key="key"
        class="section-card"
        :class="{ 'completed': value === 12.5, 'partial': value > 0 && value < 12.5, 'empty': value === 0 }"
      >
        <div class="section-header">
          <div class="section-icon">
            <svg v-if="value === 12.5" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="value > 0" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="section-info">
            <div class="section-name">{{ getSectionName(key) }}</div>
            <div class="section-percentage">{{ (value / 12.5 * 100).toFixed(0) }}%</div>
          </div>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: (value / 12.5 * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="incompleteSections.length > 0" class="action-prompt">
      <div class="prompt-icon">ℹ️</div>
      <div class="prompt-content">
        <strong>Incomplete Sections:</strong>
        <span>{{ incompleteSections.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProfileCompleteness } from '@/types/employee';

interface Props {
  data: ProfileCompleteness;
}

const props = defineProps<Props>();

const circumference = 2 * Math.PI * 35; // 2πr where r=35

const progressOffset = computed(() => {
  const progress = (props.data?.overall_percentage || 0) / 100;
  return circumference - (progress * circumference);
});

const incompleteSections = computed(() => {
  const sections = props.data?.sections;
  if (!sections) return [];
  
  const incomplete: string[] = [];
  
  Object.entries(sections).forEach(([key, value]) => {
    if (value < 12.5) {
      incomplete.push(getSectionName(key));
    }
  });
  
  return incomplete;
});

function getSectionName(key: string): string {
  const names: Record<string, string> = {
    personal_info: 'Personal Information',
    contact_info: 'Contact Information',
    employment_details: 'Employment Details',
    address: 'Address',
    bank_details: 'Bank Details',
    documents: 'Documents',
    qualifications: 'Qualifications',
    nominees: 'Nominees'
  };
  return names[key] || key;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '#4caf50';
  if (percentage >= 50) return '#ff9800';
  return '#f44336';
}

function getStatusClass(percentage: number): string {
  if (percentage >= 80) return 'status-good';
  if (percentage >= 50) return 'status-medium';
  return 'status-low';
}

function getStatusIcon(percentage: number): string {
  if (percentage >= 80) return '✓';
  if (percentage >= 50) return '⚠';
  return '✗';
}

function getStatusMessage(percentage: number): string {
  if (percentage === 100) return 'Profile is complete! All sections filled.';
  if (percentage >= 80) return 'Almost there! Just a few more details needed.';
  if (percentage >= 50) return 'Good progress! Please complete remaining sections.';
  return 'Profile is incomplete. Please fill in all sections.';
}
</script>

<style scoped>
.profile-completeness-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  color: #fff;
}

.completeness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.completeness-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}

.overall-percentage {
  position: relative;
}

.circular-progress {
  position: relative;
  width: 80px;
  height: 80px;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-weight: 700;
  color: #fff;
}

.percentage-text .number {
  font-size: 24px;
}

.percentage-text .symbol {
  font-size: 14px;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.message-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.message-icon.status-good {
  background: #4caf50;
  color: #fff;
}

.message-icon.status-medium {
  background: #ff9800;
  color: #fff;
}

.message-icon.status-low {
  background: #f44336;
  color: #fff;
}

.message-text {
  font-size: 14px;
  font-weight: 500;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.section-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.section-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.section-card.completed {
  border-color: #4caf50;
}

.section-card.partial {
  border-color: #ff9800;
}

.section-card.empty {
  border-color: #f44336;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.section-icon {
  flex-shrink: 0;
}

.section-card.completed .section-icon {
  color: #4caf50;
}

.section-card.partial .section-icon {
  color: #ff9800;
}

.section-card.empty .section-icon {
  color: #f44336;
}

.section-info {
  flex: 1;
  min-width: 0;
}

.section-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 5px;
  line-height: 1.3;
}

.section-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.action-prompt {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.prompt-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.prompt-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.prompt-content strong {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .sections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .completeness-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .sections-grid {
    grid-template-columns: 1fr;
  }
  
  .status-message {
    width: 100%;
  }
}
</style>
