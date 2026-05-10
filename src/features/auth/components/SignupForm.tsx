import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../../../src/components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth.ts'; 
import { authService } from '../../../features/auth/services/authService';
import Toast from '../../../components/ui/Toast'; 
import axios from 'axios';
import { isOrganizationAdminRole } from '../../../lib/roleUtils';

const normalizeEthiopianPhone = (value: string) => {
  const clean = value.replace(/[\s-]/g, '');
  if (clean.startsWith('+251')) return clean;
  if (clean.startsWith('251')) return `+${clean}`;
  if (clean.startsWith('0') && clean.length === 10) return `+251${clean.slice(1)}`;
  if (clean.startsWith('9') && clean.length === 9) return `+251${clean}`;
  return clean;
};

const signupSchema = z.object({
  full_name: z.string()
    .min(1, "Name is required")
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: "Please enter both your first and last name",
    }),
  phone: z.string()
    .min(9, "Phone number is too short")
    .max(13, "Phone number is too long")
    .refine((val) => /^(?:\+251|251|0)?9\d{8}$/.test(val.replace(/[\s-]/g, '')), "Use a valid Ethiopian number (e.g. +2519XXXXXXXX)"),
  email: z.string()
    .email("Invalid email address"),
  password: z.string()
    .min(8, "Security requires at least 8 characters"),
});

type SignupData = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [tempId, setTempId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'error' | 'success' }>({ show: false, msg: '', type: 'error' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, trigger, getValues, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const handleContinue = async () => {
    const isStepValid = await trigger(["full_name", "phone", "password", "email"]);
    if (isStepValid) setStep(2);
  };

  const triggerToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const onFinalSubmit = async (method: 'sms' | 'email') => {
    setLoading(true);
    const data = getValues();
    
    try {
      const normalizedPhone = normalizeEthiopianPhone(data.phone);
      const result = await authService.register({
        email: data.email,
        full_name: data.full_name, 
        phone: normalizedPhone,
        password: data.password,
        confirm_password: data.password, 
        verification_method: method
      });

      if(result.temp_id) {
        setTempId(result.temp_id);
        setStep(3);
        triggerToast(`OTP sent via ${method === 'sms' ? 'SMS' : 'Email'}.`, "success");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 429) {
          triggerToast("Security: Too many signup attempts. Please wait 60s.", "error");
        } else {
          const responseData = error.response?.data;
          const fieldError = responseData && typeof responseData === 'object'
            ? Object.values(responseData)[0]
            : null;
          const errorDetail =
            responseData?.detail ||
            responseData?.error ||
            (Array.isArray(fieldError) ? String(fieldError[0]) : typeof fieldError === 'string' ? fieldError : null) ||
            "Registration failed. Please check your data.";
          triggerToast(errorDetail, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!tempId || otpCode.length < 4) {
      triggerToast("Please enter a valid verification code.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOTP({
        temp_id: tempId,
        otp_code: otpCode
      });

        if (result.access && result.user) {
        triggerToast("Identity verified! Access granted.", "success");
        
        setTimeout(() => {
          login({ access: result.access, refresh: result.refresh, user: result.user });
          const role = result.user.role_name;
          if (role === 'system_admin') navigate('/admin-dashboard');
          else if (isOrganizationAdminRole(role)) navigate('/organization-admin/dashboard');
          else navigate('/report');
        }, 1500);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorDetail = error.response?.data?.detail || "Invalid code. Please try again.";
        triggerToast(errorDetail, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="relative overflow-hidden min-h-115">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-10"
          >
            <div className="space-y-8">
              <Input 
                label="Full Name" 
                placeholder="Hebron Enyew"
                {...register("full_name")}
                error={errors.full_name?.message}
              />
              <Input 
                label="Email" 
                placeholder="Abebe@email.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input 
                label="Contact / Phone" 
                placeholder="+251911..."
                {...register("phone")}
                error={errors.phone?.message}
              />
              <div className="relative">
                <Input 
                  label="Secure / Password" 
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
              </div>
            </div>

            <button 
              type="button"
              onClick={handleContinue}
              className="w-full group flex items-center justify-between py-6 border-b border-secondary/10 hover:border-secondary transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary">
                Verify Credentials
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
            <Link to="/login" className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary">
                Already have an account? <span className='border-b border-secondary'>Login</span>
            </Link>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-12 pt-2"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-500/60">
                <CheckCircle2 size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Identity Validated</span>
              </div>
              <h4 className="text-3xl font-light text-secondary uppercase leading-none tracking-tight">
                Security <br />
                <span className="text-secondary/60 italic lowercase">Verification</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                disabled={loading}
                onClick={() => onFinalSubmit('sms')}
                className="flex items-center gap-6 p-6 border border-secondary/5 hover:border-secondary/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-all">
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-primary">SMS OTP</span>
                  <span className="text-[8px] text-primary/60 uppercase tracking-tighter">Fastest Activation</span>
                </div>
              </Button>

              <Button 
                disabled={loading}
                onClick={() => onFinalSubmit('email')}
                className="flex items-center gap-6 p-6 border border-secondary/5 hover:border-secondary/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-all">
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-primary">Email SMTP</span>
                  <span className="text-[8px] text-primary/60 uppercase tracking-tighter">Standard OTP Route</span>
                </div>
              </Button>
              <button 
              onClick={() => setStep(1)}
              className="group flex items-center gap-2 text-[10px] font-header uppercase tracking-[0.3em] text-secondary hover:text-secondary/90 transition-colors"
            >
              ← Edit Identity
            </button>
            </div>

            
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10 pt-2"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-500/60">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Awaiting Authorization</span>
              </div>
              <h4 className="text-3xl font-light text-secondary uppercase leading-none tracking-tight">
                Enter <br />
                <span className="text-secondary/60 italic lowercase">Access Code</span>
              </h4>
            </div>

            <div className="space-y-6">
              <Input 
                label="Verification Code" 
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
              />
              
              <Button 
                onClick={handleVerify}
                disabled={loading || otpCode.length < 4}
                className="w-full py-6 bg-secondary text-primary hover:bg-secondary/90 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Authenticate Account</span>
                )}
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setStep(2)}
                className="text-left text-[8px] font-black uppercase tracking-[0.3em] text-secondary/90 hover:text-secondary transition-colors"
              >
                ← Change Method
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <Toast 
      isVisible={toast.show} 
      message={toast.msg} 
      type={toast.type} 
      onClose={() => setToast(prev => ({ ...prev, show: false }))} 
    />
    </>
  );
};

export default SignupForm;