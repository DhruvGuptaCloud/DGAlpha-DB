import React, { useState } from 'react';
import { Loader2, AlertCircle, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export const ResetPasswordForm: React.FC = () => {
  const { setAuthView } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailToReset = email.trim();

    if (!emailToReset) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
    }

    try {
      // We use window.location.origin which is typically http://localhost:3000 or the production domain
      // Ensure this URL is added to the "Redirect URLs" in your Supabase Dashboard > Authentication > URL Configuration
      const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
        redirectTo: window.location.origin, 
      });
      
      if (error) {
        // Handle rate limit specific error if Supabase exposes it, otherwise generic
        if (error.status === 429) {
             throw new Error("Too many requests. Please wait a minute before trying again.");
        }
        throw error;
      }
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || 'Failed to send reset email. Please verify the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 py-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-[rgba(var(--accent-rgb),0.1)] rounded-full flex items-center justify-center mx-auto ring-4 ring-[var(--bg-main)]">
          <Mail className="w-8 h-8 text-[var(--accent)]" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-[var(--text-main)]">Check your email</h3>
            <div className="mt-3 text-[var(--text-muted)] text-sm space-y-2">
                <p>
                We've sent a password reset link to <br/>
                <span className="text-[var(--text-main)] font-bold">{email}</span>
                </p>
                <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-secondary)] text-left mx-auto max-w-xs mt-4">
                    <p className="font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-[var(--accent)]" />
                        Don't see it?
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-dim)]">
                        <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
                        <li>Check the <strong>Promotions</strong> tab.</li>
                        <li>It may take a few minutes to arrive.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-3">
            <button 
            onClick={() => setAuthView('login')}
            className="w-full bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] font-medium py-2 rounded-lg transition-colors border border-[var(--border-secondary)]"
            >
            Back to Login
            </button>
            <button 
                onClick={() => setSuccess(false)}
                className="text-xs text-[var(--text-dim)] hover:text-[var(--accent)] flex items-center justify-center gap-1"
            >
                <RefreshCw className="w-3 h-3" />
                Try a different email
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-4">
        <button onClick={() => setAuthView('login')} className="hover:text-[var(--text-main)] flex items-center transition-colors">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Reset Password</h3>
        <p className="text-[var(--text-muted)] text-sm">
            Enter your registered email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2 text-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
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
            className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--text-dim)]"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};