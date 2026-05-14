import React, { createContext, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { privateApi } from '../features/auth/services/authService';
import Toast, { type ToastType } from '../components/ui/Toast'; 
import { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

export interface User {
  id: string;
  user_number?: string;
  email?: string;
  phone?: string;
  full_name: string;
  role_name: 'resident' | 'system_admin' | 'organization' | 'organization_admin';
  email_verified?: boolean;
  sms_verified?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { access: string; refresh?: string; user: User }) => void;
  logout: () => Promise<void>;
  updateToken: (newToken: string) => void;
  showToast: (msg: string, type: ToastType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem('accessToken');
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' as ToastType });

  // Use a Ref to track if we are already in the middle of a logout
  const isLoggingOut = useRef(false);

  const showToast = useCallback((msg: string, type: ToastType) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  const login = useCallback((data: { access: string; refresh?: string; user: User }) => {
    setAccessToken(data.access);
    setUser(data.user);
    
    sessionStorage.setItem('accessToken', data.access);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    if (data.refresh) {
      sessionStorage.setItem('refreshToken', data.refresh);
    } else {
      sessionStorage.removeItem('refreshToken');
    }
    
    setIsLoading(false);
  }, []);

  const updateToken = useCallback((newToken: string) => {
    setAccessToken(newToken);
    sessionStorage.setItem('accessToken', newToken);
  }, []);

  const logout = useCallback(async () => {
  if (isLoggingOut.current) return;
  isLoggingOut.current = true;

  try {
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

    if (refreshToken) {
      await privateApi.post('/auth/logout/', { refresh: refreshToken });
    } else {
      await privateApi.post('/auth/logout/');
    }
  } catch  {
    // This catches the 400 error so the app doesn't crash
    console.warn("Server logout request failed (expected if token expired)");
  } finally {
    setAccessToken(null);
    setUser(null);
    
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('refreshToken'); 
    
    isLoggingOut.current = false;
  }
}, [showToast]);

  // Interceptors for API logic
  useLayoutEffect(() => {
    const requestIntercept = privateApi.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers['Authorization'] && accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = privateApi.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: any) => {
        if (error.response?.status === 429) {
          showToast("Security: Too many requests. Please slow down.", "error");
        }

        // If we get a 401 and we're NOT already logging out, trigger logout
        if (error.response?.status === 401 && !isLoggingOut.current) {
          logout();
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      privateApi.interceptors.request.eject(requestIntercept);
      privateApi.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, logout, showToast]); 

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      isAuthenticated: !!accessToken, 
      isLoading, 
      login, 
      logout,
      updateToken,
      showToast
    }}>
      {children}
      <Toast 
        isVisible={toast.show} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast(p => ({...p, show: false}))} 
      />
    </AuthContext.Provider>
  );
};

export default AuthContext;