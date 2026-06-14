import { apiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiService.post<AuthResponse>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    return apiService.post<void>('/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    return apiService.get<AuthResponse['user']>('/auth/me');
  },
};
