import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthResponse, LoginCredentials } from '@/types';
import { authService } from '@/services/auth.service';
import { useModulePermissionsStore } from './modulePermissions';
import { useMenuStore } from './menu';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));
  const user = ref<User | null>(null);
  const permissions = ref<string[]>([]);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // Actions
  function setAuthData(data: AuthResponse) {
    token.value = data.token;
    refreshToken.value = data.refresh_token;
    user.value = {
      id: data.employee_id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
    permissions.value = data.permissions;

    // Persist to localStorage
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(user.value));
    localStorage.setItem('permissions', JSON.stringify(permissions.value));

    // Set grouped permissions in module permissions store
    const modulePermissionsStore = useModulePermissionsStore();
    if (data.permissions_grouped) {
      // Convert flat array to module permissions structure
      const modulePermissions = [{
        module_name: 'Default',
        permissions: Array.isArray(data.permissions_grouped) ? data.permissions_grouped : []
      }];
      modulePermissionsStore.setModulePermissions(modulePermissions);
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      const response = await authService.login(credentials);
      if (response.is_success && response.data) {
        setAuthData(response.data);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function loginWithAzure(accessToken: string) {
    try {
      const response = await authService.ssoLogin({ access_token: accessToken });
      if (response.is_success && response.data) {
        setAuthData(response.data);
      } else {
        throw new Error(response.message || 'SSO login failed');
      }
    } catch (error: any) {
      console.error('Azure login error:', error);
      throw error;
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refreshToken(refreshToken.value);
      if (response.is_success && response.data) {
        token.value = response.data.token;
        localStorage.setItem('auth_token', response.data.token);
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  }

  function logout() {
    // Clear state
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    permissions.value = [];

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');

    // Clear module permissions and menu stores
    const modulePermissionsStore = useModulePermissionsStore();
    const menuStore = useMenuStore();
    modulePermissionsStore.clear();
    menuStore.clear();
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission);
  }

  function hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => permissions.value.includes(permission));
  }

  function hasAllPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => permissions.value.includes(permission));
  }

  function initializeFromStorage() {
    const storedUser = localStorage.getItem('user');
    const storedPermissions = localStorage.getItem('permissions');

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }

    if (storedPermissions) {
      try {
        permissions.value = JSON.parse(storedPermissions);
      } catch (e) {
        console.error('Failed to parse stored permissions:', e);
      }
    }
  }

  // Initialize on store creation
  initializeFromStorage();

  return {
    // State
    token,
    refreshToken,
    user,
    permissions,
    // Computed
    isAuthenticated,
    // Actions
    login,
    loginWithAzure,
    refreshAccessToken,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    initializeFromStorage,
  };
});
