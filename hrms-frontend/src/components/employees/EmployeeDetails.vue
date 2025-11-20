<template>
  <div class="employee-details-container">
    <!-- Header -->
    <div class="details-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
        </svg>
        Back to List
      </button>
      
      <div class="employee-header">
        <div class="employee-avatar">
          {{ getInitials(employee?.first_name, employee?.last_name) }}
        </div>
        <div class="employee-basic-info">
          <h2>{{ employee?.first_name }} {{ employee?.middle_name }} {{ employee?.last_name }}</h2>
          <div class="employee-meta">
            <span class="badge" :class="`status-${employee?.employment_status?.toLowerCase()}`">
              {{ employee?.employment_status }}
            </span>
            <span class="meta-item">{{ employee?.employee_code }}</span>
            <span class="meta-item">{{ employee?.designation }}</span>
            <span class="meta-item">{{ employee?.department }}</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button @click="editEmployee" class="btn btn-edit">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          Edit Employee
        </button>
      </div>
    </div>

    <!-- Profile Completeness -->
    <ProfileCompleteness v-if="profileCompleteness" :data="profileCompleteness" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      Loading employee details...
    </div>

    <!-- Tabs -->
    <div v-else class="details-tabs">
      <div class="tab-header">
        <button 
          v-for="(tab, index) in tabs" 
          :key="index"
          @click="activeTab = index"
          class="tab-button"
          :class="{ 'active': activeTab === index }"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Tab 1: Personal Information -->
        <div v-if="activeTab === 0" class="tab-pane">
          <div class="info-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Full Name</label>
                <div>{{ employee?.first_name }} {{ employee?.middle_name }} {{ employee?.last_name }}</div>
              </div>
              <div class="info-item">
                <label>Father's Name</label>
                <div>{{ employee?.father_name || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Date of Birth</label>
                <div>{{ formatDate(employee?.dob) || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Gender</label>
                <div>{{ getGenderName(employee?.gender) }}</div>
              </div>
              <div class="info-item">
                <label>Blood Group</label>
                <div>{{ employee?.blood_group || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Marital Status</label>
                <div>{{ getMaritalStatus(employee?.marital_status) }}</div>
              </div>
              <div v-if="employee?.marital_status === 2" class="info-item">
                <label>Marriage Date</label>
                <div>{{ formatDate(employee?.marriage_date) || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3 class="section-title">Identity Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>PAN Number</label>
                <div>{{ employee?.pan_no || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Aadhaar Number</label>
                <div>{{ employee?.aadhaar_no || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>UAN Number</label>
                <div>{{ employee?.uan_no || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Contact Information -->
        <div v-if="activeTab === 1" class="tab-pane">
          <div class="info-section">
            <h3 class="section-title">Contact Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Official Email</label>
                <div>{{ employee?.email || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Personal Email</label>
                <div>{{ employee?.personal_email || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Mobile Number</label>
                <div>{{ employee?.mobile_number || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3 class="section-title">Emergency Contact</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Contact Name</label>
                <div>{{ employee?.emergency_contact_name || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Contact Number</label>
                <div>{{ employee?.emergency_contact_number || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Employment Details -->
        <div v-if="activeTab === 2" class="tab-pane">
          <div class="info-section">
            <h3 class="section-title">Employment Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Employee Code</label>
                <div>{{ employee?.employee_code }}</div>
              </div>
              <div class="info-item">
                <label>Designation</label>
                <div>{{ employee?.designation || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Department</label>
                <div>{{ employee?.department || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Team</label>
                <div>{{ employee?.team_name || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Employment Status</label>
                <div>
                  <span class="badge" :class="`status-${employee?.employment_status?.toLowerCase()}`">
                    {{ employee?.employment_status }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <label>Job Type</label>
                <div>{{ employee?.job_type || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Joining Date</label>
                <div>{{ formatDate(employee?.joining_date) || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Time Doctor User ID</label>
                <div>{{ employee?.time_doctor_user_id || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: Address -->
        <div v-if="activeTab === 3" class="tab-pane">
          <AddressForm 
            :employee-id="employeeId" 
            :address-type="1"
            :existing-address="currentAddress"
            title="Current Address"
            @submit="handleAddressSubmit"
          />
          <div class="section-divider"></div>
          <AddressForm 
            :employee-id="employeeId" 
            :address-type="2"
            :existing-address="permanentAddress"
            title="Permanent Address"
            show-copy-button
            @submit="handleAddressSubmit"
            @copy-current="copyCurrentToPermanent"
          />
        </div>

        <!-- Tab 5: Bank Details -->
        <div v-if="activeTab === 4" class="tab-pane">
          <BankDetailsForm :employee-id="employeeId" />
        </div>

        <!-- Tab 6: Exit Details -->
        <div v-if="activeTab === 5" class="tab-pane">
          <ExitDetailsTab :employee-id="employeeId" />
        </div>

        <!-- Tab 7: Documents -->
        <div v-if="activeTab === 6" class="tab-pane">
          <DocumentUpload :employee-id="employeeId" />
        </div>

        <!-- Tab 8: Qualifications -->
        <div v-if="activeTab === 7" class="tab-pane">
          <QualificationForm :employee-id="employeeId" />
        </div>

        <!-- Tab 9: Certificates -->
        <div v-if="activeTab === 8" class="tab-pane">
          <CertificateForm :employee-id="employeeId" />
        </div>

        <!-- Tab 10: Nominees -->
        <div v-if="activeTab === 9" class="tab-pane">
          <NomineeForm :employee-id="employeeId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Employee, Address, ProfileCompleteness as ProfileCompletenessType } from '@/types/employee';
import AddressForm from './AddressForm.vue';
import BankDetailsForm from './BankDetailsForm.vue';
import DocumentUpload from './DocumentUpload.vue';
import QualificationForm from './QualificationForm.vue';
import CertificateForm from './CertificateForm.vue';
import NomineeForm from './NomineeForm.vue';
import ProfileCompleteness from './ProfileCompleteness.vue';
import ExitDetailsTab from './tabs/ExitDetailsTab.vue';

const router = useRouter();
const route = useRoute();
const employeeStore = useEmployeeStore();

const employeeId = computed(() => Number(route.params.id));
const employee = ref<Employee | null>(null);
const currentAddress = ref<Address | null>(null);
const permanentAddress = ref<Address | null>(null);
const profileCompleteness = ref<ProfileCompletenessType | null>(null);
const loading = ref(true);
const activeTab = ref(0);

const tabs = [
  { label: 'Personal Info' },
  { label: 'Contact Info' },
  { label: 'Employment' },
  { label: 'Address' },
  { label: 'Bank Details' },
  { label: 'Exit Details' },
  { label: 'Documents' },
  { label: 'Qualifications' },
  { label: 'Certificates' },
  { label: 'Nominees' }
];

onMounted(async () => {
  await loadEmployeeData();
});

async function loadEmployeeData() {
  loading.value = true;
  try {
    // Load employee basic info
    employee.value = await employeeStore.fetchEmployeeById(employeeId.value);
    
    // Load addresses
    const addresses = await employeeStore.fetchAddresses(employeeId.value);
    currentAddress.value = addresses.find((addr: Address) => addr.address_type === 1) || null;
    permanentAddress.value = addresses.find((addr: Address) => addr.address_type === 2) || null;
    
    // Load profile completeness
    profileCompleteness.value = await employeeStore.getProfileCompleteness(employeeId.value);
  } catch (error) {
    console.error('Failed to load employee data:', error);
  } finally {
    loading.value = false;
  }
}

function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return 'NA';
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase();
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

function getGenderName(gender?: number): string {
  const genderMap: Record<number, string> = {
    1: 'Male',
    2: 'Female',
    3: 'Other'
  };
  return gender ? genderMap[gender] : 'N/A';
}

function getMaritalStatus(status?: number): string {
  const statusMap: Record<number, string> = {
    1: 'Single',
    2: 'Married',
    3: 'Divorced',
    4: 'Widowed'
  };
  return status ? statusMap[status] : 'N/A';
}

function goBack() {
  router.push('/employees/list');
}

function editEmployee() {
  router.push(`/employees/${employeeId.value}/edit`);
}

async function handleAddressSubmit(addressData: Partial<Address>) {
  try {
    if (addressData.address_type === 1) {
      await employeeStore.saveCurrentAddress(addressData);
    } else {
      await employeeStore.savePermanentAddress(addressData);
    }
    await loadEmployeeData();
  } catch (error: any) {
    alert(error.message || 'Failed to save address');
  }
}

async function copyCurrentToPermanent() {
  if (confirm('Copy current address to permanent address?')) {
    try {
      await employeeStore.copyCurrentToPermanent(employeeId.value);
      await loadEmployeeData();
    } catch (error: any) {
      alert(error.message || 'Failed to copy address');
    }
  }
}
</script>

<style scoped>
.employee-details-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.details-header {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
  margin-bottom: 15px;
}

.back-button:hover {
  background: #e0e0e0;
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.employee-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.employee-basic-info {
  flex: 1;
}

.employee-basic-info h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.employee-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 14px;
  color: #666;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 12px;
}

.badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

.status-active {
  background: #e8f5e9;
  color: #4caf50;
}

.status-inactive {
  background: #fff3e0;
  color: #ff9800;
}

.status-terminated,
.status-resigned {
  background: #ffebee;
  color: #f44336;
}

.header-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #1565c0;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.details-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  overflow-x: auto;
  background: #fafafa;
}

.tab-button {
  flex: 1;
  min-width: 120px;
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  background: #f5f5f5;
  color: #333;
}

.tab-button.active {
  color: #1976d2;
  background: #fff;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #1976d2;
}

.tab-content {
  padding: 30px;
}

.tab-pane {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.info-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
}

.info-item div {
  font-size: 15px;
  color: #333;
}

.section-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 30px 0;
}

@media (max-width: 768px) {
  .employee-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .employee-avatar {
    width: 60px;
    height: 60px;
    font-size: 22px;
  }
  
  .tab-header {
    flex-wrap: nowrap;
  }
  
  .tab-button {
    min-width: 100px;
    padding: 12px 15px;
    font-size: 13px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-content {
    padding: 20px;
  }
}
</style>
