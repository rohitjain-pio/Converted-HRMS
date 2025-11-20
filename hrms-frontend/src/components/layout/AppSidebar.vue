<template>
  <v-navigation-drawer v-model="model" permanent width="260">
    <v-list density="compact" nav>
      <!-- Logo/Header -->
      <v-list-item class="mb-4">
        <v-list-item-title class="text-h6">
          HRMS
        </v-list-item-title>
      </v-list-item>

      <v-divider class="mb-2"></v-divider>

      <!-- Loading State -->
      <v-progress-linear
        v-if="menuStore.isLoading"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <!-- Error State -->
      <v-alert
        v-if="menuStore.error"
        type="error"
        density="compact"
        class="mx-2"
      >
        {{ menuStore.error }}
      </v-alert>

      <!-- Dynamic Menu Items -->
      <template v-for="item in menuStore.menuItems" :key="item.id">
        <!-- Menu item with sub-menus -->
        <v-list-group v-if="item.sub_menus.length > 0" :value="item.name">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon || 'mdi-folder'">
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- Sub-menu items -->
          <v-list-item
            v-for="subItem in item.sub_menus"
            :key="subItem.id"
            :to="subItem.path || '#'"
            :prepend-icon="subItem.icon || 'mdi-circle-small'"
            class="pl-8"
          >
            <v-list-item-title>{{ subItem.name }}</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- Single menu item (no sub-menus) -->
        <v-list-item
          v-else-if="item.has_access"
          :to="item.path || '#'"
          :prepend-icon="item.icon || 'mdi-circle'"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </template>


    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/menu';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const menuStore = useMenuStore();

onMounted(async () => {
  // Fetch menu if not already loaded
  if (menuStore.menuItems.length === 0) {
    await menuStore.fetchMenu();
  }
});
</script>
