<template>
  <div class="employee-profile-container">
    <!-- Header Section -->
    <div class="profile-header">
      <v-card class="header-card">
        <v-card-text>
          <div class="header-content">
            <div class="back-button-row">
              <v-btn
                variant="text"
                prepend-icon="mdi-arrow-left"
                @click="goBack"
                class="mb-2"
              >
                Back to Employees
              </v-btn>
            </div>

            <div class="profile-info-section">
              <!-- Profile Picture -->
              <div class="profile-picture-section">
                <v-avatar size="120" class="profile-avatar">
                  <v-img v-if="employee?.profile_picture_url" :src="employee.profile_picture_url" />
                  <span v-else class="avatar-initials">
                    {{ getInitials(employee?.first_name, employee?.last_name) }}
                  </span>
                </v-avatar>
                <v-btn
                  v-if="canEdit"
                  icon="mdi-camera"
                  size="small"
                  class="edit-picture-btn"
                  @click="showProfilePictureDialog = true"
                >
                </v-btn>
              </div>

              <!-- Basic Info -->
              <div class="profile-basic-info">
                <h2 class="employee-name">
                  {{ getFullName(employee) }}
                </h2>
                
                <div class="meta-info">
                  <v-chip v-if="employee?.employee_code" size="small" class="mr-2">
                    <v-icon start>mdi-badge-account</v-icon>
                    {{ employee.employee_code }}
                  </v-chip>
                  
                  <v-chip
                    v-if="employmentStatus"
                    :color="getStatusColor(employmentStatus)"
                    size="small"
                    class="mr-2"
                  >
                    {{ employmentStatus }}
                  </v-chip>
                </div>

                <div class="contact-info">
                  <div v-if="currentAddress" class="info-item">
                    <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                    <span>{{ formatAddress(currentAddress) }}</span>
                  </div>
                  
                  <div v-if="employee?.phone" class="info-item">
                    <v-icon size="small" class="mr-1">mdi-phone</v-icon>
                    <a :href="`tel:${employee.phone}`">{{ employee.phone }}</a>
                  </div>
                  
                  <div v-if="employee?.email" class="info-item">
                    <v-icon size="small" class="mr-1">mdi-email</v-icon>
                    <a :href="`mailto:${employee.email}`">{{ employee.email }}</a>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="header-actions">
                <v-btn
                  v-if="canEdit && (activeTab === 'personal' || activeTab === 'official')"
                  :color="isEditing ? 'error' : 'primary'"
                  :prepend-icon="isEditing ? 'mdi-close' : 'mdi-pencil'"
                  @click="toggleEditMode"
                  size="small"
                >
                  {{ isEditing ? 'Cancel' : getEditButtonText }}
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Profile Completeness -->
          <ProfileCompleteness
            v-if="profileCompleteness"
            :data="profileCompleteness"
            class="mt-4"
          />
        </v-card-text>
      </v-card>
    </div>

    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <!-- Tabs Section -->
    <v-card v-if="!loading && employee" class="mt-4">
      <v-tabs v-model="activeTab" bg-color="grey-lighten-4">
        <v-tab value="personal">Personal Details</v-tab>
        <v-tab value="official">Official Details</v-tab>
        <v-tab value="employment">Employment Details</v-tab>
        <v-tab value="education">Education Details</v-tab>
        <v-tab value="nominee">Nominee Details</v-tab>
        <v-tab value="certificate">Certificate Details</v-tab>
        <v-tab v-if="hasResignation" value="exit-details">Exit Details</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <!-- Personal Details Tab -->
          <v-window-item value="personal">
            <PersonalDetailsTab
              v-if="employee"
              ref="personalDetailsRef"
              :employee="employee"
              :current-address="currentAddress"
              :permanent-address="permanentAddress"
              :edit-mode="isEditingPersonal"
              @refresh="loadEmployeeData"
            />
            
            <!-- Save/Reset Buttons -->
            <div v-if="isEditingPersonal" class="form-actions-bottom">
              <v-btn
                color="primary"
                size="large"
                :loading="saving"
                :disabled="saving"
                @click="savePersonalDetails"
                class="px-8"
              >
                {{ saving ? 'Saving' : 'Save' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                :disabled="saving"
                @click="resetPersonalDetails"
                class="px-8"
              >
                Reset
              </v-btn>
            </div>
          </v-window-item>

          <!-- Official Details Tab -->
          <v-window-item value="official">
            <OfficialDetailsTab
              v-if="employee"
              ref="officialDetailsRef"
              :employee="employee"
              :edit-mode="isEditingOfficial"
              @refresh="loadEmployeeData"
            />
            
            <!-- Save/Reset Buttons -->
            <div v-if="isEditingOfficial" class="form-actions-bottom">
              <v-btn
                color="primary"
                size="large"
                :loading="saving"
                :disabled="saving"
                @click="saveOfficialDetails"
                class="px-8"
              >
                {{ saving ? 'Saving' : 'Save' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                :disabled="saving"
                @click="resetOfficialDetails"
                class="px-8"
              >
                Reset
              </v-btn>
            </div>
          </v-window-item>

          <!-- Employment Details Tab -->
          <v-window-item value="employment">
            <EmploymentDetailsTab
              v-if="employee"
              :employee="employee"
              :can-edit="canEdit"
              @refresh="loadEmployeeData"
            />
          </v-window-item>

          <!-- Education Details Tab -->
          <v-window-item value="education">
            <QualificationForm
              v-if="employee?.id"
              :employee-id="employee.id"
              @refresh="loadEmployeeData"
            />
            <div v-else class="pa-4">Loading education details...</div>
          </v-window-item>

          <!-- Nominee Details Tab -->
          <v-window-item value="nominee">
            <NomineeForm
              v-if="employee?.id"
              :employee-id="employee.id"
              @refresh="loadEmployeeData"
            />
            <div v-else class="pa-4">Loading nominee details...</div>
          </v-window-item>

          <!-- Certificate Details Tab -->
          <v-window-item value="certificate">
            <CertificateForm
              v-if="employee?.id"
              :employee-id="employee.id"
              @refresh="loadEmployeeData"
            />
            <div v-else class="pa-4">Loading certificate details...</div>
          </v-window-item>

          <!-- Exit Details Tab -->
          <v-window-item v-if="hasResignation" value="exit-details">
            <ExitDetailsTab
              v-if="employee?.id"
              :employee-id="employee.id"
            />
            <div v-else class="pa-4">Loading exit details...</div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Profile Picture Upload Dialog -->
    <v-dialog v-model="showProfilePictureDialog" max-width="500">
      <v-card>
        <v-card-title>Update Profile Picture</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-3">
            <v-btn
              color="primary"
              prepend-icon="mdi-camera"
              @click="triggerFileInput"
              block
            >
              Select Image
            </v-btn>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onFileSelected"
            />
            <v-alert
              v-if="selectedFileName"
              type="info"
              density="compact"
              class="mb-0"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-file-image</v-icon>
                  <span>{{ selectedFileName }}</span>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ formatFileSize(selectedFileSize) }}
                </div>
              </div>
            </v-alert>
            <v-alert
              v-else
              type="warning"
              density="compact"
              class="mb-0"
            >
              No file selected
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelUpload">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="uploadProfilePicture" 
            :loading="uploading"
            :disabled="!selectedFile"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Employee, Address, BankDetails, ProfileCompleteness as ProfileCompletenessType } from '@/types/employee';
import { exitEmployeeApi } from '@/api/exitEmployeeApi';
import ProfileCompleteness from './ProfileCompleteness.vue';
import PersonalDetailsTab from './tabs/PersonalDetailsTab.vue';
import OfficialDetailsTab from './tabs/OfficialDetailsTab.vue';
import EmploymentDetailsTab from './tabs/EmploymentDetailsTab.vue';
import ExitDetailsTab from './tabs/ExitDetailsTab.vue';
import QualificationForm from './QualificationForm.vue';
import NomineeForm from './NomineeForm.vue';
import CertificateForm from './CertificateForm.vue';

const props = defineProps<{
  employeeId?: number; // Optional - defaults to current user
}>();

const router = useRouter();
const route = useRoute();
const { user } = useAuth();
const employeeStore = useEmployeeStore();

// Use provided employeeId or current user's ID
const effectiveEmployeeId = computed(() => props.employeeId || user.value?.id || 0);

const employee = ref<Employee | null>(null);
const currentAddress = ref<Address | null>(null);
const permanentAddress = ref<Address | null>(null);
const bankDetails = ref<BankDetails[]>([]);
const profileCompleteness = ref<ProfileCompletenessType | null>(null);
const loading = ref(true);
const activeTab = ref('personal');
const showProfilePictureDialog = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const selectedFileName = ref('');
const selectedFileSize = ref(0);
const uploading = ref(false);
const isEditingPersonal = ref(false);
const isEditingOfficial = ref(false);
const saving = ref(false);
const personalDetailsRef = ref<any>(null);
const officialDetailsRef = ref<any>(null);
const hasResignation = ref(false);

const isEditing = computed(() => {
  if (activeTab.value === 'personal') return isEditingPersonal.value;
  if (activeTab.value === 'official') return isEditingOfficial.value;
  return false;
});

const getEditButtonText = computed(() => {
  if (activeTab.value === 'personal') return 'Edit Personal Details';
  if (activeTab.value === 'official') return 'Edit Official Details';
  return 'Edit';
});

const canEdit = computed(() => {
  // TODO: Add permission check
  return true;
});

const employmentStatus = computed(() => {
  if (!employee.value) return '';
  return employee.value.employment_detail?.employment_status || 
         employee.value.employment_status || 
         'Active';
});

onMounted(async () => {
  // Check for tab parameter in URL
  if (route.query.tab) {
    activeTab.value = route.query.tab as string;
  }
  
  await Promise.all([
    loadEmployeeData(),
    checkResignationStatus()
  ]);
});

async function loadEmployeeData() {
  loading.value = true;
  try {
    // Load employee basic info
    employee.value = await employeeStore.fetchEmployeeById(effectiveEmployeeId.value);
    
    // Load addresses
    const addressesData = await employeeStore.fetchAddresses(effectiveEmployeeId.value);
    // API returns { current, permanent }, not an array
    currentAddress.value = addressesData.current || null;
    permanentAddress.value = addressesData.permanent || null;
    
    // Load bank details
    bankDetails.value = await employeeStore.fetchBankDetails(effectiveEmployeeId.value);
    
    // Load profile completeness
    profileCompleteness.value = await employeeStore.getProfileCompleteness(effectiveEmployeeId.value);
  } catch (error) {
    console.error('Failed to load employee data:', error);
  } finally {
    loading.value = false;
  }
}

async function checkResignationStatus() {
  try {
    console.log('🔍 Checking resignation status for employee:', effectiveEmployeeId.value);
    const response = await exitEmployeeApi.isResignationExist(effectiveEmployeeId.value);
    console.log('📥 Resignation API response:', response.data);
    
    if (response.data.StatusCode === 200) {
      const resignationData = response.data.Data;
      console.log('📋 Resignation data:', resignationData);
      console.log('✅ Exists?', resignationData?.Exists);
      
      // Show tab if ANY resignation exists
      hasResignation.value = resignationData?.Exists === true;
      console.log('🏷️ hasResignation set to:', hasResignation.value);
    } else {
      console.warn('⚠️ Non-200 status code:', response.data.StatusCode);
    }
  } catch (error) {
    console.error('❌ Error checking resignation status:', error);
    // If there's an error, still check if we should show the tab based on user permissions
    hasResignation.value = false;
  }
}

function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return 'NA';
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase();
}

function getFullName(emp?: Employee | null): string {
  if (!emp) return '';
  const parts = [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean);
  return parts.join(' ');
}

function formatAddress(address: Address): string {
  const parts = [
    address.city_name,
    address.state_name
  ].filter(Boolean);
  return parts.join(', ');
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return 'default';
  const statusLower = status.toLowerCase();
  if (statusLower.includes('active')) return 'success';
  if (statusLower.includes('inactive')) return 'warning';
  if (statusLower.includes('terminated') || statusLower.includes('resigned')) return 'error';
  return 'default';
}

function goBack() {
  // If viewing own profile, go to dashboard, otherwise go to employee list
  if (!props.employeeId || props.employeeId === user.value?.id) {
    router.push('/dashboard');
  } else {
    router.push('/employees/list');
  }
}

function toggleEditMode() {
  if (activeTab.value === 'personal') {
    isEditingPersonal.value = !isEditingPersonal.value;
    if (!isEditingPersonal.value) {
      personalDetailsRef.value?.reset();
    }
  } else if (activeTab.value === 'official') {
    isEditingOfficial.value = !isEditingOfficial.value;
    if (!isEditingOfficial.value) {
      officialDetailsRef.value?.reset();
    }
  }
}

// Watch active tab and cancel edit mode when switching tabs
watch(activeTab, () => {
  if (isEditingPersonal.value) {
    isEditingPersonal.value = false;
    personalDetailsRef.value?.reset();
  }
  if (isEditingOfficial.value) {
    isEditingOfficial.value = false;
    officialDetailsRef.value?.reset();
  }
});

async function savePersonalDetails() {
  if (!personalDetailsRef.value) return;
  
  // Validate
  const isValid = await personalDetailsRef.value.validate();
  if (!isValid) {
    alert('Please fix validation errors before saving.');
    return;
  }
  
  saving.value = true;
  try {
    const data = personalDetailsRef.value.getData();
    
    console.log('Raw data from PersonalDetailsTab:', data.employee);
    
    // Save personal details - ensure empty strings are sent, not undefined
    const updateData = {
      first_name: data.employee.first_name?.trim() || '',
      middle_name: data.employee.middle_name?.trim() || '',
      last_name: data.employee.last_name?.trim() || '',
      father_name: data.employee.father_name?.trim() || '',
      gender: data.employee.gender,
      dob: data.employee.dob,
      blood_group: data.employee.blood_group || '',
      marital_status: data.employee.marital_status,
      nationality: data.employee.nationality?.trim() || '',
      phone: data.employee.phone?.trim() || '',
      alternate_phone: data.employee.alternate_phone?.trim() || '',
      personal_email: data.employee.personal_email?.trim() || '',
      emergency_contact_person: data.employee.emergency_contact_person?.trim() || '',
      emergency_contact_no: data.employee.emergency_contact_no?.trim() || '',
      interest: data.employee.interest?.trim() || ''
    };
    
    console.log('Update data being sent to API:', updateData);
    
    await employeeStore.updateEmployee(effectiveEmployeeId.value, updateData);
    
    // Save current address
    if (data.currentAddress) {
      console.log('Saving current address:', data.currentAddress);
      await employeeStore.saveCurrentAddress({
        ...data.currentAddress,
        employee_id: effectiveEmployeeId.value,
        address_type: 1
      });
    }
    
    // Save permanent address
    if (data.permanentAddress) {
      console.log('Saving permanent address:', data.permanentAddress);
      await employeeStore.savePermanentAddress({
        ...data.permanentAddress,
        employee_id: effectiveEmployeeId.value,
        address_type: 2
      });
    } else {
      console.log('No permanent address data to save');
    }
    
    isEditingPersonal.value = false;
    await loadEmployeeData();
    alert('Personal details updated successfully!');
  } catch (error: any) {
    console.error('Failed to save personal details:', error);
    alert(error.response?.data?.message || error.message || 'Failed to save personal details');
  } finally {
    saving.value = false;
  }
}

function resetPersonalDetails() {
  personalDetailsRef.value?.reset();
}

async function saveOfficialDetails() {
  if (!officialDetailsRef.value) return;
  
  const isValid = await officialDetailsRef.value.validate();
  if (!isValid) {
    alert('Please fix validation errors before saving.');
    return;
  }
  
  saving.value = true;
  try {
    const data = officialDetailsRef.value.getData();
    console.log('Official details data to save:', data);
    
    await employeeStore.updateEmployee(effectiveEmployeeId.value, data);
    
    isEditingOfficial.value = false;
    await loadEmployeeData();
    alert('Official details updated successfully!');
  } catch (error: any) {
    console.error('Failed to save official details:', error);
    alert(error.response?.data?.message || error.message || 'Failed to save official details');
  } finally {
    saving.value = false;
  }
}

function resetOfficialDetails() {
  officialDetailsRef.value?.reset();
}

async function handleSave() {
  if (activeTab.value === 'personal') {
    await savePersonalDetails();
  } else if (activeTab.value === 'official') {
    await saveOfficialDetails();
  }
}

function handleReset() {
  if (activeTab.value === 'personal') {
    resetPersonalDetails();
  } else if (activeTab.value === 'official') {
    resetOfficialDetails();
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (1MB = 1048576 bytes)
    const maxSize = 1048576; // 1MB
    if (file.size > maxSize) {
      alert(`File size must be less than ${formatFileSize(maxSize)}`);
      return;
    }
    
    selectedFile.value = file;
    selectedFileName.value = file.name;
    selectedFileSize.value = file.size;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function cancelUpload() {
  showProfilePictureDialog.value = false;
  selectedFile.value = null;
  selectedFileName.value = '';
  selectedFileSize.value = 0;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

async function uploadProfilePicture() {
  if (!selectedFile.value) {
    alert('Please select a file first');
    return;
  }
  
  uploading.value = true;
  try {
    // Check if employee already has a profile picture (use update instead of upload)
    if (employee.value?.file_name) {
      await employeeStore.updateProfilePicture(props.employeeId, selectedFile.value);
    } else {
      await employeeStore.uploadProfilePicture(props.employeeId, selectedFile.value);
    }
    
    showProfilePictureDialog.value = false;
    selectedFile.value = null;
    selectedFileName.value = '';
    selectedFileSize.value = 0;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    await loadEmployeeData();
    alert('Profile picture uploaded successfully!');
  } catch (error: any) {
    console.error('Failed to upload profile picture:', error);
    alert(error.message || 'Failed to upload profile picture');
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.employee-profile-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.profile-header {
  margin-bottom: 0;
}

.header-card {
  border-radius: 0;
  box-shadow: none;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.back-button-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.profile-info-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.profile-picture-section {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  border: 3px solid #f0f0f0;
  box-shadow: none;
}

.avatar-initials {
  font-size: 40px;
  font-weight: 600;
  color: #1E75BB;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-picture-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-basic-info {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-size: 22px;
  font-weight: 500;
  color: #273a50;
  margin-bottom: 12px;
}

.meta-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4b535b;
  font-size: 14px;
}

.info-item a {
  color: #4b535b;
  text-decoration: none;
}

.info-item a:hover {
  color: #1E75BB;
  text-decoration: underline;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* Tabs Styling */
:deep(.v-tabs) {
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

:deep(.v-tab--selected) {
  color: #1976d2;
}

:deep(.v-card) {
  box-shadow: none !important;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

@media (max-width: 960px) {
  .profile-info-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .contact-info {
    justify-content: center;
  }
  
  .employee-profile-container {
    padding: 16px;
  }
}

.form-actions-bottom {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
