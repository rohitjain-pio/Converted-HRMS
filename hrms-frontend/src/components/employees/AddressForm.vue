<template>
  <div class="address-form-container">
    <!-- Display Mode -->
    <div v-if="!editMode">
      <div class="address-display">
        <div class="display-row">
          <div class="display-field">
            <label>Address Line 1</label>
            <div class="value">{{ addressData?.line1 || 'N/A' }}</div>
          </div>
          <div class="display-field">
            <label>Address Line 2</label>
            <div class="value">{{ addressData?.line2 || 'N/A' }}</div>
          </div>
        </div>
        <div class="display-row">
          <div class="display-field">
            <label>City</label>
            <div class="value">{{ addressData?.city?.city_name || 'N/A' }}</div>
          </div>
          <div class="display-field">
            <label>State</label>
            <div class="value">{{ addressData?.city?.state?.state_name || 'N/A' }}</div>
          </div>
          <div class="display-field">
            <label>Country</label>
            <div class="value">{{ addressData?.city?.state?.country?.country_name || 'N/A' }}</div>
          </div>
        </div>
        <div class="display-row">
          <div class="display-field">
            <label>Pincode</label>
            <div class="value">{{ addressData?.pincode || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else>
      <div class="form-row">
        <div class="form-group">
          <label>Address Line 1</label>
          <input 
            v-model="localData.line1" 
            type="text" 
            class="form-control"
            placeholder="House/Flat No., Building Name"
          />
        </div>

        <div class="form-group">
          <label>Address Line 2</label>
          <input 
            v-model="localData.line2" 
            type="text" 
            class="form-control"
            placeholder="Street, Area, Locality"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="required">Country</label>
          <select 
            v-model="localData.country_id" 
            class="form-control"
            @change="onCountryChange"
            required
          >
            <option :value="null">Select Country</option>
            <option 
              v-for="country in employeeStore.countries" 
              :key="country.id"
              :value="country.id"
            >
              {{ country.country_name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="required">State</label>
          <select 
            v-model="localData.state_id" 
            class="form-control"
            @change="onStateChange"
            :disabled="!localData.country_id || loadingStates"
            required
          >
            <option :value="null">{{ loadingStates ? 'Loading...' : 'Select State' }}</option>
            <option 
              v-for="state in filteredStates" 
              :key="state.id"
              :value="state.id"
            >
              {{ state.state_name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="required">City</label>
          <select 
            v-model="localData.city_id" 
            class="form-control"
            :disabled="!localData.state_id || loadingCities"
            required
          >
            <option :value="null">{{ loadingCities ? 'Loading...' : 'Select City' }}</option>
            <option 
              v-for="city in filteredCities" 
              :key="city.id"
              :value="city.id"
            >
              {{ city.city_name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Pincode</label>
          <input 
            v-model="localData.pincode" 
            type="text" 
            class="form-control"
            maxlength="6"
            placeholder="Enter Pincode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Address } from '@/types/employee';

interface Props {
  addressData?: Address | null;
  editMode: boolean;
}

interface Emits {
  (e: 'update', value: Partial<Address>): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const employeeStore = useEmployeeStore();
const loadingStates = ref(false);
const loadingCities = ref(false);

const localData = ref<Partial<Address>>({});
const isUpdatingFromProps = ref(false);

const errors = reactive<Record<string, string>>({});

const filteredStates = computed(() => {
  if (!localData.value.country_id) return [];
  return employeeStore.states.filter(state => state.country_id === localData.value.country_id);
});

const filteredCities = computed(() => {
  if (!localData.value.state_id) return [];
  return employeeStore.cities.filter(city => city.state_id === localData.value.state_id);
});

onMounted(async () => {
  await employeeStore.loadCountries();
});

watch(() => props.addressData, async (newVal) => {
  isUpdatingFromProps.value = true;
  if (newVal) {
    localData.value = { ...newVal };
    // Load states and cities based on address data
    if (newVal.country_id) {
      await employeeStore.loadStates(newVal.country_id);
    }
    if (newVal.state_id) {
      await employeeStore.loadCities(newVal.state_id);
    }
  } else {
    localData.value = {};
  }
  // Use nextTick to ensure the flag is reset after all reactive updates
  await nextTick();
  isUpdatingFromProps.value = false;
}, { immediate: true });

// Emit changes to parent only when user makes changes, not when props update
watch(localData, (newVal) => {
  if (props.editMode && !isUpdatingFromProps.value) {
    emit('update', newVal);
  }
}, { deep: true });

async function onCountryChange() {
  loadingStates.value = true;
  localData.value.state_id = undefined;
  localData.value.city_id = undefined;
  
  try {
    if (localData.value.country_id) {
      await employeeStore.loadStates(localData.value.country_id);
    }
  } catch (error) {
    console.error('Failed to load states:', error);
  } finally {
    loadingStates.value = false;
  }
}

async function onStateChange() {
  loadingCities.value = true;
  localData.value.city_id = undefined;
  
  try {
    if (localData.value.state_id) {
      await employeeStore.loadCities(localData.value.state_id);
    }
  } catch (error) {
    console.error('Failed to load cities:', error);
  } finally {
    loadingCities.value = false;
  }
}


</script>

<style scoped>
.address-form-container {
  background: transparent;
  padding: 0;
}

/* Display Mode Styles */
.address-display {
  margin-bottom: 16px;
}

.display-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 16px;
  margin-bottom: 20px;
}

.display-row:last-child {
  margin-bottom: 0;
}

.display-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.display-field label {
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.display-field .value {
  font-size: 15px;
  color: #333;
  font-weight: 400;
  line-height: 1.5;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 20px;
  margin-bottom: 20px;
}

.form-row:has(.form-group:only-child) {
  grid-template-columns: 1fr;
}

.form-row:last-of-type {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.form-group label.required::after {
  content: ' *';
  color: #f44336;
  margin-left: 2px;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);
}

.form-control:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  color: #999;
  opacity: 0.7;
}

.form-control.error {
  border-color: #f44336;
}

.error-message {
  font-size: 12px;
  color: #f44336;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
}

.btn {
  padding: 10px 32px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: #1976d2;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-outline {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
  border-color: #999;
}

@media (max-width: 960px) {
  .form-row,
  .display-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
