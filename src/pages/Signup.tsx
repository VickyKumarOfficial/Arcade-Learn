import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { motion } from 'motion/react';
import { Check, Circle, Chrome, Eye, EyeOff, Github } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSurvey } from '@/contexts/SurveyContext';
import { InlineSurvey } from '@/components/InlineSurvey';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const navigate = useNavigate();
  const { register, loginWithProvider, isAuthenticated, resendVerificationEmail, refreshSession } = useAuth();
  const { state: surveyState } = useSurvey();
  
  const showSurvey = isAuthenticated && !surveyState.isCompleted;
  const stepOneDone = isAuthenticated;
  const stepOnePending = verificationRequested && !isAuthenticated;
  const stepOneActive = !isAuthenticated && !verificationRequested;
  const stepTwoDone = surveyState.isCompleted;
  const stepTwoActive = isAuthenticated && !surveyState.isCompleted;
  const stepThreeDone = surveyState.isCompleted;

  useEffect(() => {
    if (isAuthenticated && surveyState.isCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, surveyState.isCompleted, navigate]);

  useEffect(() => {
    if (isAuthenticated) return;
    const pendingEmail = localStorage.getItem('arcade-signup-pending-email');
    if (pendingEmail) {
      setVerificationRequested(true);
      setVerificationEmail(pendingEmail);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setVerificationRequested(false);
      setVerificationEmail('');
      localStorage.removeItem('arcade-signup-pending-email');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!verificationRequested || isAuthenticated) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'arcade-learn-auth') {
        refreshSession().catch(() => null);
      }
    };

    const handleFocus = () => {
      refreshSession().catch(() => null);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [verificationRequested, isAuthenticated, refreshSession]);

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

  const passwordChecks = useMemo(
    () => [
      {
        id: 'length',
        label: 'At least 8 characters',
        test: (value: string) => value.length >= 8,
      },
      {
        id: 'letters',
        label: 'Includes letters (a-z)',
        test: (value: string) => /[a-zA-Z]/.test(value),
      },
      {
        id: 'numbers',
        label: 'Includes numbers (0-9)',
        test: (value: string) => /\d/.test(value),
      },
      {
        id: 'special',
        label: 'Includes special character',
        test: (value: string) => /[^A-Za-z0-9]/.test(value),
      },
    ],
    [],
  );

  const { strengthLevel, strengthLabel, strengthPercent, satisfiedChecks } = useMemo(() => {
    const satisfied = passwordChecks.filter((rule) => rule.test(password)).map((rule) => rule.id);
    const count = satisfied.length;
    const percent = Math.max(8, Math.round((count / passwordChecks.length) * 100));

    if (count >= passwordChecks.length) {
      return {
        strengthLevel: 'strong',
        strengthLabel: 'Strong',
        strengthPercent: percent,
        satisfiedChecks: satisfied,
      };
    }

    if (count >= 2) {
      return {
        strengthLevel: 'normal',
        strengthLabel: 'Normal, but easy to hack',
        strengthPercent: percent,
        satisfiedChecks: satisfied,
      };
    }

    return {
      strengthLevel: 'weak',
      strengthLabel: 'Very weak',
      strengthPercent: percent,
      satisfiedChecks: satisfied,
    };
  }, [password, passwordChecks]);

  const isStrong = strengthLevel === 'strong';
  const strengthColor =
    strengthLevel === 'strong'
      ? 'bg-emerald-400'
      : strengthLevel === 'normal'
        ? 'bg-orange-400'
        : 'bg-red-500';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isStrong) return;
    setError('');
    setLoading(true);
    try {
      const result = await register({ email, password, firstName, lastName });
      if (result.status === 'verification_required') {
        setVerificationRequested(true);
        setVerificationEmail(email);
        localStorage.setItem('arcade-signup-pending-email', email);
        return;
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (provider === 'github') {
      setError('Github signup is not implemented yet.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithProvider(provider);
    } catch (err: any) {
      setError(err.message || `Failed to sign up with ${provider}`);
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshingSession(true);
    try {
      await refreshSession();
    } finally {
      setIsRefreshingSession(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = verificationEmail || email;
    if (!targetEmail) {
      setError('Please enter your email to resend the verification link.');
      return;
    }

    setIsResendingEmail(true);
    setError('');
    try {
      await resendVerificationEmail(targetEmail);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      <section className="relative hidden h-full w-[52%] flex-col items-center justify-end rounded-3xl px-12 pb-32 shadow-2xl overflow-hidden lg:flex">
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
          className="z-10 w-full max-w-xs space-y-8"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={heroItem} className="flex items-center gap-3">
            <Circle className="h-4 w-4 text-white" fill="white" />
            <span className="text-xl font-semibold tracking-tight">Arcade Learn</span>
          </motion.div>

          <motion.div variants={heroItem} className="space-y-3">
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap">Join Arcade Learn</h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              Follow these 3 quick phases to activate your Arcade Learn space.
            </p>
          </motion.div>

          <motion.div variants={heroItem} className="space-y-3">
            <StepItem
              number="1"
              text="Register your identity"
              active={stepOneActive}
              pending={stepOnePending}
              done={stepOneDone}
            />
            <StepItem
              number="2"
              text="Answer quick survey"
              active={stepTwoActive}
              done={stepTwoDone}
            />
            <StepItem
              number="3"
              text="Start your journey"
              done={stepThreeDone}
            />
          </motion.div>
        </motion.div>
      </section>

      <section className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight">
              {showSurvey ? 'Tell us about you' : 'Create New Profile'}
            </h2>
            <p className="text-white/40 text-sm">
              {showSurvey ? 'This helps us personalize your experience.' : 'Input your basic details to begin the journey.'}
            </p>
          </div>

          {showSurvey ? (
            <InlineSurvey />
          ) : verificationRequested && !isAuthenticated ? (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Verify your email to continue</p>
                <p className="text-xs text-white/70">
                  We sent a confirmation link to{' '}
                  <span className="text-white">{verificationEmail || email}</span>. Open it to unlock Step 2
                  and continue the survey in this tab.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshingSession}
                  className="h-10 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRefreshingSession ? 'Checking...' : 'I already verified'}
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingEmail}
                  className="h-10 rounded-xl border border-white/15 px-4 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isResendingEmail ? 'Resending...' : 'Resend email'}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-400">
                  {error}
                </p>
              )}
              <p className="text-[11px] text-white/50">
                Tip: if the confirmation opened in another tab, you can return here and click “I already verified.”
              </p>
            </div>
          ) : (
            <>
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

              <form
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputGroup label="First Name" placeholder="Nova" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <InputGroup label="Last Name" placeholder="Sterling" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>

                <InputGroup label="Email" placeholder="you@arcadelearn.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
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

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Password strength</span>
                    <span className={strengthLevel === 'strong' ? 'text-emerald-300' : strengthLevel === 'normal' ? 'text-orange-300' : 'text-red-300'}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-2 flex-1 min-w-[140px] rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className={`h-full ${strengthColor}`}
                        animate={{ width: `${strengthPercent}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {passwordChecks.map((rule) => {
                        const met = satisfiedChecks.includes(rule.id);
                        return (
                          <motion.div
                            key={rule.id}
                            className="inline-flex items-center gap-1.5 text-[11px] text-white/50"
                            animate={{ opacity: met ? 1 : 0.6, y: met ? 0 : 2 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                          >
                            <span
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${met ? 'border-emerald-400 bg-emerald-400' : 'border-white/15'
                                }`}
                            >
                              {met && <Check className="h-3 w-3 text-black" />}
                            </span>
                            {rule.label}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isStrong || loading}
                  className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] mt-4 transition disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-white"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          <p className="text-sm text-white/40">
            Member of the team?{' '}
            <Link to="/login" className="text-white hover:text-white/80 transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function StepItem({
  number,
  text,
  active = false,
  done = false,
  pending = false,
}: {
  number: string;
  text: string;
  active?: boolean;
  done?: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${active
          ? 'bg-white text-black border border-white'
          : pending
            ? 'bg-white/5 text-white border border-amber-400/30'
            : 'bg-brand-gray text-white border-none'
        }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          done
            ? 'bg-emerald-400 text-black'
            : active
              ? 'bg-black text-white'
              : pending
                ? 'bg-amber-400/20 text-amber-100 border border-amber-400/40'
                : 'bg-white/10 text-white/40'
          }`}
      >
        {done ? <Check className="h-4 w-4" /> : number}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
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

function InputGroup({
  label,
  placeholder,
  type,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-[var(--color-brand-gray)] border border-white/10 rounded-xl h-11 px-4 text-white caret-white placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/20 outline-none"
      />
    </div>
  );
}
