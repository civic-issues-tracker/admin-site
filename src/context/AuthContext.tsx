import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { authService } from '../features/auth/services/authService';
import Toast, { type ToastType } from '../components/ui/Toast';

interface User {
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
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' as ToastType });

  const isLoggingOut = useRef(false);

  const showToast = useCallback((msg: string, type: ToastType) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      sessionStorage.setItem('user', JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem('user');
    }
  }, []);

  const login = useCallback((user: User) => {
    setUser(user);
    setIsLoading(false);
  }, [setUser]);

  const logout = useCallback(async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    setUser(null); 

    try {
      await authService.logout(); 
    } catch {
      console.warn("Server logout cleanly bypassed or token already purged.");
    } finally {
      isLoggingOut.current = false;
      window.location.href = '/'; 
    }
}, [setUser]);

  // Store logout in a ref to prevent interval destruction when dependencies change
  const logoutRef = useRef(logout);
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Stable Silent Refresh Heartbeat
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL_MS = 20 * 60 * 1000; // Decreased to 20 mins to give a 10-min safety buffer before 30-min expiry

    const triggerSilentRefresh = async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error("Background session refresh failed:", error);
        logoutRef.current();
      }
    };

    const intervalId = setInterval(triggerSilentRefresh, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [!!user]); 

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      setUser,
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