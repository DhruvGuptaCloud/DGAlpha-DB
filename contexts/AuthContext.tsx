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
  
  // Ref to track if we are currently handling a URL error to prevent auto-closing via auth state changes
  const isHandlingUrlError = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    // Check URL for error parameters (e.g. expired links)
    const checkUrlErrors = () => {
      const hash = window.location.hash;
      // Check for common error parameters in the hash
      if (hash && (hash.includes('error=') || hash.includes('error_code='))) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description');
        const errorCode = params.get('error_code');
        const error = params.get('error');
        
        // Handle OTP expired, access denied, or general invalid links
        if (
          errorCode === 'otp_expired' || 
          error === 'access_denied' ||
          errorDescription?.toLowerCase().includes('expired') || 
          errorDescription?.toLowerCase().includes('invalid')
        ) {
          isHandlingUrlError.current = true;
          const friendlyMessage = errorDescription?.replace(/\+/g, ' ') || "Link expired or invalid. Please request a new one.";
          setErrorMessage(friendlyMessage);
          setAuthView('forgot_password'); // Redirect to forgot password so they can request new one immediately
          setIsAuthModalOpen(true);
          
          // Clear hash to prevent repeated errors on reload
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    checkUrlErrors();

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Always update session and user from the event
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
        setIsAuthModalOpen(false);
        setErrorMessage(null); // Clear errors on success
      } else if (event === 'SIGNED_OUT') {
        // Clear local profile state
        setUserProfile(null);
        setUser(null);
        setSession(null);
        
        // Only close the modal if we are NOT currently displaying a URL-based error (like link expired)
        if (!isHandlingUrlError.current) {
           setIsAuthModalOpen(false);
        }
        
        // Reset the ref for future interactions
        isHandlingUrlError.current = false;
      } else if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
        setIsAuthModalOpen(true);
        setErrorMessage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (view: 'login' | 'signup' = 'login') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
    setErrorMessage(null); // Clear error when manually opening
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthView('login'); // Reset to default
    setErrorMessage(null);
    isHandlingUrlError.current = false;
  };

  const signOut = async () => {
    // 1. Optimistically clear local state immediately for UI responsiveness
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setIsAuthModalOpen(false);

    try {
      // 2. Call Supabase to invalidate session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      // Note: onAuthStateChange('SIGNED_OUT') will also fire, ensuring synchronization
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