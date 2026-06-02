/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService';
import { toast } from 'react-hot-toast';

const CompleteRegistrationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Grab the ?token=... value out of the URL bar automatically
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Registration token is missing or invalid.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send the token along with the password and full name to your backend registration endpoint
      await authService.completeOrgRegistration({
        token: token,
        full_name: fullName,
        password: password,
      });

      toast.success("Account setup complete! You can now log in.");
      navigate('/login'); // Redirect them to your dashboard login page
    } catch (error: any) {
      const serverMessage = error.response?.data?.error || error.response?.data?.message;
      toast.error(serverMessage || "Failed to complete registration. The token may be expired.");
      console.error("Registration confirmation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If someone stumbles onto this page without a token link, show an error state
  if (!token) {
    return (
      <div className="min-h-screen bg-primary/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-secondary/10 shadow-xl text-center flex flex-col gap-4">
          <span className="text-4xl">❌</span>
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wide">Invalid Invitation Link</h2>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed">
            This registration link is invalid or expired. Please contact your system administrator to receive a new invite link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-secondary/10 shadow-2xl flex flex-col gap-6">
        
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-xl">⚙️</span> Complete Account Setup
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
            You have been invited as an Organization Administrator. Please choose a strong password to secure your account.
          </p>
        </div>

        <hr className="border-secondary/5" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[10px] uppercase tracking-widest font-black text-secondary/40 ml-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={isSubmitting}
              className="w-full bg-primary/5 border border-secondary/10 rounded-2xl px-5 py-4 text-sm text-neutral-800 outline-none transition-all focus:border-secondary/30 disabled:opacity-50"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[10px] uppercase tracking-widest font-black text-secondary/40 ml-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full bg-primary/5 border border-secondary/10 rounded-2xl px-5 py-4 text-sm text-neutral-800 outline-none transition-all focus:border-secondary/30 disabled:opacity-50"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[10px] uppercase tracking-widest font-black text-secondary/40 ml-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full bg-primary/5 border border-secondary/10 rounded-2xl px-5 py-4 text-sm text-neutral-800 outline-none transition-all focus:border-secondary/30 disabled:opacity-50"
              required
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving Your Credentials...
              </>
            ) : (
              "Activate Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
export default CompleteRegistrationPage;