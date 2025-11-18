<template>
  <div class="personal-details-tab">

    <!-- Personal Information Section -->
    <v-card class="details-card" elevation="0">
      <v-card-text class="pa-8">
            <v-form v-if="editMode" ref="personalForm">
              <!-- Name fields - 3 column grid -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.first_name"
                      label="First Name"
                      :rules="[rules.required, rules.name, rules.minCharacters]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.middle_name"
                      label="Middle Name"
                      :rules="[rules.name, rules.minCharacters]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.last_name"
                      label="Last Name"
                      :rules="[rules.required, rules.name, rules.minCharacters]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Email (disabled), DOB, Gender -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <v-text-field
                      :model-value="employee?.employment_detail?.email"
                      label="Email"
                      variant="outlined"
                      density="comfortable"
                      disabled
                      hint="Work email cannot be changed"
                      persistent-hint
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.dob"
                      label="Date of Birth"
                      type="date"
                      :rules="[rules.required, rules.pastDate]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="editedEmployee.gender"
                      label="Gender"
                      :items="genderOptions"
                      item-title="label"
                      item-value="value"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Blood Group, Marital Status, Nationality -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="editedEmployee.blood_group"
                      label="Blood Group"
                      :items="bloodGroups"
                      variant="outlined"
                      density="comfortable"
                      clearable
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="editedEmployee.marital_status"
                      label="Marital Status"
                      :items="maritalStatusOptions"
                      item-title="label"
                      item-value="value"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.nationality"
                      label="Nationality"
                      :rules="[rules.required, rules.alphabets, rules.minCharacters]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Father Name, Phone, Alternate Phone -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.father_name"
                      label="Father Name"
                      :rules="[rules.required, rules.name, rules.minCharacters]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.phone"
                      label="Phone Number"
                      :rules="[rules.required, rules.phoneWithCountry]"
                      variant="outlined"
                      density="comfortable"
                      placeholder="+91 1234567890"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.alternate_phone"
                      label="Alternate Phone Number"
                      :rules="[rules.phoneWithCountry]"
                      variant="outlined"
                      density="comfortable"
                      placeholder="+91 1234567890"
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Emergency Contact, Personal Email -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.emergency_contact_person"
                      label="Emergency Contact Person"
                      :rules="[rules.required, rules.name, rules.minCharacters]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.emergency_contact_no"
                      label="Emergency Contact Number"
                      :rules="[rules.required, rules.phoneWithCountry]"
                      variant="outlined"
                      density="comfortable"
                      placeholder="+91 1234567890"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedEmployee.personal_email"
                      label="Secondary Email"
                      :rules="[rules.required, rules.email, rules.emailLength]"
                      variant="outlined"
                      density="comfortable"
                      required
                    />
                  </v-col>
                </v-row>
              </div>

            </v-form>

            <!-- Display Mode -->
            <div v-else class="display-mode">
              <!-- Row 1 -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>First Name</label>
                      <div class="value">{{ employee?.first_name || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Middle Name</label>
                      <div class="value">{{ employee?.middle_name || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Last Name</label>
                      <div class="value">{{ employee?.last_name || 'N/A' }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Row 2 -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Email</label>
                      <div class="value">{{ employee?.employment_detail?.email || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Date of Birth</label>
                      <div class="value">{{ formatDate(employee?.dob) || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Gender</label>
                      <div class="value">{{ getGenderName(employee?.gender) }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Row 3 -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Blood Group</label>
                      <div class="value">{{ employee?.blood_group || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Marital Status</label>
                      <div class="value">{{ getMaritalStatus(employee?.marital_status) }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Nationality</label>
                      <div class="value">{{ employee?.nationality || 'N/A' }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Row 4 -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Father Name</label>
                      <div class="value">{{ employee?.father_name || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Phone Number</label>
                      <div class="value">{{ employee?.phone || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Alternate Phone Number</label>
                      <div class="value">{{ employee?.alternate_phone || 'N/A' }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Row 5 -->
              <div class="form-section">
                <v-row class="form-row">
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Emergency Contact Person</label>
                      <div class="value">{{ employee?.emergency_contact_person || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Emergency Contact Number</label>
                      <div class="value">{{ employee?.emergency_contact_no || 'N/A' }}</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-field">
                      <label>Secondary Email</label>
                      <div class="value">{{ employee?.personal_email || 'N/A' }}</div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-card-text>
        </v-card>

    <!-- Address Information -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="address-card" elevation="0">
          <v-card-title class="section-header">Current Address</v-card-title>
          <v-card-text>
            <AddressForm
              v-if="employee?.id"
              :key="`current-${editMode}`"
              :address-data="editMode ? editedCurrentAddress : currentAddress"
              :edit-mode="editMode"
              @update="editedCurrentAddress = $event"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="address-card" elevation="0">
          <v-card-title class="section-header">
            <div class="d-flex justify-space-between align-center">
              <span>Permanent Address</span>
              <v-btn
                v-if="editMode && currentAddress"
                size="small"
                variant="text"
                color="primary"
                @click="copyCurrentToPermanent"
              >
                Copy from Current
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <AddressForm
              v-if="employee?.id"
              :key="`permanent-${editMode}`"
              :address-data="editMode ? editedPermanentAddress : permanentAddress"
              :edit-mode="editMode"
              @update="editedPermanentAddress = $event"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Documents Section -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="documents-card" elevation="0">
          <v-card-title class="section-header">Documents</v-card-title>
          <v-card-text>
            <DocumentUpload
              v-if="employee?.id"
              :employee-id="employee.id"
              @refresh="$emit('refresh')"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Employee, Address } from '@/types/employee';
import { useEmployeeStore } from '@/stores/employeeStore';
import AddressForm from '../AddressForm.vue';
import DocumentUpload from '../DocumentUpload.vue';

const props = defineProps<{
  employee: Employee | null;
  currentAddress: Address | null;
  permanentAddress: Address | null;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const employeeStore = useEmployeeStore();

const editedEmployee = ref<Partial<Employee>>({});
const editedCurrentAddress = ref<Partial<Address>>({});
const editedPermanentAddress = ref<Partial<Address>>({});
const personalForm = ref<any>(null);

const genderOptions = [
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Other', value: 3 }
];

const maritalStatusOptions = [
  { label: 'Single', value: 1 },
  { label: 'Married', value: 2 },
  { label: 'Other', value: 3 }
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Enhanced validation rules (matching legacy)
const rules = {
  required: (v: any) => !!v || 'This field is required',
  email: (v: string) => {
    if (!v) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v) || 'Please enter a valid email address';
  },
  emailLength: (v: string) => {
    if (!v) return true;
    if (v.length < 8) return 'Email must be at least 8 characters long';
    if (v.length > 50) return 'Email cannot exceed 50 characters';
    return true;
  },
  phone: (v: string) => !v || /^[\d\s-]+$/.test(v) || 'Invalid phone number',
  phoneWithCountry: (v: string) => {
    if (!v) return true;
    if (!v.includes('+1') && !v.includes('+91')) {
      return 'Please include country code (+91 or +1)';
    }
    const phoneRegex = /^\+(?:1|91)\s?\d{10}$/;
    return phoneRegex.test(v.replace(/\s+/g, ' ')) || 'Invalid phone format (use +91 1234567890)';
  },
  name: (v: string) => {
    if (!v) return true;
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(v)) return 'Only letters, spaces, hyphens and apostrophes allowed';
    if (/^\d+$/.test(v)) return 'Name cannot be only numbers';
    return true;
  },
  alphabets: (v: string) => {
    if (!v) return true;
    return /^[a-zA-Z\s]+$/.test(v) || 'Only alphabets and spaces allowed';
  },
  minCharacters: (v: string) => {
    if (!v) return true;
    const letterCount = (v.match(/[a-zA-Z]/g) || []).length;
    return letterCount >= 2 || 'Must contain at least 2 alphabetic characters';
  },
  pastDate: (v: string) => {
    if (!v) return true;
    const selectedDate = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today || 'Date of birth must be in the past';
  }
};

const getFullName = computed(() => {
  if (!props.employee) return 'N/A';
  const parts = [props.employee.first_name, props.employee.middle_name, props.employee.last_name].filter(Boolean);
  return parts.join(' ');
});

const getInitials = computed(() => {
  if (!props.employee) return 'NA';
  const first = props.employee.first_name?.charAt(0) || '';
  const last = props.employee.last_name?.charAt(0) || '';
  return (first + last).toUpperCase();
});

const hasUnsavedChanges = computed(() => {
  if (!props.editMode || !props.employee) return false;
  
  const fields = [
    'first_name', 'middle_name', 'last_name', 'father_name',
    'gender', 'dob', 'blood_group', 'marital_status', 'nationality',
    'phone', 'alternate_phone', 'personal_email',
    'emergency_contact_person', 'emergency_contact_no', 'interest'
  ];
  
  return fields.some(field => {
    const original = props.employee![field as keyof Employee];
    const edited = editedEmployee.value[field as keyof Employee];
    return original !== edited;
  });
});

watch(() => props.employee, (newVal) => {
  if (newVal) {
    editedEmployee.value = { ...newVal };
  }
}, { immediate: true });

watch(() => props.currentAddress, (newVal) => {
  if (newVal) {
    editedCurrentAddress.value = { ...newVal };
  } else {
    editedCurrentAddress.value = {};
  }
}, { immediate: true });

watch(() => props.permanentAddress, (newVal) => {
  if (newVal) {
    editedPermanentAddress.value = { ...newVal };
  } else {
    // Initialize with empty object to allow editing even when no data exists
    editedPermanentAddress.value = {};
  }
}, { immediate: true });

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
    3: 'Other'
  };
  return status ? statusMap[status] : 'N/A';
}

async function savePersonalDetails() {
  if (!props.employee?.id) return;
  
  // Validate form first
  const form = personalForm.value as any;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      console.log('Form validation failed');
      return false;
    }
  }
  
  // Return validation success
  return true;
}

function resetForm() {
  if (props.employee) {
    editedEmployee.value = { ...props.employee };
  }
  if (props.currentAddress) {
    editedCurrentAddress.value = { ...props.currentAddress };
  } else {
    editedCurrentAddress.value = {};
  }
  if (props.permanentAddress) {
    editedPermanentAddress.value = { ...props.permanentAddress };
  } else {
    // Allow editing even when no permanent address exists
    editedPermanentAddress.value = {};
  }
  // Reset form validation
  const form = personalForm.value as any;
  if (form) {
    form.resetValidation();
  }
}

async function copyCurrentToPermanent() {
  if (props.currentAddress) {
    editedPermanentAddress.value = { ...props.currentAddress, address_type: 2 };
  }
}

function openProfilePictureDialog() {
  // TODO: Implement profile picture upload dialog
  showInfo('Profile picture upload coming soon');
}

// Toast notification helpers (to be replaced with proper toast library)
function showSuccess(message: string) {
  console.log('✅ Success:', message);
  alert(message); // Temporary - should use toast library
}

function showError(message: string) {
  console.error('❌ Error:', message);
  alert(message); // Temporary - should use toast library
}

function showInfo(message: string) {
  console.log('ℹ️ Info:', message);
  alert(message); // Temporary - should use toast library
}

// Expose methods to parent
defineExpose({
  validate: savePersonalDetails,
  reset: resetForm,
  getData: () => {
    const data = {
      employee: editedEmployee.value,
      currentAddress: editedCurrentAddress.value,
      permanentAddress: editedPermanentAddress.value
    };
    console.log('PersonalDetailsTab getData called:', data);
    return data;
  }
});
</script>

<style scoped>
.personal-details-tab {
  padding: 0;
}

/* Card Styling */
.details-card,
.address-card,
.documents-card {
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
.form-section {
  margin-bottom: 16px;
}

.form-row {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
}

/* Display Mode */
.display-mode {
  padding: 0;
}

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

/* Vuetify Override */
:deep(.v-field) {
  border-radius: 6px;
}

:deep(.v-field--outlined) {
  border-color: #ddd;
}

:deep(.v-field--focused) {
  border-color: #1976d2;
}

:deep(.v-label) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.v-field__input) {
  min-height: 40px;
  padding: 10px 12px;
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
