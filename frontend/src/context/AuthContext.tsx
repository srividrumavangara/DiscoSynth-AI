import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  avatarLetter: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, organization?: string) => Promise<{ needsEmailVerification?: boolean }>;
  demoLogin: (role?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'discosynth_auth_token';
const DEMO_USER_STORAGE_KEY = 'discosynth_demo_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // 1. Supabase Auth Integration
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && session?.access_token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, session.access_token);
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@legaltech.io',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Counsel User',
            role: session.user.user_metadata?.role || 'Lead Litigation Technologist',
            organization: session.user.user_metadata?.organization || 'Legal AI Labs',
            avatarLetter: (session.user.email?.[0] || 'U').toUpperCase(),
            isDemo: false,
          });
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && session?.access_token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, session.access_token);
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@legaltech.io',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Counsel User',
            role: session.user.user_metadata?.role || 'Lead Litigation Technologist',
            organization: session.user.user_metadata?.organization || 'Legal AI Labs',
            avatarLetter: (session.user.email?.[0] || 'U').toUpperCase(),
            isDemo: false,
          });
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          // Check if isolated demo user exists in fallback
          const demoStored = localStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (demoStored) {
            setUser(JSON.parse(demoStored));
          } else {
            setUser(null);
          }
        }
      });

      return () => subscription.unsubscribe();
    }

    // 2. Isolated Demo Session (when running without Supabase configuration)
    try {
      const demoStored = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (demoStored) {
        setUser(JSON.parse(demoStored));
      }
    } catch (err) {
      console.warn('Demo session restore error:', err);
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

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.session.access_token);
        }
        setIsAuthModalOpen(false);
        return;
      }

      throw new Error(
        'Supabase is not configured yet. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or use the "Isolated Demo Mode" below.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    organization = 'Litigation Systems Inc.'
  ) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              organization,
            },
          },
        });
        if (error) throw error;

        const needsEmailVerification = !data.session;
        if (data.session) {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.session.access_token);
        }
        setIsAuthModalOpen(false);
        return { needsEmailVerification };
      }

      throw new Error(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL or use Isolated Demo Evaluation.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = (role = 'Lead E-Discovery Architect') => {
    const demoProfile: UserProfile = {
      id: 'mock-user-demo-guest',
      email: 'demo-guest@discosynth.ai',
      name: 'Demo Evaluation Counsel',
      role,
      organization: 'Isolated Evaluation Environment',
      avatarLetter: 'D',
      isDemo: true,
    };
    setUser(demoProfile);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoProfile));
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-user-demo-guest');
    setIsAuthModalOpen(false);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseLive: Boolean(isSupabaseConfigured && supabase),
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
