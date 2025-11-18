<template>
  <div class="bank-details-form-container">
    <div class="form-header">
      <h3>Bank Account Details</h3>
      <span v-if="existingBankDetails.length > 0" class="account-count">
        {{ existingBankDetails.length }} Account(s) Added
      </span>
    </div>

    <!-- Existing Bank Accounts List -->
    <div v-if="existingBankDetails.length > 0" class="bank-accounts-list">
      <div 
        v-for="bank in existingBankDetails" 
        :key="bank.id"
        class="bank-account-card"
        :class="{ 'active-account': bank.is_active === 1 }"
      >
        <div class="account-info">
          <div class="bank-name">
            {{ bank.bank_name }}
            <span v-if="bank.is_active === 1" class="badge-active">Active</span>
          </div>
          <div class="account-details">
            <span><strong>Account No:</strong> {{ bank.masked_account_no || maskAccountNumber(bank.account_no!) }}</span>
            <span><strong>IFSC:</strong> {{ bank.ifsc_code }}</span>
            <span><strong>Branch:</strong> {{ bank.branch_name }}</span>
          </div>
        </div>
        <div class="account-actions">
          <button 
            v-if="bank.is_active !== 1"
            @click="setActiveAccount(bank.id!)" 
            class="btn-action btn-activate"
            type="button"
          >
            Set Active
          </button>
          <button 
            @click="editBankAccount(bank)" 
            class="btn-action btn-edit"
            type="button"
          >
            Edit
          </button>
          <button 
            @click="deleteBankAccount(bank.id!)" 
            class="btn-action btn-delete"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div class="bank-form" v-if="showForm">
      <div class="form-title">
        <h4>{{ editingBankId ? 'Edit Bank Account' : 'Add New Bank Account' }}</h4>
        <button @click="cancelForm" class="btn-close" type="button">×</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Bank Name</label>
            <input 
              v-model="formData.bank_name" 
              type="text" 
              class="form-control"
              :class="{ 'error': errors.bank_name }"
              placeholder="Enter Bank Name"
              required
            />
            <span v-if="errors.bank_name" class="error-message">{{ errors.bank_name }}</span>
          </div>

          <div class="form-group">
            <label class="required">Account Number</label>
            <input 
              v-model="formData.account_no" 
              type="text" 
              class="form-control"
              :class="{ 'error': errors.account_no }"
              placeholder="Enter Account Number"
              maxlength="20"
              required
            />
            <span v-if="errors.account_no" class="error-message">{{ errors.account_no }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="required">IFSC Code</label>
            <input 
              v-model="formData.ifsc_code" 
              type="text" 
              class="form-control"
              :class="{ 'error': errors.ifsc_code }"
              placeholder="Enter IFSC Code"
              maxlength="11"
              @input="formatIFSC"
              required
            />
            <span v-if="errors.ifsc_code" class="error-message">{{ errors.ifsc_code }}</span>
          </div>

          <div class="form-group">
            <label class="required">Branch Name</label>
            <input 
              v-model="formData.branch_name" 
              type="text" 
              class="form-control"
              :class="{ 'error': errors.branch_name }"
              placeholder="Enter Branch Name"
              required
            />
            <span v-if="errors.branch_name" class="error-message">{{ errors.branch_name }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                v-model="formData.is_active" 
                type="checkbox" 
                :true-value="1"
                :false-value="0"
              />
              <span>Set as Active Account</span>
            </label>
            <small class="help-text">Only one account can be active at a time</small>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : (editingBankId ? 'Update Account' : 'Add Account') }}
          </button>
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Add Button (when form is hidden) -->
    <div v-if="!showForm" class="add-account-section">
      <button @click="showAddForm" class="btn btn-add" type="button">
        + Add Bank Account
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { BankDetails } from '@/types/employee';

interface Props {
  employeeId: number;
}

const props = defineProps<Props>();

const employeeStore = useEmployeeStore();
const existingBankDetails = ref<BankDetails[]>([]);
const showForm = ref(false);
const saving = ref(false);
const editingBankId = ref<number | null>(null);

const formData = reactive<Partial<BankDetails>>({
  employee_id: props.employeeId,
  bank_name: '',
  account_no: '',
  branch_name: '',
  ifsc_code: '',
  is_active: 0
});

const errors = reactive<Record<string, string>>({});

onMounted(async () => {
  await loadBankDetails();
});

async function loadBankDetails() {
  try {
    const response = await employeeStore.fetchBankDetails(props.employeeId);
    existingBankDetails.value = response;
  } catch (error) {
    console.error('Failed to load bank details:', error);
  }
}

function maskAccountNumber(accountNo: string): string {
  if (!accountNo || accountNo.length < 4) return accountNo;
  const lastFour = accountNo.slice(-4);
  const masked = 'X'.repeat(accountNo.length - 4);
  return masked + lastFour;
}

function formatIFSC() {
  if (formData.ifsc_code) {
    formData.ifsc_code = formData.ifsc_code.toUpperCase();
  }
}

function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (!formData.bank_name?.trim()) {
    errors.bank_name = 'Bank name is required';
  }
  
  if (!formData.account_no?.trim()) {
    errors.account_no = 'Account number is required';
  } else if (!/^\d{9,18}$/.test(formData.account_no)) {
    errors.account_no = 'Account number must be 9-18 digits';
  }
  
  if (!formData.ifsc_code?.trim()) {
    errors.ifsc_code = 'IFSC code is required';
  } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
    errors.ifsc_code = 'Invalid IFSC code format';
  }
  
  if (!formData.branch_name?.trim()) {
    errors.branch_name = 'Branch name is required';
  }
  
  return Object.keys(errors).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  saving.value = true;
  try {
    if (editingBankId.value) {
      await employeeStore.updateBankDetails(editingBankId.value, formData);
    } else {
      await employeeStore.createBankDetails(formData);
    }
    
    // If setting as active, update the active status
    if (formData.is_active === 1 && !editingBankId.value) {
      // The newly created bank detail will need to be set active
      await loadBankDetails();
      const newBank = existingBankDetails.value.find(b => 
        b.account_no === formData.account_no
      );
      if (newBank?.id) {
        await employeeStore.setActiveBankDetails(newBank.id);
      }
    } else if (formData.is_active === 1 && editingBankId.value) {
      await employeeStore.setActiveBankDetails(editingBankId.value);
    }
    
    await loadBankDetails();
    resetForm();
  } catch (error: any) {
    console.error('Failed to save bank details:', error);
    alert(error.message || 'Failed to save bank details');
  } finally {
    saving.value = false;
  }
}

function showAddForm() {
  showForm.value = true;
  editingBankId.value = null;
  resetFormData();
}

function editBankAccount(bank: BankDetails) {
  showForm.value = true;
  editingBankId.value = bank.id!;
  Object.assign(formData, {
    employee_id: bank.employee_id,
    bank_name: bank.bank_name,
    account_no: bank.account_no,
    branch_name: bank.branch_name,
    ifsc_code: bank.ifsc_code,
    is_active: bank.is_active
  });
}

async function setActiveAccount(bankId: number) {
  if (confirm('Set this account as active? This will deactivate other accounts.')) {
    try {
      await employeeStore.setActiveBankDetails(bankId);
      await loadBankDetails();
    } catch (error: any) {
      alert(error.message || 'Failed to set active account');
    }
  }
}

async function deleteBankAccount(bankId: number) {
  if (confirm('Are you sure you want to delete this bank account?')) {
    try {
      await employeeStore.deleteBankDetails(bankId);
      await loadBankDetails();
    } catch (error: any) {
      alert(error.message || 'Failed to delete bank account');
    }
  }
}

function cancelForm() {
  resetForm();
}

function resetForm() {
  showForm.value = false;
  editingBankId.value = null;
  resetFormData();
  Object.keys(errors).forEach(key => delete errors[key]);
}

function resetFormData() {
  formData.bank_name = '';
  formData.account_no = '';
  formData.branch_name = '';
  formData.ifsc_code = '';
  formData.is_active = 0;
}
</script>

<style scoped>
.bank-details-form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.account-count {
  font-size: 14px;
  color: #666;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 12px;
}

.bank-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.bank-account-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s;
}

.bank-account-card.active-account {
  border-color: #4caf50;
  background: #f1f8f4;
}

.bank-account-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.account-info {
  flex: 1;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-active {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: #4caf50;
  padding: 2px 10px;
  border-radius: 12px;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.account-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-activate {
  background: #4caf50;
  color: #fff;
}

.btn-activate:hover {
  background: #43a047;
}

.btn-edit {
  background: #2196f3;
  color: #fff;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: #fff;
}

.btn-delete:hover {
  background: #d32f2f;
}

.bank-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.form-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.btn-close {
  width: 30px;
  height: 30px;
  border: none;
  background: #f44336;
  color: #fff;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #d32f2f;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.checkbox-group {
  gap: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 400;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.help-text {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
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

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
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

.add-account-section {
  text-align: center;
  padding: 20px;
}

.btn-add {
  padding: 12px 30px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #1565c0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .bank-account-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .account-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
