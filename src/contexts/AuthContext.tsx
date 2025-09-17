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
  updateProfile: (userData: Partial<Omit<User, 'id'>>) => Promise<void>;
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
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    // For faster login, just return basic user info from auth metadata
    // Profile data can be loaded separately if needed
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || 'User',
      lastName: supabaseUser.user_metadata?.last_name || null,
      phone: supabaseUser.user_metadata?.phone || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    };
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
          
          try {
            if (session?.user && event !== 'SIGNED_OUT') {
              const user = await convertSupabaseUser(session.user);
              // Since convertSupabaseUser now always returns a user object, we can safely use it
              setAuthState({
                user,
                isLoading: false,
                isAuthenticated: true,
                session,
              });
            } else if (event === 'SIGNED_OUT') {
              // Only clear auth state on explicit sign out
              setAuthState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                session: null,
              });
            }
            // For other events, maintain current state to prevent unwanted logouts
          } catch (error) {
            console.warn('Error in auth state change handler, maintaining current state:', error);
            // Don't clear the auth state on errors - just ensure loading is false
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
            }));
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

      // Reset loading state immediately after successful authentication
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
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

  const updateProfile = async (userData: Partial<Omit<User, 'id'>>) => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    console.log('🔍 Starting profile update process...');
    console.log('Current user:', authState.user);
    console.log('Session exists:', !!authState.session);

    try {
      // Check if we have valid Supabase environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        throw new Error('Profile update not available. Please configure Supabase credentials.');
      }

      console.log('✅ Supabase configuration verified');
      console.log('🔄 Updating profile for user:', authState.user.id, userData);

      // First, let's test if we can read the current profile
      console.log('📖 Testing read access to profiles table...');
      const { data: currentProfile, error: readError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user.id)
        .single();

      if (readError) {
        console.error('❌ Failed to read current profile:', readError);
        throw new Error(`Cannot read profile: ${readError.message}`);
      }

      console.log('✅ Current profile read successfully:', currentProfile);

      // Prepare update data, only include non-undefined values
      const updateData: any = {};
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.avatarUrl !== undefined) updateData.avatar_url = userData.avatarUrl;
      if (userData.email !== undefined) updateData.email = userData.email;

      console.log('📝 Update data being sent:', updateData);

      console.log('⏳ Sending update request...');

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      console.log('✅ Profile updated successfully:', data);

      // Update the local state immediately with the response data
      const updatedUser: User = {
        id: authState.user.id,
        email: data.email || authState.user.email,
        firstName: data.first_name || authState.user.firstName,
        lastName: data.last_name || authState.user.lastName,
        phone: data.phone || authState.user.phone,
        avatarUrl: data.avatar_url || authState.user.avatarUrl,
      };

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      console.log('✅ Local state updated with:', updatedUser);

    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      throw new Error(error.message || 'Profile update failed');
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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
