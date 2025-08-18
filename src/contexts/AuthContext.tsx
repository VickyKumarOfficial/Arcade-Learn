import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    session: null,
  });

  // Helper function to convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Skip profile operations if using placeholder client
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || 'demo@example.com',
          firstName: supabaseUser.user_metadata?.first_name || 'Demo User',
          lastName: supabaseUser.user_metadata?.last_name || null,
          phone: supabaseUser.user_metadata?.phone || null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        };
      }

      // Get user profile from our profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching user profile:', error);
        return null;
      }

      // If profile doesn't exist, create one
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              first_name: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || 'User',
              last_name: supabaseUser.user_metadata?.last_name || null,
              phone: supabaseUser.user_metadata?.phone || null,
              avatar_url: supabaseUser.user_metadata?.avatar_url || null,
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }

        return {
          id: newProfile.id,
          email: newProfile.email,
          firstName: newProfile.first_name,
          lastName: newProfile.last_name,
          phone: newProfile.phone,
          avatarUrl: newProfile.avatar_url,
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
      };
    } catch (error) {
      console.error('Error converting Supabase user:', error);
      return null;
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const getSession = async () => {
      try {
        // Check if we have valid Supabase environment variables
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
          console.warn('⚠️ Supabase not configured. Running in demo mode.');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            session: null,
          });
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            session: null,
          });
          return;
        }

        if (session?.user) {
          const user = await convertSupabaseUser(session.user);
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: !!user,
            session,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            session: null,
          });
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          session: null,
        });
      }
    };

    getSession();

    // Listen for auth changes (only if we have valid Supabase configuration)
    let subscription: any = null;
    
    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (session?.user) {
            const user = await convertSupabaseUser(session.user);
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: !!user,
              session,
            });
          } else {
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              session: null,
            });
          }
        }
      );
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Check if we have valid Supabase environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        throw new Error('Authentication not available. Please configure Supabase credentials.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // User state will be updated automatically by the auth state change listener
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Check if we have valid Supabase environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        throw new Error('Registration not available. Please configure Supabase credentials.');
      }

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Create profile immediately
      console.log('Attempting to create profile for user:', authData.user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // Check if profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (existingProfile) {
          console.log('Profile already exists:', existingProfile);
          return; // Profile exists, we can continue
        }

        // If profile doesn't exist and we couldn't create it, cleanup and throw error
        console.error('Cleaning up auth user due to profile creation failure');
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Failed to cleanup auth user:', deleteError);
        }
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      // 3. Clear loading state and update auth state
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        user: {
          id: authData.user.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
        },
        isAuthenticated: true,
        session: authData.session
      }));
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message || 'Registration failed');
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      return;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const logout = async () => {
    try {
      // Only attempt logout if we have valid Supabase configuration
      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Clear local storage
      localStorage.removeItem('arcade-learn-game-data');
      
      // State will be updated automatically by the auth state change listener
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const loginWithProvider = async (provider: 'google' | 'github') => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Check if we have valid Supabase environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        throw new Error('OAuth login not available. Please configure Supabase credentials.');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      // OAuth will redirect, so state will be updated on return
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message || `${provider} login failed`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isLoading: authState.isLoading,
        isAuthenticated: authState.isAuthenticated,
        session: authState.session,
        login,
        register,
        logout,
        loginWithProvider,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
