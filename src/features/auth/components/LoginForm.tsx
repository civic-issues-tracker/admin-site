import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion'; 
import { LogIn, Loader2, AlertCircle, ArrowLeft, Mail, Smartphone, Eye, EyeOff } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Input from '../../../../src/components/ui/Input';
import { useAuth } from '../../../hooks/useAuth'; 
import { authService } from '../../../features/auth/services/authService';
import Toast, {  type ToastType } from '../../../components/ui/Toast';
import { isOrganizationAdminRole } from '../../../lib/roleUtils';

const loginSchema = z.object({
  identifier: z.string().min(1, "Phone or Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false); 
  const [forgotMethod, setForgotMethod] = useState<'email' | 'sms'>('email'); 
  const [forgotIdentifier, setForgotIdentifier] = useState(""); 
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({
      show: false,
      msg: '',
      type: 'info'
    });

  const { login } = useAuth();

  const showToast = (msg: string, type: ToastType) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotMethod === 'email' && !forgotIdentifier.includes('@')) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (forgotMethod === 'sms' && forgotIdentifier.length < 9) {
      showToast("Please enter a valid phone number.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = forgotMethod === 'email' 
        ? { email: forgotIdentifier } 
        : { phone: forgotIdentifier };

      const result = await authService.forgotPassword(payload); 
      
      const successMsg = forgotMethod === 'email' 
        ? "Reset link sent to your email!" 
        : "OTP code sent to your phone!";
      
      showToast(successMsg, "success");
      
      if (forgotMethod === 'sms') {
        if (!result?.temp_id) {
          showToast("Reset session not returned by server. Try again.", "error");
          return;
        }
        setTimeout(() => navigate(`/reset-password?temp_id=${result.temp_id}&phone=${forgotIdentifier}`), 2000);
      }
    } catch  {
      showToast("User not found or request failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = async (data: LoginData) => {
    setLoading(true);
    setServerError(null);
    
    const isEmail = data.identifier.includes('@');
    const payload = isEmail 
      ? { email: data.identifier, password: data.password }
      : { phone: data.identifier, password: data.password };

    try {
      const result = await authService.login(payload);

      if (result.access && result.user) {
        const role = result.user.role_name;

        login({
          access: result.access,
          refresh: result.refresh,
          user: result.user
        });

        showToast("Login successful!", "success");

        if (role === 'system_admin') {
          navigate('/admin-dashboard');
        } else if (isOrganizationAdminRole(role)) {
          navigate('/organization-admin/dashboard');
        } else {
          navigate('/report');
        }
      } else {
        navigate('/report');
      }
    
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 429) {
          showToast("Security: Too many attempts. Please wait.", "error");
        } else if (status === 404) {
          showToast("User not found.", "error");
        } else if (status === 401) {
          showToast("Invalid credentials. Please try again.", "error");
        } else {
          showToast(error.response?.data?.detail || "Authentication failed.", "error");
        }
      } else {
        showToast("Connection failed. Check your internet.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AnimatePresence mode="wait">
      {!isForgotMode ? (
        <motion.form 
          key="login-form"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleSubmit(onLoginSubmit)}
          className="space-y-8"
        >
          <div className="space-y-6">
            <Input 
              label="Phone or Email" 
              placeholder="Enter phone or email"
              {...register("identifier")} 
              error={errors.identifier?.message} 
            />
            <div className="space-y-2 relative">
              <Input 
                label="Password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                {...register("password")} 
                error={errors.password?.message} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-secondary/30 hover:text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              <button 
                type="button"
                onClick={() => setIsForgotMode(true)}
                className="text-[9px] font-black uppercase tracking-widest text-secondary/40 hover:text-red-500 transition-colors float-right"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {serverError && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] uppercase tracking-widest bg-red-500/5 p-3 rounded">
              <AlertCircle size={14} />
              <span>{serverError}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-50 group border flex items-center justify-center py-4  border-secondary rounded-full shadow-2xl hover:border-secondary transition-all disabled:opacity-50 mt-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary">
              {loading ? "Authenticating..." : "Access Account"}
            </span>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <button 
            type="button"
            onClick={() => navigate('/signup')}
            className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40 hover:text-secondary transition-colors text-left"
          >
            New here? <span className="text-secondary border-b border-secondary/20 ml-1">Create Account</span>
          </button>
        </motion.form>
      ) : (
        <motion.form 
          key="forgot-form"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleForgotPassword}
          className="space-y-8"
        >
          <button 
            type="button"
            onClick={() => setIsForgotMode(false)}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary/40 hover:text-secondary mb-4"
          >
            <ArrowLeft size={12} /> Back to Login
          </button>

          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-secondary">Recover Access</h2>
            <p className="text-[10px] text-secondary/50 uppercase tracking-widest leading-relaxed">
              Choose your recovery method to receive a reset code or link.
            </p>
          </div>

          <div className="flex gap-4 border-b border-secondary/5 pb-2">
            <button 
              type="button"
              onClick={() => { setForgotMethod('email'); setForgotIdentifier(''); }}
              className={`text-[9px] font-black uppercase tracking-widest transition-all ${forgotMethod === 'email' ? 'text-secondary border-b border-secondary' : 'text-secondary/90'}`}
            >
              Email
            </button>
            <button 
              type="button"
              onClick={() => { setForgotMethod('sms'); setForgotIdentifier(''); }}
              className={`text-[9px] font-black uppercase tracking-widest transition-all ${forgotMethod === 'sms' ? 'text-secondary border-b border-secondary' : 'text-secondary/90'}`}
            >
              Phone (SMS)
            </button>
          </div>

          <Input 
            label={forgotMethod === 'email' ? "Recovery Email" : "Recovery Phone"} 
            placeholder={forgotMethod === 'email' ? "email@example.com" : "+251..."}
            value={forgotIdentifier}
            onChange={(e) => setForgotIdentifier(e.target.value)}
          />

          <button 
            type="submit" 
            disabled={loading || !forgotIdentifier}
            className="w-full group flex items-center justify-between py-6 border-b border-secondary/10 hover:border-secondary transition-all disabled:opacity-50"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary">
              {loading ? "Sending..." : "Send Reset Link"}
            </span>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : forgotMethod === 'email' ? <Mail size={16} /> : <Smartphone size={16} />}
          </button>
        </motion.form>
      )}
    </AnimatePresence>

    <Toast 
      isVisible={toast.show} 
      message={toast.msg} 
      type={toast.type} 
      onClose={() => setToast(p => ({...p, show: false}))} 
    />
    </>
  );
};

export default LoginForm;