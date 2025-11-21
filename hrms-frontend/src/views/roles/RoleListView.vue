<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <h2 class="text-h4">Roles</h2>
          <div class="d-flex align-center ga-3">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search roles..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @input="handleSearch"
              style="width: 300px"
            />
            <v-btn
              v-if="canCreate"
              color="primary"
              prepend-icon="mdi-plus"
              @click="navigateToAdd"
            >
              Add Role
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="roles"
        :loading="loading"
        :items-per-page="pageSize"
        hide-default-footer
      >
        <!-- S.No Column -->
        <template #item.index="{ index }">
          {{ (currentPage - 1) * pageSize + index + 1 }}
        </template>

        <!-- Users Column -->
        <template #item.user_count="{ item }">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            rounded
            @click="handleViewUsers(item)"
          >
            {{ item.user_count }}
          </v-btn>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <v-btn
            v-if="canEdit"
            color="primary"
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="navigateToEdit(item.role_id)"
          />
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-divider />
      <div class="d-flex justify-end align-center pa-4">
        <div class="text-caption mr-4">
          Rows per page:
          <v-select
            v-model="pageSize"
            :items="[10, 25, 50, 100]"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="handleSizeChange"
            style="width: 80px; display: inline-block"
          />
        </div>
        <div class="text-caption mr-4">
          {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }}
        </div>
        <v-pagination
          v-model="currentPage"
          :length="Math.ceil(totalRecords / pageSize)"
          :total-visible="7"
          @update:model-value="handlePageChange"
        />
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import roleService, { type Role } from '@/services/api/roleService';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Permissions
const canEdit = computed(() => authStore.hasPermission('Edit.Role'));
const canCreate = computed(() => authStore.hasPermission('Create.Role'));

// Table headers
const headers = computed(() => {
  const baseHeaders = [
    { title: 'S.No', key: 'index', sortable: false, width: '80px' },
    { title: 'Role', key: 'role_name', sortable: true },
    { title: 'Users', key: 'user_count', sortable: false, width: '120px', align: 'center' },
  ];

  if (canEdit.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' });
  }

  return baseHeaders as any;
});

// Data
const roles = ref<Role[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortColumn = ref('role_name');
const sortDirection = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

// Debounce timer
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// Methods
const fetchRoles = async () => {
  loading.value = true;
  try {
    const response = await roleService.getRoles({
      sort_column_name: sortColumn.value,
      sort_direction: sortDirection.value,
      start_index: (currentPage.value - 1) * pageSize.value,
      page_size: pageSize.value,
      filters: {
        role_name: searchQuery.value,
      },
    });

    roles.value = response.result.role_response_list;
    totalRecords.value = response.result.total_records;
  } catch (error: any) {
    console.error('Failed to fetch roles:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchRoles();
  }, 500);
};

const handlePageChange = () => {
  fetchRoles();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchRoles();
};

const navigateToAdd = () => {
  router.push('/roles/add');
};

const navigateToEdit = (roleId: number) => {
  router.push(`/roles/edit/${roleId}`);
};

const handleViewUsers = (role: Role) => {
  // Navigate to employees list filtered by role
  router.push({
    path: '/employees/list',
    query: { roleId: role.role_id },
  });
};

onMounted(() => {
  fetchRoles();
});
</script>
