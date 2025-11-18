import api from './api';
import type { MenuResponse } from '@/types/menu.types';

export const menuService = {
  /**
   * Get user menu based on permissions
   */
  async getUserMenu() {
    const response = await api.get<MenuResponse>('/menu');
    return response.data;
  },
};
