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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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
      const { data, error } = await supabase.auth.signUp({
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

      if (error) throw error;

      // Note: User will need to confirm email before they can sign in
      // The auth state change listener will handle the state update
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
