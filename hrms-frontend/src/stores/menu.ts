import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MenuItem } from '@/types/menu.types';
import { menuService } from '@/services/menu.service';

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref<MenuItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch menu from backend
   */
  async function fetchMenu() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await menuService.getUserMenu();
      menuItems.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to load menu';
      console.error('Error fetching menu:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get only main menu items (with access or with accessible sub-menus)
   */
  function getMainMenus(): MenuItem[] {
    return menuItems.value.filter((item) => item.has_access || item.sub_menus.length > 0);
  }

  /**
   * Find menu item by path
   */
  function findMenuByPath(path: string): MenuItem | null {
    for (const item of menuItems.value) {
      if (item.path === path) {
        return item;
      }

      // Search in sub-menus
      for (const subItem of item.sub_menus) {
        if (subItem.path === path) {
          return subItem;
        }
      }
    }

    return null;
  }

  /**
   * Clear menu data
   */
  function clear() {
    menuItems.value = [];
    error.value = null;
  }

  return {
    menuItems,
    isLoading,
    error,
    fetchMenu,
    getMainMenus,
    findMenuByPath,
    clear,
  };
});
