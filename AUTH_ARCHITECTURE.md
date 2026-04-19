# Authentication Architecture & Debugging Guide

## Overview

Your Homes Nigeria app now has a complete, production-ready authentication system with:
- ✅ **Google OAuth Integration** with proper callback handling
- ✅ **Global Auth State Management** via AuthContext
- ✅ **Protected Routes** that require authentication
- ✅ **Persistent Sessions** stored in localStorage
- ✅ **Automatic Token Refresh** when tokens expire
- ✅ **Proper Navigation** after login/signup

---

## 1. Architecture

### Flow Diagram

```
User Click "Sign In" / "Google"
        ↓
Auth.tsx (Login Page)
        ↓
    ↙ Email/Password          Google OAuth ↘
    ↓                            ↓
supabase.auth.signInWithPassword() → lovable.auth.signInWithOAuth()
    ↓                            ↓
Token stored in localStorage     Redirect to Google
(Supabase auto-discovers)        ↓
    ↓                       Google Auth Page
Supabase emits                   ↓
onAuthStateChange()              User Approves
    ↓                            ↓
AuthContext updates              Redirect to /auth/callback
    ↓                            ↓
App receives new user state   AuthCallback.tsx receives token
    ↓                            ↓
useAuthContext() hooks update  Token stored in localStorage
    ↓                            ↓
Navigation re-renders with     AuthCallback waits for auth state
authenticated UI               ↓
    ↓                       Auth state updates
ProtectedRoute allows access   ↓
to /profile, /messages, etc    Redirect to home or intended page
```

### Key Components

#### **1. AuthContext** (`src/context/AuthContext.tsx`)
- Global auth state provider
- Listens to Supabase `onAuthStateChange()`
- Stores: `user`, `session`, `loading`, `isAuthenticated`
- Provides: `signOut()` method

```typescript
const { user, session, loading, isAuthenticated, signOut } = useAuthContext();
```

#### **2. Auth Page** (`src/pages/Auth.tsx`)
- Email/password sign in and sign up
- Google OAuth sign in button
- Form validation with Zod
- **Critical**: Google redirects to `/auth/callback`

#### **3. Auth Callback Page** (`src/pages/AuthCallback.tsx`)
- Handles OAuth callback from Google
- Waits for Supabase to detect token in URL
- Automatic redirect to home or intended page
- Shows loading spinner during auth state update

#### **4. Protected Route** (`src/components/ProtectedRoute.tsx`)
- Wraps routes that require authentication
- Redirects to `/auth` if not logged in
- Used for: `/profile`, `/messages`, `/admin`, `/ads-manager`, `/group-chats`

#### **5. Auth Header** (`src/components/AuthHeader.tsx`)
- Renders "Sign In" button for logged-out users
- Renders profile dropdown for logged-in users
- Automatically updates when auth state changes

---

## 2. Setup Required

### Google OAuth Configuration

You need to set up Google OAuth in Lovable or Supabase:

1. **If using Lovable (current setup):**
   - Lovable auto-configures Google OAuth
   - Your redirect URL must be registered in Lovable console

2. **If using Supabase directly:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google OAuth
   - Add Authorized Redirect URIs:
     - `http://localhost:5173/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

3. **Environment Variables** (check `.env`)
   ```
   VITE_SUPABASE_URL=https://hggjukqgjxcypokjguwv.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJh...
   ```

---

## 3. How It Works

### Email/Password Sign In
```typescript
1. User enters email + password
2. handleSignIn() calls supabase.auth.signInWithPassword()
3. Supabase validates credentials
4. On success: token stored in localStorage
5. Supabase emits onAuthStateChange() event
6. AuthContext updates with new user
7. useAuthContext() hooks re-render
8. Auth.useEffect() detects logged-in user, navigates to "/"
```

### Google OAuth Sign In
```typescript
1. User clicks "Continue with Google"
2. handleGoogleSignIn() calls lovable.auth.signInWithOAuth("google")
3. Passed callback URL: http://localhost:5173/auth/callback
4. Browser redirected to Google OAuth page
5. User approves → Google redirects back to http://localhost:5173/auth/callback?code=...
6. AuthCallback.tsx component mounts
7. Supabase detects code in URL, exchanges for token
8. Token stored in localStorage
9. Supabase emits onAuthStateChange()
10. AuthContext updates
11. AuthCallback waits for user state, then redirects to home
```

### Protected Route Access
```typescript
1. User clicks link to /profile
2. ProtectedRoute checks isAuthenticated
3. If true: render Profile page
4. If false: redirect to /auth
```

### Session Persistence
```typescript
1. Page reload
2. App mounts, AuthProvider initializes
3. Supabase reads token from localStorage
4. Calls getSession() → returns stored session
5. AuthContext updates with user data
6. UI renders authenticated state immediately
```

---

## 4. Debugging Checklist

### OAuth Not Working? 404 on Google Redirect?

- [ ] **1. Check Redirect URL Match**
  - Open browser DevTools → Network tab
  - Click "Continue with Google"
  - Look for redirect URL in request
  - Match it exactly with Lovable/Supabase console
  - Common issue: `http://localhost:5173/` vs `http://localhost:5173/auth/callback`

- [ ] **2. Verify Callback Route Exists**
  - Navigate to `http://localhost:5173/auth/callback`
  - Should show loading spinner, not 404
  - Check App.tsx: `/auth/callback` route should be registered

- [ ] **3. Check Supabase Configuration**
  - Login to Supabase dashboard
  - Go to Authentication → Providers → Google
  - Verify OAuth app is set up
  - Check "Authorized Redirect URIs" include your callback URL

- [ ] **4. Check Environment Variables**
  - `.env` file should have valid Supabase credentials
  - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Restart dev server after changing `.env`

- [ ] **5. Check Browser Console**
  - Open DevTools → Console
  - Look for auth-related errors
  - Google OAuth flow logs redirect URL

- [ ] **6. Test with Email/Password First**
  - Try signing up with email + password (no OAuth)
  - If that works, OAuth is the only issue
  - If email also fails, auth system is broken

---

### UI Not Updating After Login?

- [ ] **1. Check AuthProvider is Wrapping App**
  - Open `src/App.tsx`
  - Verify `<AuthProvider>` wraps all routes
  - If missing: UI won't update properly

- [ ] **2. Check Auth Hooks**
  - Components must use `useAuthContext()` or `useAuth()`
  - Check imports are correct
  - Log user state in console: `console.log({ user, loading })`

- [ ] **3. Check Navigation Updates**
  - After login, should redirect to home
  - Check Auth.tsx `useEffect` with `onAuthStateChange`
  - Should call `navigate()` when user changes

- [ ] **4. Check Session Persistence**
  - Sign in, reload page
  - Should still be logged in
  - Check browser DevTools → Application → LocalStorage
  - Look for `sb-* ` keys (Supabase tokens)

---

### User Can Access Protected Routes Without Login?

- [ ] **1. Verify Protected Routes**
  - `/profile`, `/messages`, `/admin` should be wrapped in `<ProtectedRoute>`
  - Check App.tsx for each route
  - Missing wrapper = user can access without login

- [ ] **2. Test Protected Route**
  - Log out, navigate to `/profile`
  - Should redirect to `/auth`
  - If doesn't redirect: route not protected properly

---

## 5. Common Mistakes & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 after Google login | Redirect URL mismatch | Update OAuth config to use `/auth/callback` |
| UI not updating after login | No AuthProvider wrapper | Wrap app with `<AuthProvider>` in App.tsx |
| Auth state not persisting | Session storage disabled | Ensure `persistSession: true` in Supabase config |
| "useAuthContext must be used within AuthProvider" | Using hook outside provider | Check component is rendered inside `<AuthProvider>` |
| Token always expired | Auto-refresh disabled | Verify `autoRefreshToken: true` in Supabase config |
| Redirect to wrong page after login | No return URL stored | Check `auth_return_url` in sessionStorage |

---

## 6. Testing Flow

### Manual Test Checklist

**Test 1: Email Sign Up**
```
1. Go to http://localhost:5173/auth
2. Click "Sign Up" tab
3. Enter: name, email, password, account type
4. Click "Sign Up"
5. ✅ Should show toast "Account created"
6. ✅ Should see logged-in navigation
7. ✅ Reload page, should still be logged in
```

**Test 2: Email Sign In**
```
1. Log out (click profile dropdown → Sign Out)
2. Go to /auth
3. Enter same email + password from Test 1
4. Click "Sign In"
5. ✅ Should show toast "Welcome back!"
6. ✅ Should redirect to home
7. ✅ Should see logged-in navigation
```

**Test 3: Google OAuth**
```
1. Log out
2. Go to /auth
3. Click "Continue with Google"
4. ✅ Should redirect to Google login
5. ✅ Should see Google approval screen
6. ✅ Should redirect back to app (check /auth/callback URL)
7. ✅ Should show loading spinner briefly
8. ✅ Should redirect to home
9. ✅ Should see logged-in navigation
```

**Test 4: Protected Routes**
```
1. Log out
2. Go to http://localhost:5173/profile
3. ✅ Should redirect to /auth
4. Go back to /auth, sign in
5. Go to http://localhost:5173/profile
6. ✅ Should show profile page
```

**Test 5: Session Persistence**
```
1. Sign in with email/password
2. Reload page (F5)
3. ✅ Should still be logged in
4. Check DevTools → Application → LocalStorage
5. ✅ Should see `sb-*` keys with tokens
```

**Test 6: Session Cleanup**
```
1. Sign out
2. Reload page
3. ✅ Should be logged out
4. Check DevTools → Application → LocalStorage
5. ✅ `sb-*` keys should be gone or empty
```

---

## 7. Production Checklist

Before deploying to production:

- [ ] Update Google OAuth redirect URI to production domain
- [ ] Update Supabase allowed redirect URIs to production domain
- [ ] Remove console.log() statements (left in for debugging)
- [ ] Test entire auth flow on staging environment
- [ ] Verify email verification works (if enabled in Supabase)
- [ ] Test password reset flow
- [ ] Monitor auth errors in production (Sentry, LogRocket, etc.)
- [ ] Set up email providers in Supabase (SendGrid, Mailgun, etc.)

---

## 8. File Structure

```
src/
├── context/
│   └── AuthContext.tsx              ← Global auth state
├── components/
│   ├── ProtectedRoute.tsx           ← Route protection
│   └── AuthHeader.tsx               ← Auth UI (sign in / profile)
├── pages/
│   ├── Auth.tsx                     ← Sign in/up forms
│   └── AuthCallback.tsx             ← OAuth callback handler
├── hooks/
│   └── useAuth.ts                   ← Auth state hook (legacy, still works)
├── integrations/
│   ├── lovable/index.ts             ← OAuth provider
│   └── supabase/client.ts           ← Supabase client
└── integrations/supabase/           ← Types & config
```

---

## 9. API Reference

### useAuthContext()
```typescript
import { useAuthContext } from "@/context/AuthContext";

const { user, session, loading, isAuthenticated, signOut } = useAuthContext();

// Properties
user                  // User object from Supabase { id, email, user_metadata, etc }
session              // Session object { access_token, refresh_token, expires_at }
loading              // boolean: true while fetching auth state
isAuthenticated      // boolean: true if user is logged in

// Methods
await signOut()      // Sign out user, clear localStorage, redirect logic
```

### useAuth() (Legacy, still works)
```typescript
import { useAuth } from "@/hooks/useAuth";

const { user, session, loading, signOut } = useAuth();
// Same as useAuthContext but can be used globally
```

### ProtectedRoute
```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
// Redirects to /auth if not logged in
```

---

## 10. Environment Variables

```env
# .env file (already set up, check if values are correct)
VITE_SUPABASE_URL="https://hggjukqgjxcypokjguwv.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2p1a3FnanhjeXBva2pndXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDkxNTgsImV4cCI6MjA4NDAyNTE1OH0.-d7EKej3WD_s6FDqidW8t-a8eTbv_B2FH1bVn48Tx-Q"
```

Make sure these are valid and match your Supabase project!

---

## Need Help?

1. **Check browser console** for error messages
2. **Check Supabase logs** in Supabase dashboard → Logs
3. **Enable debugging** by adding `console.log()` in AuthContext
4. **Test with email first** before OAuth
5. **Verify redirect URLs** match exactly (no trailing slashes differences!)
