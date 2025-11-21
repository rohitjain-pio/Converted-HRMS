<template>
  <div class="official-details-tab">
    <v-row>
      <!-- Identity Information -->
      <v-col cols="12">
        <v-card>
          <v-card-title class="section-title">Identity Information</v-card-title>
          <v-card-text>
            <v-form v-if="editMode" ref="officialForm">
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.pan_number"
                    label="PAN Number"
                    :rules="[rules.pan]"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.adhar_number"
                    label="Aadhaar Number"
                    :rules="[rules.aadhaar]"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.uan_no"
                    label="UAN Number"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.passport_no"
                    label="Passport Number"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.passport_expiry"
                    label="Passport Expiry"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :disabled="!editedData.passport_no"
                  />
                </v-col>
              </v-row>

              <!-- PF & ESI in Edit Mode -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <h4 class="mb-3">PF & ESI Details</h4>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="editedData.has_pf"
                    label="Has PF"
                    :items="[{label: 'Yes', value: 1}, {label: 'No', value: 0}]"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.pf_number"
                    label="PF Number"
                    variant="outlined"
                    density="compact"
                    :disabled="!editedData.has_pf"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.pf_date"
                    label="PF Start Date"
                    type="date"
                    variant="outlined"
                    density="compact"
                    :disabled="!editedData.has_pf"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="editedData.has_esi"
                    label="Has ESI"
                    :items="[{label: 'Yes', value: 1}, {label: 'No', value: 0}]"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editedData.esi_no"
                    label="ESI Number"
                    variant="outlined"
                    density="compact"
                    :disabled="!editedData.has_esi"
                  />
                </v-col>
              </v-row>
            </v-form>

            <div v-else>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>PAN Number</label>
                    <div>{{ employee?.pan_number || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>Aadhaar Number</label>
                    <div>{{ employee?.adhar_number || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>UAN Number</label>
                    <div>{{ employee?.uan_no || 'N/A' }}</div>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>Passport Number</label>
                    <div>{{ employee?.passport_no || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>Passport Expiry</label>
                    <div>{{ formatDate(employee?.passport_expiry) || 'N/A' }}</div>
                  </div>
                </v-col>
              </v-row>

              <!-- PF & ESI Details (Display Mode) -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <h4 class="mb-3">PF & ESI Details</h4>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>Has PF</label>
                    <div>{{ employee?.has_pf ? 'Yes' : 'No' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>PF Number</label>
                    <div>{{ employee?.pf_number || 'N/A' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>PF Start Date</label>
                    <div>{{ formatDate(employee?.pf_date) || 'N/A' }}</div>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>Has ESI</label>
                    <div>{{ employee?.has_esi == 1 ? 'Yes' : 'No' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="info-field">
                    <label>ESI Number</label>
                    <div>{{ employee?.esi_no || 'N/A' }}</div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Bank Details -->
      <v-col cols="12">
        <v-card>
          <v-card-title class="section-title">Bank Details</v-card-title>
          <v-card-text>
            <BankDetailsForm
              v-if="employee?.id"
              :employee-id="employee.id"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Employee } from '@/types/employee';
import { useEmployeeStore } from '@/stores/employeeStore';
import BankDetailsForm from '../BankDetailsForm.vue';

const props = defineProps<{
  employee: Employee | null;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const employeeStore = useEmployeeStore();
const officialForm = ref<any>(null);

const editedData = reactive<Partial<Employee>>({
  pan_number: '',
  adhar_number: '',
  uan_no: '',
  passport_no: '',
  passport_expiry: '',
  has_pf: 0,
  pf_number: '',
  pf_date: '',
  has_esi: 0,
  esi_no: ''
});

const rules = {
  required: (v: any) => !!v || 'This field is required',
  pan: (v: string) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) || 'Invalid PAN format',
  aadhaar: (v: string) => !v || /^\d{12}$/.test(v.replace(/\s/g, '')) || 'Invalid Aadhaar format (12 digits)',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function validate() {
  const form = officialForm.value as any;
  if (form) {
    const { valid } = await form.validate();
    return valid;
  }
  return true;
}

function reset() {
  if (props.employee) {
    Object.assign(editedData, {
      pan_number: props.employee.pan_number || '',
      adhar_number: props.employee.adhar_number || '',
      uan_no: props.employee.uan_no || '',
      passport_no: props.employee.passport_no || '',
      passport_expiry: props.employee.passport_expiry || '',
      has_pf: props.employee.has_pf || 0,
      pf_number: props.employee.pf_number || '',
      pf_date: props.employee.pf_date || '',
      has_esi: props.employee.has_esi || 0,
      esi_no: props.employee.esi_no || ''
    });
  }
  const form = officialForm.value as any;
  if (form) {
    form.resetValidation();
  }
}

function getData() {
  const data = {
    pan_number: editedData.pan_number,
    adhar_number: editedData.adhar_number?.replace(/\s/g, ''),
    uan_no: editedData.uan_no,
    passport_no: editedData.passport_no,
    passport_expiry: editedData.passport_expiry || null,
    has_pf: editedData.has_pf,
    pf_number: editedData.has_pf ? editedData.pf_number : null,
    pf_date: editedData.has_pf ? editedData.pf_date : null,
    has_esi: editedData.has_esi,
    esi_no: editedData.has_esi ? editedData.esi_no : null
  };
  console.log('OfficialDetailsTab getData() returning:', data);
  return data;
}

// Initialize data on mount and when employee changes
if (props.employee) {
  reset();
}

// Expose methods to parent
defineExpose({
  validate,
  reset,
  getData
});
</script>

<style scoped>
.official-details-tab {
  padding: 16px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #273a50;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.info-field {
  margin-bottom: 16px;
}

.info-field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.info-field div {
  font-size: 15px;
  color: #333;
}
</style>