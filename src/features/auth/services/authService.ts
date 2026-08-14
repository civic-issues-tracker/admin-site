/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Global variable to keep track of the in-memory access token
let accessTokenInMemory: string | null = null;

// Helper to update the authorization header
export const setAuthHeader = (token: string | null) => {
  accessTokenInMemory = token;
  if (token) {
    privateApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete privateApi.defaults.headers.common['Authorization'];
  }
};

// Variables to handle simultaneous 401 requests elegantly
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Make sure the memory token is always attached
privateApi.interceptors.request.use(
  (config) => {
    if (accessTokenInMemory && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessTokenInMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Safe, no-loop silent refresh
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Only run if status is 401 and this request hasn't been retried already
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If the request that failed is the actual refresh request, DO NOT loop. Log out.
      if (originalRequest.url?.includes('/auth/refresh-token/')) {
        localStorage.removeItem('user');
        setAuthHeader(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 2. If a refresh is already in progress, queue up this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return privateApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // 3. Request a new access token from the backend
        // This runs on publicApi to avoid adding headers, but passes cookies
        const res = await publicApi.post('/auth/refresh-token/', {}, { withCredentials: true });
        
        // Extract the new access token from the backend response
        const newAccessToken = res.data.access;
        
        // Save the new token in memory & update headers
        setAuthHeader(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return privateApi(originalRequest); 
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        
        // Only kick them out if we are absolutely sure the refresh token is dead/expired
        localStorage.removeItem('user');
        setAuthHeader(null);
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
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
  full_name: string;
  password: string;
  confirm_password?: string;
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
    const response = await publicApi.post('/auth/refresh-token/');
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
