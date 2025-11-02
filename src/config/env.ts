// Environment configuration helper
// This ensures the backend URL is always correctly set

export const getBackendUrl = (): string => {
  // 1. First priority: Environment variable (set during build in Vercel)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // 2. Second priority: Check if we're on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8081';
  }

  // 3. Fallback for production: Use the known Render URL
  // This ensures it works even if env var is not set during build
  return 'https://arcade-learn-backend.onrender.com';
};

export const BACKEND_URL = getBackendUrl();
