// Environment configuration helper
// Since frontend and backend are served from the same domain on Render,
// we use relative paths (no need to specify full backend URL)

export const getBackendUrl = (): string => {
  const explicitBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (explicitBackendUrl) {
    console.log('🧭 Using explicit VITE_BACKEND_URL');
    return explicitBackendUrl;
  }

  // For local development, always use the local backend.
  if (import.meta.env.DEV) {
    return 'http://localhost:8081';
  }

  // Fallback safety for local-like hosts in non-standard runs.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return 'http://localhost:8081';
    }
  }

  // For production on Render, use relative path (same domain)
  // This means: if site is at https://arcade-learn.onrender.com
  // API will be at https://arcade-learn.onrender.com/api
  console.log('🌐 Using same-domain backend (relative path)');
  return ''; // Empty string = same domain
};

export const BACKEND_URL = getBackendUrl();

// Log the final backend URL being used
console.log('🔗 Final BACKEND_URL:', BACKEND_URL || '(same domain)');
