import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { LoginCredentials } from '@/types';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const permissions = computed(() => authStore.permissions);

  async function login(credentials: LoginCredentials) {
    await authStore.login(credentials);
    router.push({ name: 'Dashboard' });
  }

  async function loginWithAzure(accessToken: string) {
    await authStore.loginWithAzure(accessToken);
    router.push({ name: 'Dashboard' });
  }

  async function logout() {
    authStore.logout();
    router.push({ name: 'Login' });
  }

  function hasPermission(permission: string): boolean {
    return authStore.hasPermission(permission);
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return authStore.hasAnyPermission(permissions);
  }

  function hasAllPermissions(permissions: string[]): boolean {
    return authStore.hasAllPermissions(permissions);
  }

  return {
    isAuthenticated,
    user,
    permissions,
    login,
    loginWithAzure,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
