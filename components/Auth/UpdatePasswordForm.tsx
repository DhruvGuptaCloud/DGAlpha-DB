import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export const UpdatePasswordForm: React.FC = () => {
  const { setAuthView } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // Success will automatically switch session, but let's be explicit
      setAuthView('login');
      alert("Password updated successfully! Please log in.");
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            placeholder="New Password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            placeholder="Confirm Password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};
