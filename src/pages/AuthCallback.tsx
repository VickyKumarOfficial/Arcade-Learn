import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔐 Processing OAuth callback...');
        
        // Supabase will automatically detect and process the auth tokens from the URL
        // and update the session. We just need to wait for it and then check the session.
        
        // Small delay to ensure Supabase has processed the URL parameters
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session after OAuth:', error);
          navigate('/login?error=auth_failed');
          return;
        }

        if (!session || !session.user) {
          console.error('❌ No session found after OAuth callback');
          navigate('/login?error=no_session');
          return;
        }

        console.log('✅ OAuth session established for:', session.user.email);
        
        // Check if profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('📝 Creating profile for OAuth user...');
          
          // Extract name from user metadata
          const fullName = session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || 
                          '';
          const firstName = fullName.split(' ')[0] || 
                           session.user.email?.split('@')[0] || 
                           'User';
          const lastName = fullName.split(' ').slice(1).join(' ') || null;
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                first_name: firstName,
                last_name: lastName,
                avatar_url: session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture || 
                           null,
              }
            ]);

          if (insertError) {
            console.error('❌ Error creating profile:', insertError);
            // Continue anyway, profile can be created later
          } else {
            console.log('✅ Profile created successfully');
          }
        } else if (profile) {
          console.log('✅ Profile already exists');
        }

        // Redirect to dashboard
        console.log('🚀 Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
        
      } catch (error) {
        console.error('❌ Unexpected error in auth callback:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground">Completing sign in...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
