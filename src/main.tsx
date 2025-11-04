import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Debug: Check if Google Client ID is loaded
console.log('🔐 Google OAuth Client ID Status:', {
  loaded: !!GOOGLE_CLIENT_ID,
  length: GOOGLE_CLIENT_ID?.length || 0,
  prefix: GOOGLE_CLIENT_ID?.substring(0, 15) + '...' || 'MISSING'
});

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not set in .env file!');
  console.error('Please add: VITE_GOOGLE_CLIENT_ID=your_client_id_here');
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
