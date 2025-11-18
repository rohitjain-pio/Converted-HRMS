<template>
  <div class="employee-form-container">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
        </svg>
        Back
      </button>
      <h2>{{ isEditMode ? 'Edit Employee' : 'Add Employee' }}</h2>
    </div>

    <!-- Progress Steps -->
    <div class="progress-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ 
          'active': currentStep === index, 
          'completed': index < currentStep 
        }"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <form @submit.prevent="handleNext">
        <!-- Step 1: Personal Information -->
        <div v-if="currentStep === 0" class="form-step">
          <h3 class="step-title">Personal Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="required">First Name</label>
              <input 
                v-model="formData.first_name" 
                type="text" 
                class="form-control"
                :class="{ 'error': errors.first_name }"
                required
              />
              <span v-if="errors.first_name" class="error-message">{{ errors.first_name }}</span>
            </div>

            <div class="form-group">
              <label>Middle Name</label>
              <input 
                v-model="formData.middle_name" 
                type="text" 
                class="form-control"
                :class="{ 'error': errors.middle_name }"
              />
              <span v-if="errors.middle_name" class="error-message">{{ errors.middle_name }}</span>
            </div>

            <div class="form-group">
              <label class="required">Last Name</label>
              <input 
                v-model="formData.last_name" 
                type="text" 
                class="form-control"
                :class="{ 'error': errors.last_name }"
                required
              />
              <span v-if="errors.last_name" class="error-message">{{ errors.last_name }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Father's Name</label>
              <input 
                v-model="formData.father_name" 
                type="text" 
                class="form-control"
                :class="{ 'error': errors.father_name }"
              />
              <span v-if="errors.father_name" class="error-message">{{ errors.father_name }}</span>
            </div>

            <div class="form-group">
              <label>Date of Birth</label>
              <input 
                v-model="formData.dob" 
                type="date" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Gender</label>
              <select v-model.number="formData.gender" class="form-control">
                <option :value="undefined">Select Gender</option>
                <option :value="1">Male</option>
                <option :value="2">Female</option>
                <option :value="3">Other</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Blood Group</label>
              <select v-model="formData.blood_group" class="form-control">
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div class="form-group">
              <label>Marital Status</label>
              <select v-model.number="formData.marital_status" class="form-control">
                <option :value="undefined">Select Status</option>
                <option :value="1">Single</option>
                <option :value="2">Married</option>
                <option :value="3">Divorced</option>
                <option :value="4">Widowed</option>
              </select>
            </div>

            <div class="form-group" v-if="formData.marital_status === 2">
              <label>Marriage Date</label>
              <input 
                v-model="formData.marriage_date" 
                type="date" 
                class="form-control"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>PAN Number</label>
              <input 
                v-model="formData.pan_no" 
                type="text" 
                class="form-control"
                :class="{ 'error': errors.pan_no }"
                maxlength="10"
                @input="formatPAN"
              />
              <span v-if="errors.pan_no" class="error-message">{{ errors.pan_no }}</span>
            </div>

            <div class="form-group">
              <label>Aadhaar Number</label>
              <input 
                v-model="formData.aadhaar_no" 
                type="text" 
                class="form-control"
                :class="{ 'error': errors.aadhaar_no }"
                maxlength="12"
              />
              <span v-if="errors.aadhaar_no" class="error-message">{{ errors.aadhaar_no }}</span>
            </div>

            <div class="form-group">
              <label>UAN Number</label>
              <input 
                v-model="formData.uan_no" 
                type="text" 
                class="form-control"
              />
            </div>
          </div>
        </div>

        <!-- Step 2: Contact Information -->
        <div v-if="currentStep === 1" class="form-step">
          <h3 class="step-title">Contact Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="required">Email (Official)</label>
              <input 
                v-model="formData.email" 
                type="email" 
                class="form-control"
                :class="{ 'error': errors.email }"
                required
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label>Personal Email</label>
              <input 
                v-model="formData.personal_email" 
                type="email" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Mobile Number</label>
              <input 
                v-model="formData.mobile_number" 
                type="tel" 
                class="form-control"
                maxlength="10"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <input 
                v-model="formData.emergency_contact_name" 
                type="text" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Emergency Contact Number</label>
              <input 
                v-model="formData.emergency_contact_number" 
                type="tel" 
                class="form-control"
                maxlength="10"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Employment Details -->
        <div v-if="currentStep === 2" class="form-step">
          <h3 class="step-title">Employment Details</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="required">Employee Code</label>
              <div class="input-with-button">
                <input 
                  v-model="formData.employee_code" 
                  type="text" 
                  class="form-control"
                  :class="{ 'error': errors.employee_code }"
                  required
                  :disabled="isEditMode"
                />
                <button 
                  v-if="!isEditMode"
                  type="button" 
                  @click="generateEmployeeCode"
                  class="btn-generate"
                  :disabled="generatingCode"
                >
                  {{ generatingCode ? 'Generating...' : 'Generate' }}
                </button>
              </div>
              <span v-if="errors.employee_code" class="error-message">{{ errors.employee_code }}</span>
            </div>

            <div class="form-group">
              <label class="required">Designation</label>
              <select 
                v-model.number="formData.designation_id" 
                class="form-control"
                :class="{ 'error': errors.designation_id }"
                required
              >
                <option :value="undefined">Select Designation</option>
                <option 
                  v-for="designation in employeeStore.designations" 
                  :key="designation.id"
                  :value="designation.id"
                >
                  {{ designation.name || designation.designation }}
                </option>
              </select>
              <span v-if="errors.designation_id" class="error-message">{{ errors.designation_id }}</span>
            </div>

            <div class="form-group">
              <label class="required">Department</label>
              <select 
                v-model.number="formData.department_id" 
                class="form-control"
                :class="{ 'error': errors.department_id }"
                required
              >
                <option :value="undefined">Select Department</option>
                <option 
                  v-for="department in employeeStore.departments" 
                  :key="department.id"
                  :value="department.id"
                >
                  {{ department.name || department.department }}
                </option>
              </select>
              <span v-if="errors.department_id" class="error-message">{{ errors.department_id }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="required">Team</label>
              <select 
                v-model.number="formData.team_id" 
                class="form-control"
                :class="{ 'error': errors.team_id }"
                required
              >
                <option :value="undefined">Select Team</option>
                <option 
                  v-for="team in employeeStore.teams" 
                  :key="team.id"
                  :value="team.id"
                >
                  {{ team.name || team.team_name }}
                </option>
              </select>
              <span v-if="errors.team_id" class="error-message">{{ errors.team_id }}</span>
            </div>

            <div class="form-group">
              <label class="required">Reporting Manager</label>
              <select 
                v-model.number="formData.reporting_manager_id" 
                class="form-control"
                :class="{ 'error': errors.reporting_manager_id }"
                required
              >
                <option :value="undefined">Select Manager</option>
                <option 
                  v-for="emp in employeeStore.employees" 
                  :key="emp.id"
                  :value="emp.id"
                >
                  {{ [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ') }}
                </option>
              </select>
              <span v-if="errors.reporting_manager_id" class="error-message">{{ errors.reporting_manager_id }}</span>
            </div>

            <div class="form-group">
              <label class="required">Employment Status</label>
              <select 
                v-model.number="formData.employment_status" 
                class="form-control"
                required
              >
                <option :value="undefined">Select Status</option>
                <option :value="1">Probation</option>
                <option :value="2">Confirmed</option>
                <option :value="3">Training</option>
                <option :value="4">Notice Period</option>
                <option :value="5">Absconded</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="required">Joining Date</label>
              <input 
                v-model="formData.joining_date" 
                type="date" 
                class="form-control"
                :class="{ 'error': errors.joining_date }"
                required
              />
              <span v-if="errors.joining_date" class="error-message">{{ errors.joining_date }}</span>
            </div>

            <div class="form-group">
              <label class="required">Job Type</label>
              <select 
                v-model.number="formData.job_type" 
                class="form-control"
                required
              >
                <option :value="undefined">Select Job Type</option>
                <option :value="1">Probation</option>
                <option :value="2">Confirmed</option>
                <option :value="3">Training</option>
              </select>
            </div>

            <div class="form-group">
              <label>Time Doctor User ID</label>
              <input 
                v-model="formData.time_doctor_user_id" 
                type="text" 
                class="form-control"
              />
            </div>
          </div>

          <!-- Branch Selection - ADDED MISSING FIELD -->
          <div class="form-row">
            <div class="form-group">
              <label class="required">Branch</label>
              <select 
                v-model.number="formData.branch_id" 
                class="form-control"
                :class="{ 'error': errors.branch_id }"
                required
              >
                <option :value="undefined">Select Branch</option>
                <option :value="1">Hyderabad</option>
                <option :value="2">Jaipur</option>
                <option :value="3">Pune</option>
              </select>
              <span v-if="errors.branch_id" class="error-message">{{ errors.branch_id }}</span>
            </div>
          </div>

          <!-- Background Verification Section - ADDED MISSING SECTION -->
          <div class="form-section-divider"></div>
          <h4 class="subsection-title">Background Verification</h4>
          
          <div class="form-row">
            <div class="form-group">
              <label class="required">Background Verification Status</label>
              <select 
                v-model.number="formData.background_verificationstatus" 
                class="form-control"
                :class="{ 'error': errors.background_verificationstatus }"
                required
              >
                <option :value="undefined">Select Status</option>
                <option :value="1">Pending</option>
                <option :value="2">Successful</option>
                <option :value="3">Unsuccessful</option>
              </select>
              <span v-if="errors.background_verificationstatus" class="error-message">
                {{ errors.background_verificationstatus }}
              </span>
            </div>

            <div class="form-group">
              <label class="required">Criminal Verification</label>
              <select 
                v-model.number="formData.criminal_verification" 
                class="form-control"
                :class="{ 'error': errors.criminal_verification }"
                required
              >
                <option :value="undefined">Select Status</option>
                <option :value="1">Pending</option>
                <option :value="2">Completed</option>
              </select>
              <span v-if="errors.criminal_verification" class="error-message">
                {{ errors.criminal_verification }}
              </span>
            </div>
          </div>

          <!-- Experience Details Section - ADDED MISSING SECTION -->
          <div class="form-section-divider"></div>
          <h4 class="subsection-title">Experience Details</h4>
          
          <div class="form-row">
            <div class="form-group">
              <label class="required">Total Experience</label>
              <div class="experience-row">
                <input 
                  v-model.number="formData.total_experience_year" 
                  type="number" 
                  class="form-control"
                  :class="{ 'error': errors.total_experience_year }"
                  placeholder="Years"
                  min="0"
                  max="40"
                  required
                />
                <span class="separator">-</span>
                <input 
                  v-model.number="formData.total_experience_month" 
                  type="number" 
                  class="form-control"
                  :class="{ 'error': errors.total_experience_month }"
                  placeholder="Months"
                  min="0"
                  max="11"
                  required
                />
              </div>
              <span v-if="errors.total_experience_year" class="error-message">
                {{ errors.total_experience_year }}
              </span>
              <span v-if="errors.total_experience_month" class="error-message">
                {{ errors.total_experience_month }}
              </span>
            </div>

            <div class="form-group">
              <label class="required">Relevant Experience</label>
              <div class="experience-row">
                <input 
                  v-model.number="formData.relevant_experience_year" 
                  type="number" 
                  class="form-control"
                  :class="{ 'error': errors.relevant_experience_year }"
                  placeholder="Years"
                  min="0"
                  max="40"
                  required
                />
                <span class="separator">-</span>
                <input 
                  v-model.number="formData.relevant_experience_month" 
                  type="number" 
                  class="form-control"
                  :class="{ 'error': errors.relevant_experience_month }"
                  placeholder="Months"
                  min="0"
                  max="11"
                  required
                />
              </div>
              <span v-if="errors.relevant_experience_year" class="error-message">
                {{ errors.relevant_experience_year }}
              </span>
              <span v-if="errors.relevant_experience_month" class="error-message">
                {{ errors.relevant_experience_month }}
              </span>
            </div>

            <div class="form-group">
              <label class="required">Probation Period (Months)</label>
              <input 
                v-model.number="formData.probation_months" 
                type="number" 
                class="form-control"
                :class="{ 'error': errors.probation_months }"
                placeholder="e.g., 3"
                min="1"
                max="24"
                required
              />
              <span v-if="errors.probation_months" class="error-message">
                {{ errors.probation_months }}
              </span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            v-if="currentStep > 0" 
            type="button" 
            @click="handlePrevious"
            class="btn btn-secondary"
          >
            Previous
          </button>
          
          <button 
            v-if="currentStep < steps.length - 1" 
            type="submit"
            class="btn btn-primary"
          >
            Next
          </button>
          
          <button 
            v-if="currentStep === steps.length - 1" 
            type="button"
            @click="handleSubmit"
            class="btn btn-success"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Create Employee') }}
          </button>

          <button 
            type="button" 
            @click="handleReset"
            class="btn btn-outline"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Employee } from '@/types/employee';
import {
  validateName,
  validateEmail,
  validateEmployeeCode,
  validateTimeDoctorUserId,
  validatePAN,
  validateAadhaar,
  validateExperienceYear,
  validateExperienceMonth,
  validateProbationMonths,
  validateMobileNumber
} from '@/utils/validationPatterns';

const router = useRouter();
const route = useRoute();
const employeeStore = useEmployeeStore();

const currentStep = ref(0);
const saving = ref(false);
const generatingCode = ref(false);

const steps = [
  { label: 'Personal Info' },
  { label: 'Contact Info' },
  { label: 'Employment Details' }
];

const isEditMode = computed(() => !!route.params.id);

const formData = reactive<Partial<Employee> & {
  branch_id?: number | null;
  background_verificationstatus?: number | null;
  criminal_verification?: number | null;
  total_experience_year?: number;
  total_experience_month?: number;
  relevant_experience_year?: number;
  relevant_experience_month?: number;
  probation_months?: number;
}>({
  employee_code: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  father_name: '',
  blood_group: '',
  gender: undefined,
  dob: '',
  email: '',
  personal_email: '',
  mobile_number: '',
  emergency_contact_name: '',
  emergency_contact_number: '',
  pan_no: '',
  aadhaar_no: '',
  uan_no: '',
  marital_status: undefined,
  marriage_date: '',
  time_doctor_user_id: '',
  joining_date: '',
  designation_id: undefined,
  department_id: undefined,
  team_id: undefined,
  reporting_manager_id: undefined,
  employment_status: undefined, // Changed to numeric (1-5)
  job_type: undefined, // Changed to numeric (1-3)
  branch_id: undefined, // ADDED: Missing branch field
  background_verificationstatus: undefined, // ADDED: Background verification status
  criminal_verification: undefined, // ADDED: Criminal verification
  total_experience_year: 0, // ADDED: Total experience years
  total_experience_month: 0, // ADDED: Total experience months
  relevant_experience_year: 0, // ADDED: Relevant experience years
  relevant_experience_month: 0, // ADDED: Relevant experience months
  probation_months: 0 // ADDED: Probation period in months
});

const errors = reactive<Record<string, string>>({});

onMounted(async () => {
  // Load master data
  try {
    console.log('Starting to load master data...');
    await Promise.all([
      employeeStore.loadDepartments().catch((e: any) => console.error('Departments error:', e)),
      employeeStore.loadDesignations().catch((e: any) => console.error('Designations error:', e)),
      employeeStore.loadTeams().catch((e: any) => console.error('Teams error:', e)),
      // TODO: Implement loadBranches() in employeeStore
      // employeeStore.loadBranches().catch((e: any) => console.error('Branches error:', e)),
      // Use legacy API endpoint for reporting managers (matches React implementation)
      employeeStore.fetchReportingManagers().catch((e: any) => console.error('Reporting managers error:', e))
    ]);
    
    console.log('Master data loaded:');
    console.log('Departments:', employeeStore.departments, 'Count:', employeeStore.departments.length);
    console.log('Designations:', employeeStore.designations, 'Count:', employeeStore.designations.length);
    console.log('Teams:', employeeStore.teams, 'Count:', employeeStore.teams.length);
    console.log('Reporting Managers (legacy API):', employeeStore.employees, 'Count:', employeeStore.employees.length);
  } catch (error) {
    console.error('Failed to load master data:', error);
  }

  // Load employee data if editing
  if (isEditMode.value) {
    const employeeId = Number(route.params.id);
    console.log('Loading employee data for ID:', employeeId);
    const employee = await employeeStore.fetchEmployeeById(employeeId);
    console.log('Fetched employee data:', employee);
    console.log('Form data before assign:', { ...formData });
    Object.assign(formData, employee);
    console.log('Form data after assign:', { ...formData });
    console.log('✅ Checking YOUR specific fields that were empty:');
    console.log('  1. DOB:', formData.dob);
    console.log('  2. PAN Card:', formData.pan_no);
    console.log('  3. Aadhaar Card:', formData.aadhaar_no);
    console.log('  4. UAN:', formData.uan_no);
    console.log('  5. Email (from employment_details):', formData.email);
    console.log('  6. Joining Date:', formData.joining_date);
    console.log('  7. Contact Name:', formData.emergency_contact_name);
    console.log('  8. Contact No.:', formData.emergency_contact_number);
    console.log('  9. Department ID:', formData.department_id);
    console.log(' 10. Designation ID:', formData.designation_id);
    console.log(' 11. Criminal Verification:', formData.criminal_verification, '(1=Pending, 2=Completed)');
  }
});

function goBack() {
  router.push('/employees/list');
}

async function generateEmployeeCode() {
  generatingCode.value = true;
  try {
    const response = await employeeStore.generateEmployeeCode();
    formData.employee_code = response.employee_code;
  } catch (error) {
    console.error('Failed to generate employee code:', error);
  } finally {
    generatingCode.value = false;
  }
}

function formatPAN() {
  if (formData.pan_no) {
    formData.pan_no = formData.pan_no.toUpperCase();
  }
}

function validateStep(step: number): boolean {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (step === 0) {
    // Personal Information validation - Only required fields: first_name, last_name
    const firstNameError = validateName(formData.first_name, 'First name', true);
    if (firstNameError) errors.first_name = firstNameError;
    
    const lastNameError = validateName(formData.last_name, 'Last name', true);
    if (lastNameError) errors.last_name = lastNameError;
    
    // Optional fields - only validate if they have values
    if (formData.middle_name && formData.middle_name.trim()) {
      const middleNameError = validateName(formData.middle_name, 'Middle name', false, true);
      if (middleNameError) errors.middle_name = middleNameError;
    }
    
    if (formData.father_name && formData.father_name.trim()) {
      const fatherNameError = validateName(formData.father_name, 'Father name', false);
      if (fatherNameError) errors.father_name = fatherNameError;
    }
    
    if (formData.pan_no && formData.pan_no.trim()) {
      const panError = validatePAN(formData.pan_no);
      if (panError) errors.pan_no = panError;
    }
    
    if (formData.aadhaar_no && formData.aadhaar_no.trim()) {
      const aadhaarError = validateAadhaar(formData.aadhaar_no);
      if (aadhaarError) errors.aadhaar_no = aadhaarError;
    }
  }
  
  if (step === 1) {
    // Contact Information validation - Only required field: email
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    // Optional fields - only validate if they have values
    if (formData.mobile_number && formData.mobile_number.trim()) {
      const mobileError = validateMobileNumber(formData.mobile_number);
      if (mobileError) errors.mobile_number = mobileError;
    }
    
    if (formData.emergency_contact_number && formData.emergency_contact_number.trim()) {
      const emergencyMobileError = validateMobileNumber(formData.emergency_contact_number);
      if (emergencyMobileError) errors.emergency_contact_number = emergencyMobileError;
    }
  }
  
  if (step === 2) {
    // Employment Details validation - Required fields
    const empCodeError = validateEmployeeCode(formData.employee_code);
    if (empCodeError) errors.employee_code = empCodeError;
    
    if (!formData.designation_id) {
      errors.designation_id = 'Designation is required';
    }
    if (!formData.department_id) {
      errors.department_id = 'Department is required';
    }
    if (!formData.team_id) {
      errors.team_id = 'Team is required';
    }
    if (!formData.reporting_manager_id) {
      errors.reporting_manager_id = 'Reporting manager is required';
    }
    if (!formData.joining_date) {
      errors.joining_date = 'Joining date is required';
    }
    if (!formData.employment_status) {
      errors.employment_status = 'Employment status is required';
    }
    if (!formData.job_type) {
      errors.job_type = 'Job type is required';
    }
    if (!formData.branch_id) {
      errors.branch_id = 'Branch is required';
    }
    
    // Time Doctor User ID is optional - only validate if provided
    if (formData.time_doctor_user_id && formData.time_doctor_user_id.trim()) {
      const timeDoctorError = validateTimeDoctorUserId(formData.time_doctor_user_id);
      if (timeDoctorError) errors.time_doctor_user_id = timeDoctorError;
    }
    
    // Background Verification validation
    if (!formData.background_verificationstatus) {
      errors.background_verificationstatus = 'Background verification status is required';
    }
    if (!formData.criminal_verification) {
      errors.criminal_verification = 'Criminal verification status is required';
    }
    
    // Experience validation - Allow 0 values, but validate range
    if (formData.total_experience_year !== undefined && formData.total_experience_year !== null) {
      const totalYearError = validateExperienceYear(formData.total_experience_year, 'Total experience years');
      if (totalYearError) errors.total_experience_year = totalYearError;
    }
    
    if (formData.total_experience_month !== undefined && formData.total_experience_month !== null) {
      const totalMonthError = validateExperienceMonth(formData.total_experience_month, 'Total experience months');
      if (totalMonthError) errors.total_experience_month = totalMonthError;
    }
    
    if (formData.relevant_experience_year !== undefined && formData.relevant_experience_year !== null) {
      const relevantYearError = validateExperienceYear(formData.relevant_experience_year, 'Relevant experience years');
      if (relevantYearError) errors.relevant_experience_year = relevantYearError;
    }
    
    if (formData.relevant_experience_month !== undefined && formData.relevant_experience_month !== null) {
      const relevantMonthError = validateExperienceMonth(formData.relevant_experience_month, 'Relevant experience months');
      if (relevantMonthError) errors.relevant_experience_month = relevantMonthError;
    }
    
    if (formData.probation_months !== undefined && formData.probation_months !== null) {
      const probationError = validateProbationMonths(formData.probation_months);
      if (probationError) errors.probation_months = probationError;
    }
  }
  
  return Object.keys(errors).length === 0;
}

function handleNext() {
  console.log('handleNext called, currentStep:', currentStep.value);
  console.log('formData:', formData);
  const isValid = validateStep(currentStep.value);
  console.log('Validation result:', isValid);
  console.log('Errors:', errors);
  if (isValid) {
    currentStep.value++;
    console.log('Moving to step:', currentStep.value);
  } else {
    console.log('Validation failed, staying on step:', currentStep.value);
  }
}

function handlePrevious() {
  currentStep.value--;
}

async function handleSubmit() {
  if (!validateStep(currentStep.value)) {
    return;
  }

  saving.value = true;
  try {
    if (isEditMode.value) {
      await employeeStore.updateEmployee(Number(route.params.id), formData);
    } else {
      await employeeStore.createEmployee(formData);
    }
    router.push('/employees/list');
  } catch (error: any) {
    console.error('Failed to save employee:', error);
    alert(error.message || 'Failed to save employee');
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  if (confirm('Are you sure you want to reset the form?')) {
    // Reset all string fields to empty
    formData.employee_code = '';
    formData.first_name = '';
    formData.middle_name = '';
    formData.last_name = '';
    formData.father_name = '';
    formData.blood_group = '';
    formData.dob = '';
    formData.email = '';
    formData.personal_email = '';
    formData.mobile_number = '';
    formData.emergency_contact_name = '';
    formData.emergency_contact_number = '';
    formData.pan_no = '';
    formData.aadhaar_no = '';
    formData.uan_no = '';
    formData.marriage_date = '';
    formData.time_doctor_user_id = '';
    formData.joining_date = '';
    
    // Reset numeric/boolean fields to undefined or default values
    formData.gender = undefined;
    formData.marital_status = undefined;
    formData.designation_id = undefined;
    formData.department_id = undefined;
    formData.team_id = undefined;
    formData.reporting_manager_id = undefined;
    formData.employment_status = undefined;
    formData.job_type = undefined;
    formData.branch_id = undefined;
    formData.background_verificationstatus = undefined;
    formData.criminal_verification = undefined;
    formData.total_experience_year = 0;
    formData.total_experience_month = 0;
    formData.relevant_experience_year = 0;
    formData.relevant_experience_month = 0;
    formData.probation_months = 0;
    
    // Reset form state
    currentStep.value = 0;
    Object.keys(errors).forEach(key => delete errors[key]);
  }
}
</script>

<style scoped>
.employee-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
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
}

.back-button:hover {
  background: #e0e0e0;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #999;
  transition: all 0.3s;
}

.step-item.active .step-number {
  background: #1976d2;
  border-color: #1976d2;
  color: #fff;
}

.step-item.completed .step-number {
  background: #4caf50;
  border-color: #4caf50;
  color: #fff;
}

.step-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.step-item.active .step-label {
  color: #1976d2;
  font-weight: 600;
}

.form-content {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-step {
  min-height: 400px;
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group label.required::after {
  content: ' *';
  color: #f44336;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
}

.form-control.error {
  border-color: #f44336;
}

.error-message {
  font-size: 12px;
  color: #f44336;
}

.input-with-button {
  display: flex;
  gap: 10px;
}

.input-with-button .form-control {
  flex: 1;
}

.btn-generate {
  padding: 10px 20px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-generate:hover:not(:disabled) {
  background: #1565c0;
}

.btn-generate:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: #fff;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #757575;
  color: #fff;
}

.btn-secondary:hover {
  background: #616161;
}

.btn-success {
  background: #4caf50;
  color: #fff;
}

.btn-success:hover:not(:disabled) {
  background: #43a047;
}

.btn-success:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-outline {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}

/* New styles for added sections */
.form-section-divider {
  margin: 30px 0;
  border-top: 2px solid #f0f0f0;
}

.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  margin-top: 10px;
}

.experience-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.experience-row .form-control {
  flex: 1;
}

.experience-row .separator {
  font-weight: 600;
  color: #666;
  font-size: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 15px;
  }
  
  .progress-steps::before {
    display: none;
  }
  
  .step-item {
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>
