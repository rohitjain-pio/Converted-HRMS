<template>
  <slot v-if="hasRequiredPermissions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

const props = defineProps<{
  permissions?: string | string[];
  requireAll?: boolean;
}>();

const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

const hasRequiredPermissions = computed(() => {
  if (!props.permissions) return true;

  const permissionArray = Array.isArray(props.permissions) 
    ? props.permissions 
    : [props.permissions];

  if (props.requireAll) {
    return hasAllPermissions(permissionArray);
  } else {
    return hasAnyPermission(permissionArray);
  }
});
</script>
