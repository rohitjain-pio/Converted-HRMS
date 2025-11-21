<template>
  <div class="employment-details-tab">
    <!-- Current Employment Details -->
    <v-card class="details-card" elevation="0">
      <v-card-title class="section-header">Current Employment Details</v-card-title>
      <v-card-text class="pa-6">
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
                    {{ getEmploymentStatus() }}
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
      <v-card-text class="pa-6">
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
            prepend-icon="mdi-plus"
            @click="openAddForm"
          >
            Add Previous Employer
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-6">
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="previousEmployers.length" class="previous-employers">
          <v-card
            v-for="(employer, index) in previousEmployers"
            :key="index"
            class="mb-4"
            variant="outlined"
          >
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-start mb-4">
                <div class="display-mode flex-grow-1">
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
                          <div class="value">{{ formatDate(employer.employment_start_date) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="info-field">
                          <label>To Date</label>
                          <div class="value">{{ formatDate(employer.employment_end_date) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="info-field">
                          <label>Duration</label>
                          <div class="value">{{ employer.duration || calculateDuration(employer.employment_start_date, employer.employment_end_date) }}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>

                  <div v-if="employer.manager_name || employer.hr_name" class="form-section">
                    <v-row class="form-row">
                      <v-col v-if="employer.manager_name" cols="12" md="6">
                        <div class="info-field">
                          <label>Manager Name</label>
                          <div class="value">{{ employer.manager_name }}</div>
                        </div>
                      </v-col>
                      <v-col v-if="employer.manager_contact" cols="12" md="6">
                        <div class="info-field">
                          <label>Manager Contact</label>
                          <div class="value">{{ employer.manager_contact }}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>

                  <div v-if="employer.company_address" class="form-section">
                    <v-row class="form-row">
                      <v-col cols="12">
                        <div class="info-field">
                          <label>Company Address</label>
                          <div class="value">{{ employer.company_address }}</div>
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

                <div v-if="canEdit" class="action-buttons">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="text"
                    icon
                    @click="openEditForm(employer)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent">Edit</v-tooltip>
                  </v-btn>
                  <v-btn
                    size="small"
                    color="error"
                    variant="text"
                    icon
                    @click="deleteEmployer(employer.id!)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent">Delete</v-tooltip>
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div v-else class="text-center text-grey py-4">
          No previous employment history available
        </div>
      </v-card-text>
    </v-card>

    <!-- Previous Employer Form Dialog -->
    <v-dialog v-model="showPreviousEmployerForm" max-width="800">
      <v-card>
        <v-card-title>{{ editingEmployerId ? 'Edit' : 'Add' }} Previous Employer</v-card-title>
        <v-card-text>
          <PreviousEmployerForm
            :employee-id="employee!.id"
            :editing-id="editingEmployerId"
            @saved="onEmployerSaved"
            @cancel="closePreviousEmployerForm"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Employee } from '@/types/employee';
import apiClient from '@/services/api/client';
import PreviousEmployerForm from '../PreviousEmployerForm.vue';

const props = defineProps<{
  employee: Employee | null;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const previousEmployers = ref<any[]>([]);
const showPreviousEmployerForm = ref(false);
const editingEmployerId = ref<number | null>(null);
const loading = ref(false);

onMounted(() => {
  loadPreviousEmployers();
});

async function loadPreviousEmployers() {
  if (!props.employee?.id) return;
  
  loading.value = true;
  try {
    const response = await apiClient.get('/employees/previous-employers', {
      params: { employee_id: props.employee.id }
    });
    
    if (response.data.success) {
      previousEmployers.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to load previous employers:', error);
  } finally {
    loading.value = false;
  }
}

function openAddForm() {
  editingEmployerId.value = null;
  showPreviousEmployerForm.value = true;
}

function openEditForm(employer: any) {
  editingEmployerId.value = employer.id;
  showPreviousEmployerForm.value = true;
}

function closePreviousEmployerForm() {
  editingEmployerId.value = null;
  showPreviousEmployerForm.value = false;
}

function onEmployerSaved() {
  closePreviousEmployerForm();
  loadPreviousEmployers();
  emit('refresh');
}

async function deleteEmployer(id: number) {
  if (!confirm('Are you sure you want to delete this previous employer record?')) {
    return;
  }

  try {
    await apiClient.delete(`/employees/previous-employers/${id}`);
    await loadPreviousEmployers();
    emit('refresh');
  } catch (error: any) {
    console.error('Failed to delete previous employer:', error);
    const message = error.response?.data?.message || 'Failed to delete previous employer';
    alert(message);
  }
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

function getEmploymentStatus(): string {
  const status = props.employee?.employment_detail?.employment_status;
  if (!status) return 'N/A';
  
  // Handle numeric status codes
  if (typeof status === 'number' || !isNaN(Number(status))) {
    const statusMap: Record<number, string> = {
      1: 'Active',
      2: 'Inactive',
      3: 'Terminated',
      4: 'Resigned',
      5: 'On Notice',
      6: 'Absconded'
    };
    return statusMap[Number(status)] || `Status ${status}`;
  }
  
  // Handle string status
  return String(status);
}

function getStatusColor(): string {
  const statusText = getEmploymentStatus().toLowerCase();
  if (statusText.includes('active')) return 'success';
  if (statusText.includes('inactive') || statusText.includes('notice')) return 'warning';
  if (statusText.includes('terminated') || statusText.includes('resigned') || statusText.includes('absconded')) return 'error';
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
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: box-shadow 0.3s ease;
}

.details-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.section-header {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
}

/* Form Layout */
.display-mode {
  padding: 0;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-row {
  margin-bottom: 0;
}

/* Info Fields */
.info-field {
  margin-bottom: 0;
  padding: 4px 0;
}

.info-field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.info-field .value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 400;
  line-height: 1.6;
  padding: 4px 8px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #e0e0e0;
  min-height: 32px;
  display: flex;
  align-items: center;
}

/* Previous Employers */
.previous-employers {
  margin-top: 0;
}

.previous-employers .v-card {
  border-radius: 6px;
  border: 1px solid #d8d8d8;
  background: #fafafa;
  transition: all 0.2s ease;
}

.previous-employers .v-card:hover {
  border-color: #b0b0b0;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 16px;
  padding: 4px;
}

.action-buttons .v-btn {
  min-width: 36px;
  width: 36px;
  height: 36px;
}

/* Responsive */
@media (max-width: 960px) {
  .form-section {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }
  
  .section-header {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .info-field .value {
    font-size: 13px;
    padding: 3px 6px;
  }
  
  .action-buttons {
    flex-direction: row;
    margin-left: 0;
    margin-top: 12px;
    padding: 0;
  }
}
</style>