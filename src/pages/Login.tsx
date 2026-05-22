import { useEffect, useState, type ComponentType } from 'react';
import { motion } from 'motion/react';
import { Circle, Chrome, Eye, EyeOff, Github } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithProvider } = useAuth();

  const heroContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (!errorParam) return;

    const errorMessages: Record<string, string> = {
      auth_failed: 'Google sign-in failed. Please try again.',
      no_session: 'Unable to establish session. Please try signing in again.',
      callback_failed: 'Authentication callback failed. Please try again.',
      no_token: 'Authentication token not received. Please try again.',
    };

    setError(errorMessages[errorParam] || 'An error occurred during sign-in. Please try again.');
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (provider === 'github') {
      setError('Github login is not implemented yet.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithProvider(provider);
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      <section className="relative hidden h-full w-[52%] flex-col items-center justify-center rounded-3xl px-12 shadow-2xl overflow-hidden lg:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        <motion.div
          className="z-10 w-full max-w-xs space-y-8 flex flex-col items-center text-center"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={heroItem} className="flex items-center justify-center gap-3">
            <Circle className="h-4 w-4 text-white" fill="white" />
            <span className="text-xl font-semibold tracking-tight">Arcade Learn</span>
          </motion.div>

          <motion.div variants={heroItem} className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-medium tracking-tight whitespace-nowrap">Welcome Back</h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              Log in to access your dashboard and continue your learning journey.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight">Sign In</h2>
            <p className="text-white/40 text-sm">Enter your credentials to access your account.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={Chrome} label="Google" onClick={() => handleOAuth('google')} />
            <SocialButton icon={Github} label="Github" onClick={() => handleOAuth('github')} />
          </div>

          <div className="relative flex items-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute left-1/2 -translate-x-1/2 bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">
              Or
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email</label>
              <input
                type="email"
                placeholder="you@arcadelearn.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[var(--color-brand-gray)] border border-white/10 rounded-xl h-11 px-4 text-white caret-white placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Password</label>
                <button type="button" className="text-xs text-white/40 hover:text-white transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full bg-[var(--color-brand-gray)] border border-white/10 rounded-xl h-11 px-4 text-white caret-white placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] mt-4 transition disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-white"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-white/40">
            Don't have an account?{' '}
            <Link 
              to="/signup"
              className="text-white hover:text-white/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function SocialButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black py-3 text-sm font-medium text-white hover:bg-white/5 transition"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
