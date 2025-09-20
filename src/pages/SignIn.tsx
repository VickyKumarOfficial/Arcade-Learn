import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SignInProps {
  initialMode?: "login" | "register";
}

const SignIn: React.FC<SignInProps> = ({ initialMode = "login" }) => {
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const navigate = useNavigate();
  const { login, register, loginWithProvider, resendVerificationEmail } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendEmailSuccess, setResendEmailSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Basic validation
    if (isRegister && !form.firstName.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }
    
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    // Add timeout protection for the entire authentication process
    const authTimeout = setTimeout(() => {
      setLoading(false);
      setError("Authentication is taking too long. Please check your internet connection and try again.");
    }, 30000); // Reduced to 30 seconds timeout

    try {
      if (isRegister) {
        await register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        });
        // Show success message before redirect
        console.log("Registration successful! Redirecting...");
      } else {
        await login(form.email, form.password);
        console.log("Login successful! Redirecting...");
      }
      
      // Clear timeout since auth was successful
      clearTimeout(authTimeout);
      
      // Redirect to dashboard on successful login/register
      navigate('/dashboard');
    } catch (err: any) {
      // Clear timeout since we got a response (even if error)
      clearTimeout(authTimeout);
      console.error('Auth error:', err);
      
      // Handle specific error cases
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError(
          "Please check your email and click the confirmation link before signing in. " +
          "If you haven't received the email, check your spam folder or click 'Resend confirmation email' below."
        );
        setShowResendButton(true);
      } else if (err.message?.toLowerCase().includes('invalid credentials')) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message?.toLowerCase().includes('timeout')) {
        setError("Request timed out. Please check your internet connection and try again.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    setLoading(true);
    setError("");
    
    // Add timeout protection for OAuth
    const oauthTimeout = setTimeout(() => {
      setLoading(false);
      setError(`${provider} authentication is taking too long. Please try again.`);
    }, 60000); // 60 seconds timeout
    
    try {
      await loginWithProvider(provider);
      
      // Clear timeout since auth was successful
      clearTimeout(oauthTimeout);
      
      navigate('/dashboard');
    } catch (err: any) {
      // Clear timeout since we got a response (even if error)
      clearTimeout(oauthTimeout);
      console.error(`${provider} auth error:`, err);
      setError(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card text-foreground p-8 rounded-xl shadow-xl w-full max-w-md border border-border">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          {isRegister ? "Create your account" : "Sign in to ArcadeLearn"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="input"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name (optional)</label>
                <input
                  type="text"
                  name="lastName"
                  className="input"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="input"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              className="input"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              required
              className="input"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? "Sign Up"
              : "Sign In"}
          </Button>
          {showResendButton && !resendEmailSuccess && (
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full"
              onClick={async () => {
                try {
                  await resendVerificationEmail(form.email);
                  setResendEmailSuccess(true);
                  setError("Verification email has been resent. Please check your inbox.");
                } catch (err: any) {
                  setError(err.message || "Failed to resend verification email");
                }
              }}
            >
              Resend confirmation email
            </Button>
          )}
        </form>
        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={() => handleOAuth("google")}
        >
          <div className="flex items-center justify-center">
            <img 
              src="/assets/google-removebg-preview.png" 
              alt="Google logo" 
              className="w-6 h-6 mr-3 object-contain" 
            /> 
            <span>Continue with Google</span>
          </div>
        </Button>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {isRegister ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                  setShowResendButton(false);
                  setForm({
                    firstName: "",
                    lastName: "",
                    phone: "",
                    email: "",
                    password: "",
                  });
                }}
                className="text-primary hover:text-primary/90 font-medium"
              >
                Log in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                  setShowResendButton(false);
                  setForm({
                    firstName: "",
                    lastName: "",
                    phone: "",
                    email: "",
                    password: "",
                  });
                }}
                className="text-primary hover:text-primary/90 font-medium"
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
      <style>{`
        .gradient-text {
          background: linear-gradient(90deg, #346feeff, #336deaff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          color: #111827;
          margin-top: 0.25rem;
          transition: all 0.2s ease;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        /* Provider logo styles */
        img[alt="Google logo"] {
          display: inline-flex;
          object-fit: contain;
          aspect-ratio: 1;
          vertical-align: middle;
        }
        
        /* Dark mode styles */
        .dark .input {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        .dark .input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }
        .dark .input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
