import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast'; 
import LogoIcon from '../../../src/assets/icons/logoIcon';
import { hasAllowedRole } from '../../lib/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && allowedRoles && user && !hasAllowedRole(user.role_name, allowedRoles)) {
      toast.error("You don't have permission to access this area.", {
        id: 'unauthorized-toast', 
      });
    }
  }, [isLoading, isAuthenticated, allowedRoles, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-pulse font-body text-[10px] uppercase tracking-[0.5em] text-secondary/40">
          Authenticating...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !hasAllowedRole(user.role_name, allowedRoles)) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-[40px] shadow-2xl shadow-secondary/5 border border-secondary/5 relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex justify-center">
          <div className="w-20 h-20 bg-red-50/50 rounded-3xl flex items-center justify-center border border-red-100 animate-pulse">
            <LogoIcon />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-header text-3xl font-black text-secondary tracking-tight">
            መግባት አይቻልም
          </h1>
          <p className="font-body text-secondary/60 text-sm leading-relaxed">
            ይህንን ገጽ ለመመልከት የሚያስችል ፈቃድ የለዎትም። እባክዎ ወደ ዋናው ገጽ ተመልሰው ሌሎች ተግባራትን ያከናውኑ።
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60">
          You don't have permission to access this page. Please return to the home page and perform other actions.
            Access Denied • 403 Forbidden
          </p>
        </div>

        <button 
          onClick={() => window.location.href = '/'}
          className="group relative w-full py-4 bg-secondary text-primary rounded-2xl font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-secondary/20"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            ወደ ዋናው ገጽ ተመለስ / Go to Home
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>

        <div className="pt-4 flex justify-center items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-secondary/40">የኛFIX ~ Civic Issues Tracker</span>
          <span className="w-1 h-1 bg-secondary/40 rounded-full" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-secondary/40">2024</span>
        </div>
      </div>
    </div>
  );
}

  return <>{children}</>;
};

export default ProtectedRoute;