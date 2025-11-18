<template>
  <div class="employment-details-tab">
    <!-- Current Employment Details -->
    <v-card class="details-card" elevation="0">
      <v-card-title class="section-header">Current Employment Details</v-card-title>
      <v-card-text class="pa-8">
        <div class="display-mode">
          <div class="form-section">
            <v-row class="form-row">
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Employee Code</label>
                  <div class="value">{{ employee?.employee_code || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Official Email</label>
                  <div class="value">{{ employee?.email || employee?.employment_detail?.email || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Joining Date</label>
                  <div class="value">{{ formatDate(employee?.employment_detail?.joining_date) || 'N/A' }}</div>
                </div>
              </v-col>
            </v-row>
          </div>

          <div class="form-section">
            <v-row class="form-row">
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Department</label>
                  <div class="value">{{ employee?.employment_detail?.department_name || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Designation</label>
                  <div class="value">{{ employee?.employment_detail?.designation || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Team</label>
                  <div class="value">{{ employee?.employment_detail?.team_name || 'N/A' }}</div>
                </div>
              </v-col>
            </v-row>
          </div>

          <div class="form-section">
            <v-row class="form-row">
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Reporting Manager</label>
                  <div class="value">{{ employee?.employment_detail?.reporting_manager_name || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Employment Status</label>
                  <v-chip :color="getStatusColor()" size="small">
                    {{ employee?.employment_detail?.employment_status || 'N/A' }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Job Type</label>
                  <div class="value">{{ getJobType() }}</div>
                </div>
              </v-col>
            </v-row>
          </div>

          <div class="form-section">
            <v-row class="form-row">
              <v-col cols="12" md="6">
                <div class="info-field">
                  <label>Total Experience</label>
                  <div class="value">{{ getTotalExperience() }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-field">
                  <label>Relevant Experience</label>
                  <div class="value">{{ getRelevantExperience() }}</div>
                </div>
              </v-col>
            </v-row>
          </div>

          <div class="form-section">
            <v-row class="form-row">
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Time Doctor User ID</label>
                  <div class="value">{{ employee?.employment_detail?.time_doctor_user_id || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-field">
                  <label>Probation Period</label>
                  <div class="value">{{ employee?.employment_detail?.probation_months ? `${employee.employment_detail.probation_months} months` : 'N/A' }}</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Background Verification -->
    <v-card class="details-card mt-4" elevation="0">
      <v-card-title class="section-header">Background Verification</v-card-title>
      <v-card-text class="pa-8">
        <div class="display-mode">
          <div class="form-section">
            <v-row class="form-row">
              <v-col cols="12" md="6">
                <div class="info-field">
                  <label>Background Verification Status</label>
                  <div class="value">{{ employee?.employment_detail?.background_verificationstatus || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-field">
                  <label>Criminal Verification</label>
                  <div class="value">{{ employee?.employment_detail?.criminal_verification || 'N/A' }}</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Previous Employment History -->
    <v-card class="details-card mt-4" elevation="0">
      <v-card-title class="section-header">
            <div class="d-flex justify-space-between align-center">
              <span>Previous Employment History</span>
              <v-btn
                v-if="canEdit"
                size="small"
                color="primary"
                @click="showPreviousEmployerForm = true"
              >
                Add Previous Employer
              </v-btn>
            </div>
          </v-card-title>
      <v-card-text class="pa-8">
        <div v-if="previousEmployers.length" class="previous-employers">
          <v-card
            v-for="(employer, index) in previousEmployers"
            :key="index"
            class="mb-4"
            variant="outlined"
          >
            <v-card-text class="pa-6">
              <div class="display-mode">
                <div class="form-section">
                  <v-row class="form-row">
                    <v-col cols="12" md="6">
                      <div class="info-field">
                        <label>Company Name</label>
                        <div class="value">{{ employer.company_name }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="info-field">
                        <label>Designation</label>
                        <div class="value">{{ employer.designation }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <div class="form-section">
                  <v-row class="form-row">
                    <v-col cols="12" md="4">
                      <div class="info-field">
                        <label>From Date</label>
                        <div class="value">{{ formatDate(employer.from_date) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div class="info-field">
                        <label>To Date</label>
                        <div class="value">{{ formatDate(employer.to_date) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div class="info-field">
                        <label>Duration</label>
                        <div class="value">{{ calculateDuration(employer.from_date, employer.to_date) }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <div v-if="employer.reason_for_leaving" class="form-section">
                  <v-row class="form-row">
                    <v-col cols="12">
                      <div class="info-field">
                        <label>Reason for Leaving</label>
                        <div class="value">{{ employer.reason_for_leaving }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div v-else class="text-center text-grey py-4">No previous employment history available</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Employee } from '@/types/employee';

const props = defineProps<{
  employee: Employee | null;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const previousEmployers = ref<any[]>([]);
const showPreviousEmployerForm = ref(false);

onMounted(() => {
  // TODO: Load previous employers
  loadPreviousEmployers();
});

async function loadPreviousEmployers() {
  // TODO: Implement API call
  previousEmployers.value = [];
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStatusColor(): string {
  const status = (typeof props.employee?.employment_detail?.employment_status === 'string' 
    ? props.employee.employment_detail.employment_status.toLowerCase() 
    : '');
  if (status.includes('active')) return 'success';
  if (status.includes('inactive')) return 'warning';
  if (status.includes('terminated') || status.includes('resigned')) return 'error';
  return 'default';
}

function getJobType(): string {
  const jobType = props.employee?.employment_detail?.job_type;
  const jobTypes: Record<number, string> = {
    1: 'Full Time',
    2: 'Part Time',
    3: 'Contract',
    4: 'Intern'
  };
  return jobType ? jobTypes[jobType] || 'N/A' : 'N/A';
}

function getTotalExperience(): string {
  const years = props.employee?.employment_detail?.total_experience_year || 0;
  const months = props.employee?.employment_detail?.total_experience_month || 0;
  if (!years && !months) return 'N/A';
  return `${years} years ${months} months`;
}

function getRelevantExperience(): string {
  const years = props.employee?.employment_detail?.relevant_experience_year || 0;
  const months = props.employee?.employment_detail?.relevant_experience_month || 0;
  if (!years && !months) return 'N/A';
  return `${years} years ${months} months`;
}

function calculateDuration(fromDate?: string, toDate?: string): string {
  if (!fromDate || !toDate) return 'N/A';
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} years ${remainingMonths} months`;
}
</script>

<style scoped>
.employment-details-tab {
  padding: 0;
}

/* Card Styling */
.details-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.section-header {
  font-size: 18px;
  font-weight: 600;
  color: #273a50;
  padding: 20px 24px;
  border-bottom: 2px solid #f0f0f0;
}

/* Form Layout */
.display-mode {
  padding: 0;
}

.form-section {
  margin-bottom: 16px;
}

.form-row {
  margin-bottom: 0;
}

/* Info Fields */
.info-field {
  margin-bottom: 0;
}

.info-field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.info-field .value {
  font-size: 15px;
  color: #333;
  font-weight: 400;
  line-height: 1.5;
}

/* Previous Employers */
.previous-employers {
  margin-top: 0;
}

.previous-employers .v-card {
  border-radius: 6px;
  border-color: #e0e0e0;
}

/* Responsive */
@media (max-width: 960px) {
  .form-section {
    margin-bottom: 8px;
  }
  
  .section-header {
    padding: 16px 20px;
    font-size: 16px;
  }
}
</style>