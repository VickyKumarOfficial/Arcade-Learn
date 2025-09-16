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
      setError("Authentication is taking too long. Please try again.");
    }, 60000); // 60 seconds timeout

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

  const handleOAuth = async (provider: "google" | "github") => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
      <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
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
              className="input text-black"
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
              className="input text-black"
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
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-xs">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={() => handleOAuth("google")}
        >
          <span className="mr-2">🔵</span> Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuth("github")}
        >
          <span className="mr-2">🐙</span> Continue with GitHub
        </Button>

        <div className="mt-4 text-center text-sm text-gray-600">
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
                className="text-blue-600 hover:text-blue-700 font-medium"
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
                className="text-blue-600 hover:text-blue-700 font-medium"
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
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
