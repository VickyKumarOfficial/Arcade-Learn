// Environment configuration helper
// Since frontend and backend are served from the same domain on Render,
// we use relative paths (no need to specify full backend URL)

export const getBackendUrl = (): string => {
  // For local development, use the dev server
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🏠 Using localhost backend');
    return 'http://localhost:8081';
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
