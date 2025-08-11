import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const SignIn: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? form
        : { email: form.email, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // If the response is not JSON, show a generic error
        throw new Error("Server error. Please try again later.");
      }
      if (!res.ok) throw new Error(data?.error || "Unknown error");
      // TODO: handle login success (store token, redirect, etc)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    // TODO: Implement OAuth popup/redirect
    alert(`OAuth with ${provider} not implemented yet.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="bg-white/90 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
          {isRegister ? "Create your account" : "Sign in to SkillPath"}
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
        {/* Only show the create account link on login page, not on sign up */}
        {!isRegister && (
          <div className="mt-6 text-center text-sm">
            New to SkillPath?{' '}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsRegister(true)}
              type="button"
            >
              Create an account
            </button>
          </div>
        )}
      </div>
      <style>{`
        .gradient-text {
          background: linear-gradient(90deg, #2563eb, #9333ea);
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
