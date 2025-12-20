
import React, { useState } from 'react';
import { Loader2, AlertCircle, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const { setAuthView, closeAuthModal } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Explicitly close the modal on success
      if (data.session) {
        closeAuthModal();
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('Email not verified'))) {
        setNeedsVerification(true);
        setError('Your email address has not been verified yet.');
      } else if (err.message && err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check for typos.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      
      alert(`Verification email resent to ${email}! Please check your inbox and spam folder.`);
      
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      alert(err.message || "Failed to resend verification email.");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex flex-col gap-2 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          
          {needsVerification && (
            <div className="ml-6 mt-1">
              <p className="text-[var(--text-muted)] text-xs mb-2">
                Please check your inbox (and spam) for the confirmation link.
              </p>
              <button 
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0}
                className="text-[var(--accent)] hover:underline text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {resendCooldown > 0 ? (
                  <span>Resend available in {resendCooldown}s</span>
                ) : (
                  <>
                    <Mail className="w-3 h-3" />
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
           <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-[var(--text-muted)]">Password</label>
             <button 
              type="button"
              onClick={() => setAuthView('forgot_password')}
              className="text-xs text-[var(--accent)] hover:underline"
             >
               Forgot Password?
             </button>
           </div>
           <div className="relative">
             <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none transition-colors pr-10"
                placeholder="••••••••"
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
             >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </button>
           </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm text-[var(--text-muted)]">
        Don't have an account?{' '}
        <button 
          onClick={() => setAuthView('signup')}
          className="text-[var(--text-main)] font-medium hover:text-[var(--accent)] transition-colors"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};
