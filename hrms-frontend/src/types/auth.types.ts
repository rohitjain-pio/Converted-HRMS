export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SSOLoginRequest {
  access_token: string;
}

export interface AuthResponse {
  employee_id: number;
  email: string;
  name: string;
  role: number;
  permissions: string[];
  permissions_grouped?: Array<{
    module_name: string;
    permissions: string[];
  }>;
  token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
  is_success: boolean;
}
