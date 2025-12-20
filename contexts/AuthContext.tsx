
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authView: 'login' | 'signup' | 'forgot_password' | 'update_password';
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthView: (view: 'login' | 'signup' | 'forgot_password' | 'update_password') => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot_password' | 'update_password'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isHandlingUrlError = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Profile not found or fetch error:', error.message);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    const checkUrlErrors = () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('error=') || hash.includes('error_code='))) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description');
        const errorCode = params.get('error_code');
        const error = params.get('error');
        
        if (
          errorCode === 'otp_expired' || 
          error === 'access_denied' ||
          errorDescription?.toLowerCase().includes('expired') || 
          errorDescription?.toLowerCase().includes('invalid')
        ) {
          isHandlingUrlError.current = true;
          const friendlyMessage = errorDescription?.replace(/\+/g, ' ') || "Link expired or invalid. Please request a new one.";
          setErrorMessage(friendlyMessage);
          setAuthView('forgot_password');
          setIsAuthModalOpen(true);
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    checkUrlErrors();

    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        // Ensure loading is false even if fetch fails
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        setIsAuthModalOpen(false);
        setErrorMessage(null);
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setUser(null);
        setSession(null);
        if (!isHandlingUrlError.current) {
           setIsAuthModalOpen(false);
        }
        isHandlingUrlError.current = false;
      } else if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
        setIsAuthModalOpen(true);
        setErrorMessage(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (view: 'login' | 'signup' = 'login') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
    setErrorMessage(null);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthView('login');
    setErrorMessage(null);
    isHandlingUrlError.current = false;
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setIsAuthModalOpen(false);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Exception signing out:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      userProfile,
      loading,
      isAuthModalOpen,
      authView,
      openAuthModal,
      closeAuthModal,
      setAuthView,
      signOut,
      refreshProfile,
      errorMessage,
      setErrorMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
