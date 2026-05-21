import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Public Client (No token needed)
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, 
});

// Private Client (Needs Access Token)
export const privateApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Note: Request and Response interceptors are managed by AuthContext
// to ensure proper state synchronization

interface LoginCredentials {
  email?: string; 
  phone?: string;
  password: string;
}

interface RegisterData {
  phone: string;
  password: string;
  confirm_password: string;
  verification_method: 'sms' | 'email';
  full_name: string;
  email: string;
}

interface VerifyOTPPayload {
  temp_id: string;
  otp_code: string;
}

interface ResendOTPPayload {
  temp_id: string;
}

interface SystemAdminRegister {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

interface CreateOrgAdminPayload {
  email: string;
  full_name: string;
  phone: string;
  organization_name: string;
}

interface CompleteOrgAdminPayload {
  token: string; // OTP sent via email link
  password: string;
  confirm_password: string;
}


export const authService = {
  register: async (userData: RegisterData) => {
    const response = await publicApi.post('/auth/register/resident/', userData);
    return response.data;
  },

  verifyOTP: async (payload: VerifyOTPPayload) => {
    const response = await publicApi.post('/auth/verify-otp/', payload);
    return response.data;
  },

  resendOTP: async (payload: ResendOTPPayload) => {
    const response = await publicApi.post('/auth/resend-otp/', payload);
    return response.data;
  },


  login: async (credentials: LoginCredentials) => {
    const response = await publicApi.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async () => {
    await privateApi.post('/auth/logout/');
  },
  // Forgot Password
  forgotPassword: async (data: { email?: string; phone?: string }) => {
    const response = await publicApi.post('/auth/forgot-password/', data);
    return response.data;
  },

  // Reset via Email Link
  resetPasswordConfirm: async (data: { token: string; password: string; confirm_password: string }) => {
    const response = await publicApi.post('/auth/reset-password/', data);
    return response.data;
  },

  // SMS reset flow: confirm OTP and set a new password
  verifyResetOTP: async (data: { temp_id: string; otp_code: string; new_password: string; confirm_password: string }) => {
    const response = await publicApi.post('/auth/verify-reset-otp/', data);
    return response.data;
  },

  refreshToken: async () => {
    const response = await publicApi.post('/auth/token/refresh/');
    return response.data;
  },

  // profile & user Data
  getProfile: async () => {
    const response = await privateApi.get('/auth/profile/');
    return response.data;
  },

  // Admin Management
  registerSystemAdmin: async (data: SystemAdminRegister) => {
    const response = await publicApi.post('/auth/register/system-admin/', data);
    return response.data;
  },

  createOrgAdmin: async (data: CreateOrgAdminPayload) => {
    const response = await privateApi.post('/auth/admin/create-org-admin/', data);
    return response.data;
  },

  completeOrgRegistration: async (data: CompleteOrgAdminPayload) => {
    const response = await publicApi.post('/auth/complete-registration/', data);
    return response.data;
  }
};
