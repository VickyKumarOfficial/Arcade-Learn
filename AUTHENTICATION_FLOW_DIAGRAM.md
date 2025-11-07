# Authentication Flow Diagram

## Current Implementation (FIXED ✅)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Authentication                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐         ┌──────────────────────────────┐
│  Email/Password Login   │         │     Google OAuth Login       │
└─────────────────────────┘         └──────────────────────────────┘
           │                                      │
           │                                      │
           ▼                                      ▼
    ┌─────────────┐                      ┌────────────────┐
    │ SignIn.tsx  │                      │  SignIn.tsx    │
    │   login()   │                      │ handleOAuth()  │
    └─────────────┘                      └────────────────┘
           │                                      │
           │                                      │
           ▼                                      ▼
    ┌──────────────────┐               ┌─────────────────────┐
    │  AuthContext     │               │   AuthContext       │
    │ signInWithPass() │               │ loginWithProvider() │
    └──────────────────┘               └─────────────────────┘
           │                                      │
           │                                      │
           ▼                                      ▼
    ┌──────────────────┐               ┌─────────────────────┐
    │   Supabase       │               │   Supabase          │
    │   Auth API       │               │ signInWithOAuth()   │
    └──────────────────┘               └─────────────────────┘
           │                                      │
           │                                      │
           ▼                                      ▼
    ┌──────────────────┐               ┌─────────────────────┐
    │ Session Created  │               │  Redirect to Google │
    └──────────────────┘               └─────────────────────┘
           │                                      │
           │                                      │
           ▼                                      ▼
    ┌──────────────────┐               ┌─────────────────────┐
    │ Navigate to      │               │ User Approves on    │
    │  /dashboard      │               │  Google             │
    └──────────────────┘               └─────────────────────┘
                                                  │
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ Google Redirects to │
                                       │  /auth/callback     │
                                       └─────────────────────┘
                                                  │
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ AuthCallback.tsx    │
                                       │ - Get session       │
                                       │ - Create profile    │
                                       └─────────────────────┘
                                                  │
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ Navigate to         │
                                       │  /dashboard         │
                                       └─────────────────────┘
```

## Previous Implementation (BROKEN ❌)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   OLD - Google OAuth (BROKEN)                        │
└─────────────────────────────────────────────────────────────────────┘

    ┌────────────────┐
    │  SignIn.tsx    │
    │ googleLogin()  │ ← useGoogleLogin from @react-oauth/google
    └────────────────┘
           │
           │ (CONFLICT: Two OAuth systems fighting)
           │
           ├──────────────┬──────────────┐
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐  ┌──────────────┐
    │  Google  │   │ Supabase │  │ AuthContext  │
    │  OAuth   │   │  OAuth   │  │loginProvider │
    └──────────┘   └──────────┘  └──────────────┘
           │              │              │
           │              │              │
           ▼              ▼              ▼
    ┌─────────────────────────────────────┐
    │      CHAOS AND BLACK SCREEN         │
    │   404 errors, no route handling     │
    │   /auth/callback doesn't exist!     │
    └─────────────────────────────────────┘
```

## Key Differences

### What Was Wrong ❌
1. **Two OAuth Systems**: `@react-oauth/google` AND Supabase OAuth competing
2. **No Callback Route**: `/auth/callback` route didn't exist in App.tsx
3. **Wrong Redirect**: Tried to go to `/dashboard` instead of `/auth/callback`
4. **Manual Token Handling**: Old code tried to manually parse OAuth tokens
5. **No Profile Creation**: OAuth users didn't get profiles created

### What's Fixed Now ✅
1. **Single OAuth System**: Only Supabase OAuth is used
2. **Callback Route Exists**: `/auth/callback` is registered and working
3. **Correct Redirect**: OAuth → `/auth/callback` → `/dashboard`
4. **Automatic Token Handling**: Supabase handles all token processing
5. **Auto Profile Creation**: OAuth users get profiles created automatically

## Session Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Session Management                         │
└──────────────────────────────────────────────────────────────┘

User Signs In (Email or OAuth)
         │
         ▼
┌─────────────────────┐
│ Supabase Creates    │
│ Auth Session        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Session Stored in   │
│ localStorage        │
│ key: arcade-learn-  │
│      auth           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ AuthContext Detects │
│ Session Change      │
│ (onAuthStateChange) │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Update Auth State   │
│ - user              │
│ - isAuthenticated   │
│ - session           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ App Shows           │
│ Authenticated UI    │
└─────────────────────┘
```

## Error Handling Flow

```
OAuth Fails
    │
    ▼
┌──────────────────────┐
│ Google/Supabase      │
│ Returns Error        │
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│ Redirect to          │
│ /signin?error=TYPE   │
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│ SignIn.tsx Detects   │
│ URL Parameter        │
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│ Show User-Friendly   │
│ Error Message        │
└──────────────────────┘
```

## Component Responsibilities

### SignIn.tsx
- Display login/register form
- Handle email/password authentication
- Trigger Google OAuth flow
- Display error messages
- Handle form validation

### AuthContext.tsx
- Manage authentication state
- Provide login/register/logout functions
- Handle OAuth provider sign-in
- Listen to auth state changes
- Update user state globally

### AuthCallback.tsx
- Process OAuth redirect
- Verify session creation
- Create user profile if needed
- Redirect to dashboard
- Handle OAuth errors

### Supabase
- Authenticate users
- Manage sessions
- Handle OAuth flow
- Store user data
- Provide real-time auth updates
