import api from './api';
import type { 
  LoginCredentials, 
  SSOLoginRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  ApiResponse 
} from '@/types';

export const authService = {
  /**
   * Standard email/password login
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials,
      {
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY || 'hrms-secure-api-key-change-in-production',
        },
      }
    );
    return response.data;
  },

  /**
   * Azure AD SSO login
   */
  async ssoLogin(request: SSOLoginRequest) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth', request);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Check API health status
   */
  async checkHealth() {
    const response = await api.get<ApiResponse<{ version: string; timestamp: string }>>('/auth/check-health');
    return response.data;
  },

  /**
   * Logout (optional backend call if needed)
   */
  async logout() {
    // If you have a logout endpoint in backend
    // const response = await api.post('/auth/logout');
    // return response.data;
  },
};
