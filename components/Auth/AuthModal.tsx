
import React, { useEffect } from 'react';
import { X, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { UpdatePasswordForm } from './UpdatePasswordForm';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authView, errorMessage, setErrorMessage, user } = useAuth();

  // Safety fallback: if user is logged in, close the modal
  useEffect(() => {
    if (user && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [user, isAuthModalOpen, closeAuthModal]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeAuthModal]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0">
                <Activity className="text-black w-5 h-5 fill-current" />
             </div>
             <h2 className="text-xl font-bold text-[var(--text-main)]">
                {authView === 'login' && 'Welcome Back'}
                {authView === 'signup' && 'Create Account'}
                {authView === 'forgot_password' && 'Reset Password'}
                {authView === 'update_password' && 'Set New Password'}
             </h2>
          </div>
          <button 
            onClick={closeAuthModal} 
            className="p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
             <div className="flex-1">
               <p className="text-sm text-red-400">{errorMessage}</p>
             </div>
             <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300">
               <X className="w-4 h-4" />
             </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {authView === 'login' && <LoginForm />}
          {authView === 'signup' && <SignupForm />}
          {authView === 'forgot_password' && <ResetPasswordForm />}
          {authView === 'update_password' && <UpdatePasswordForm />}
        </div>
      </div>
    </div>
  );
};
