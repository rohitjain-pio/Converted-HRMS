<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center ga-4">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="goBack"
          />
          <h2 class="text-h4">{{ isAdd ? 'Create Role' : 'Edit Role' }}</h2>
        </div>
      </v-col>
    </v-row>

    <v-card :loading="loading">
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <!-- Role Name -->
          <v-text-field
            v-model="formData.role_name"
            label="Role Name"
            placeholder="Enter role name"
            variant="outlined"
            :rules="roleNameRules"
            counter="50"
            maxlength="50"
            required
          />

          <!-- Permission Modules -->
          <div v-if="modules.length > 0" class="mt-8">
            <h3 class="text-h6 mb-4">Permissions</h3>

            <div
              v-for="(module, moduleIndex) in modules"
              :key="module.module_id"
              class="permission-module mb-6"
            >
              <div class="module-header">
                <h4 class="module-title">{{ module.module_name }}</h4>
                <v-checkbox
                  :model-value="isModuleAllSelected(moduleIndex)"
                  label="Select All"
                  hide-details
                  density="compact"
                  @update:model-value="toggleModulePermissions(moduleIndex)"
                />
              </div>

              <v-row class="permissions-grid pa-4">
                <v-col
                  v-for="(permission, permIndex) in module.permissions"
                  :key="permission.permission_id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-checkbox
                    v-model="modules[moduleIndex].permissions[permIndex].is_active"
                    :label="permission.permission_name"
                    hide-details
                    density="compact"
                  />
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Form Actions -->
          <v-divider class="my-6" />
          <div class="d-flex justify-end ga-3">
            <v-btn variant="text" @click="goBack">Cancel</v-btn>
            <v-btn
              type="submit"
              color="primary"
              :loading="saving"
            >
              {{ isAdd ? 'Create' : 'Update' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import roleService, { type Module, type Permission } from '@/services/api/roleService';

const router = useRouter();
const route = useRoute();

// Form data
const formRef = ref();
const formData = ref({
  role_id: 0,
  role_name: '',
});

const modules = ref<Module[]>([]);
const originalModules = ref<Module[]>([]);
const originalRoleName = ref('');
const loading = ref(false);
const saving = ref(false);

const isAdd = computed(() => !route.params.id);

// Validation rules
const roleNameRules = [
  (v: string) => !!v || 'Role name is required',
  (v: string) => v.length >= 2 || 'Role name must be at least 2 characters',
  (v: string) => v.length <= 50 || 'Role name cannot exceed 50 characters',
  (v: string) => /^[a-zA-Z\s]+$/.test(v) || 'Role name must contain only letters',
];

// Methods
const fetchPermissions = async () => {
  loading.value = true;
  try {
    if (isAdd.value) {
      // For add, get all permissions
      const response = await roleService.getPermissionList();
      modules.value = JSON.parse(JSON.stringify(response.result));
      originalModules.value = JSON.parse(JSON.stringify(response.result));
    } else {
      // For edit, get role permissions
      const roleId = Number(route.params.id);
      const response = await roleService.getModulePermissionsByRole(roleId);

      formData.value.role_id = response.result.role_id;
      formData.value.role_name = response.result.role_name;
      originalRoleName.value = response.result.role_name;
      modules.value = JSON.parse(JSON.stringify(response.result.modules));
      originalModules.value = JSON.parse(JSON.stringify(response.result.modules));
    }
  } catch (error: any) {
    console.error('Failed to fetch permissions:', error);
    goBack();
  } finally {
    loading.value = false;
  }
};

const isModuleAllSelected = (moduleIndex: number): boolean => {
  const module = modules.value[moduleIndex];
  return module.permissions.every((p: Permission) => p.is_active);
};

const toggleModulePermissions = (moduleIndex: number) => {
  const isAllSelected = isModuleAllSelected(moduleIndex);
  modules.value[moduleIndex].permissions.forEach((permission: Permission) => {
    permission.is_active = !isAllSelected;
  });
};

const onSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  // Get active permission IDs
  const permissionList: number[] = [];
  modules.value.forEach((module: Module) => {
    module.permissions.forEach((permission: Permission) => {
      if (permission.is_active) {
        permissionList.push(permission.permission_id);
      }
    });
  });

  if (permissionList.length === 0) {
    return;
  }

  // Check if role name changed
  const isRoleNameUpdate = !isAdd.value && formData.value.role_name !== originalRoleName.value;

  // Check if permissions changed
  let isRolePermissionUpdate = false;
  if (!isAdd.value) {
    const originalPermissions: number[] = [];
    originalModules.value.forEach((module: Module) => {
      module.permissions.forEach((permission: Permission) => {
        if (permission.is_active) {
          originalPermissions.push(permission.permission_id);
        }
      });
    });

    isRolePermissionUpdate =
      permissionList.length !== originalPermissions.length ||
      permissionList.some(id => !originalPermissions.includes(id));
  }

  if (!isAdd.value && !isRoleNameUpdate && !isRolePermissionUpdate) {
    return;
  }

  saving.value = true;
  try {
    await roleService.saveRolePermissions({
      role_id: formData.value.role_id,
      role_name: formData.value.role_name,
      is_role_name_update: isAdd.value || isRoleNameUpdate,
      is_role_permission_update: isAdd.value || isRolePermissionUpdate,
      permission_list: permissionList,
    });

    router.push('/roles');
  } catch (error: any) {
    console.error('Failed to save role:', error);
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  router.push('/roles');
};

onMounted(() => {
  fetchPermissions();
});
</script>

<style scoped lang="scss">
.permission-module {
  border: 1px solid rgb(var(--v-theme-on-surface), 0.12);
  border-radius: 4px;
  overflow: hidden;

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #e6f4ff;
    border-left: 3px solid #1e75bb;

    .module-title {
      margin: 0;
      color: #1e75bb;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .permissions-grid {
    background-color: rgb(var(--v-theme-surface));
  }
}
</style>
