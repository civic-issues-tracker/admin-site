import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { authService } from '../features/auth/services/authService';
import Toast, { type ToastType } from '../components/ui/Toast'; 

export interface User {
  id: string;
  user_number?: string;
  email?: string;
  phone?: string;
  full_name: string;
  organization_name?: string;
  role_name: 'resident' | 'system_admin' | 'organization' | 'organization_admin';
  email_verified?: boolean;
  sms_verified?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  showToast: (msg: string, type: ToastType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Keep isLoading false by default so mobile pages load immediately without infinite spinners
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' as ToastType });

  const isLoggingOut = useRef(false);

  const showToast = useCallback((msg: string, type: ToastType) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  // Correct wrapped setUser to keep localStorage and React state in sync
  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setIsLoading(false);
  }, [setUser]);

  const logout = useCallback(async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    setUser(null);
    try {
      await authService.logout();
    } catch {
      console.warn("Server logout bypassed or session already cleared.");
    } finally {
      isLoggingOut.current = false;
      window.location.href = '/';
    }
  }, [setUser]);

  // Handle visibility changes on mobile (e.g. user unlocks phone or returns to app tab)
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          await authService.refreshToken();
        } catch (error) {
          console.warn("Mobile wake refresh failed:", error);
          // Don't auto-logout here; let the actual API request retry or interceptor manage 401s
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Periodic silent refresh heartbeat
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL_MS = 25 * 60 * 1000; // 25 minutes

    const intervalId = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error("Background refresh failed:", error);
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      setUser, // Passed wrapped method instead of raw setUserState
      showToast
    }}>
      {children}
      <Toast 
        isVisible={toast.show} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast(p => ({ ...p, show: false }))} 
      />
    </AuthContext.Provider>
  );
};

export default AuthContext;