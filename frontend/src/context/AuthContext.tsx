import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  avatarLetter: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, name: string, organization?: string) => Promise<void>;
  demoLogin: (role?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'discosynth_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // 1. If Supabase is configured, listen to Supabase auth state
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@legaltech.io',
            name: session.user.user_metadata?.full_name || 'Counsel User',
            role: session.user.user_metadata?.role || 'Lead Litigation Technologist',
            organization: session.user.user_metadata?.organization || 'Legal AI Labs',
            avatarLetter: (session.user.email?.[0] || 'U').toUpperCase(),
          });
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@legaltech.io',
            name: session.user.user_metadata?.full_name || 'Counsel User',
            role: session.user.user_metadata?.role || 'Lead Litigation Technologist',
            organization: session.user.user_metadata?.organization || 'Legal AI Labs',
            avatarLetter: (session.user.email?.[0] || 'U').toUpperCase(),
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }

    // 2. Local storage session fallback (for seamless local/portfolio demo mode)
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed reading auth state from localStorage:', err);
    }
    setIsLoading(false);
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsAuthModalOpen(false);
        return;
      }

      // Local fallback
      const defaultName = email.split('@')[0] || 'Legal Researcher';
      const cleanName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const profile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        name: cleanName,
        role: 'e-Discovery Engineer',
        organization: 'Benchmark Research Group',
        avatarLetter: cleanName.charAt(0).toUpperCase(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, name: string, organization = 'Litigation Systems Inc.') => {
    setIsLoading(true);
    try {
      const profile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        name: name || 'New Counsel',
        role: 'Senior E-Discovery Specialist',
        organization,
        avatarLetter: (name?.[0] || 'N').toUpperCase(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = (role = 'Lead E-Discovery Architect') => {
    const demoProfile: UserProfile = {
      id: 'demo_user_001',
      email: 'alexandra.chen@apex-litigation.com',
      name: 'Alexandra Chen',
      role,
      organization: 'Apex Litigation Partners & e-Discovery Labs',
      avatarLetter: 'A',
    };
    setUser(demoProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoProfile));
    setIsAuthModalOpen(false);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        demoLogin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
