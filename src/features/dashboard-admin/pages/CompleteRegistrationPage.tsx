/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, EyeOff, Eye } from 'lucide-react';
import Toast, { type ToastType } from '../../../components/ui/Toast';

const CompleteRegistrationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; msg: string; type: ToastType }>({
    show: false,
    msg: '',
    type: 'info'
  });

  const showToast = (msg: string, type: ToastType) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const handleClose = () => {
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast("Registration token is missing or invalid.", "error");
      return;
    }

    if (!fullName.trim()) {
      showToast("Full name is required.", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.completeOrgRegistration({
        token: token,
        full_name: fullName,
        password: password,
        confirm_password: confirmPassword,
      });

      showToast("Account setup complete! You can now log in.", "success");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const serverMessage = error.response?.data?.error || error.response?.data?.message || "Failed to complete registration. The token may be expired.";
      showToast(serverMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full bg-primary flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none overflow-hidden">
          <h1 className="text-[25vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
              የኛ Fix
          </h1>
        </div>
        <Modal isOpen={true} onClose={handleClose} title="Invalid Link">
          <div className="text-center flex flex-col gap-4 py-8">
            <span className="text-4xl">❌</span>
            <p className="text-[10px] text-secondary/50 uppercase tracking-widest leading-relaxed">
              This registration link is invalid or expired. Please contact your system administrator to receive a new invite link.
            </p>
            <button 
              onClick={handleClose}
              className="w-full mt-4 group border flex items-center justify-center py-4 bg-secondary/90 hover:bg-secondary border-primary text-primary rounded-full shadow-2xl hover:border-secondary transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
                Return to Login
              </span>
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-primary flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none overflow-hidden">
        <h1 className="text-[25vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
            የኛ Fix
        </h1>
      </div>

      <Modal 
        isOpen={true} 
        onClose={handleClose}
        title="Complete Account Setup"
      >
        <motion.form 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="space-y-4">
            <p className="text-[10px] text-secondary/50 uppercase tracking-widest leading-relaxed mb-6">
              You have been invited as an Organization Administrator. Please complete your profile.
            </p>

            <Input 
              label="Full Name" 
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="space-y-2 relative">
              <Input 
                label="New Password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-secondary/30 hover:text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="space-y-2 relative">
              <Input 
                label="Confirm Password" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-10 text-secondary/30 hover:text-secondary transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full group border flex items-center justify-center py-4 bg-secondary/90 hover:bg-secondary border-primary text-primary rounded-full shadow-2xl hover:border-secondary transition-all disabled:opacity-50 mt-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
              {isSubmitting ? "Activating..." : "Activate Account"}
            </span>
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 ml-2" /> : <ShieldCheck size={16} className="ml-2 group-hover:scale-110 text-primary transition-transform" />}
          </button>
        </motion.form>
      </Modal>

      <Toast 
        isVisible={toast.show} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast(p => ({...p, show: false}))} 
      />
    </div>
  );
}

export default CompleteRegistrationPage;