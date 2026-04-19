# Quick Auth Setup & Testing Guide

## What Was Fixed

✅ **Added Global AuthContext** - Auth state now available everywhere  
✅ **Fixed Google OAuth Redirect** - Now correctly redirects to `/auth/callback`  
✅ **Added Auth Callback Handler** - Properly processes OAuth callback  
✅ **Created ProtectedRoute Component** - Routes require login  
✅ **Wrapped App with AuthProvider** - Auth state injected into entire app  
✅ **Improved Session Management** - Tokens persist across page reloads  

---

## Quick Start (Next Steps)

### 1. Verify Your Redirect URL in Google/Lovable Console

**For Local Development:**
```
Redirect URI: http://localhost:5173/auth/callback
```

Make sure this is registered in:
- ✅ Lovable console (if using Lovable)
- ✅ Supabase dashboard > Authentication > Providers > Google

### 2. Start Your Dev Server
```bash
npm run dev
```

Should start on `http://localhost:5173`

### 3. Test the Auth Flow

**Option A: Email Sign Up**
```
1. Go to http://localhost:5173/auth
2. Click "Sign Up"
3. Fill in: Full Name, Account Type, Email, Password
4. Click "Sign Up"
5. ✅ Should see "Account created!" toast
6. ✅ Top-right should show profile icon (you're logged in)
```

**Option B: Google OAuth**
```
1. Go to http://localhost:5173/auth
2. Click "Continue with Google"
3. Log in with your Google account
4. Click "Allow"
5. ✅ Should redirect back to app
6. ✅ Should see profile icon in top-right
```

### 4. Verify Protected Routes Work

```
1. Go to http://localhost:5173/profile
✅ Should show your profile (you're logged in)

2. Click profile icon → "Sign Out"
3. Go to http://localhost:5173/profile again
✅ Should redirect to /auth (now you're protected)
```

---

## If You Get a 404 After Google Login

**This means the redirect URL is misconfigured.**

### Fix Checklist:

**1. Check your redirect URL is correct**
   - Should be: `http://localhost:5173/auth/callback`
   - NOT: `http://localhost:5173/`
   - NOT: `http://localhost:5173/auth`

**2. Update Google OAuth Settings**
   - If using Lovable: Update in Lovable console
   - If using Supabase: 
     - Go to Supabase Dashboard
     - Authentication → Providers → Google
     - Add/update "Authorized Redirect URIs"
     - Include: `http://localhost:5173/auth/callback`

**3. Restart Dev Server**
   ```bash
   npm run dev
   ```

**4. Clear Browser Cache**
   - DevTools → Application → Clear site data
   - Or use Incognito window

**5. Test Again in Incognito Window**
   - Go to `http://localhost:5173/auth`
   - Click "Continue with Google"
   - Should now redirect to `/auth/callback` and see loading spinner
   - Then redirect to home with profile icon visible

---

## File Changes Made

New files created:
```
src/context/AuthContext.tsx          ← Global auth state provider
src/components/ProtectedRoute.tsx    ← Route protection wrapper
src/pages/AuthCallback.tsx           ← OAuth callback handler
AUTH_ARCHITECTURE.md                 ← Full documentation
AUTH_SETUP_QUICK.md                  ← This file
```

Files modified:
```
src/App.tsx                          ← Added AuthProvider wrapper + callback route
src/pages/Auth.tsx                   ← Fixed Google OAuth redirect URL
src/components/AuthHeader.tsx        ← Updated to use AuthContext
src/integrations/supabase/client.ts  ← Added detectSessionInUrl: true
```

---

## What Gets Stored

### In Browser LocalStorage
```javascript
// After successful login, you'll see:
// DevTools → Application → LocalStorage → http://localhost:5173

sb-hggjukqgjxcypokjguwv-auth-token        // Access token
sb-hggjukqgjxcypokjguwv-auth-refresh      // Refresh token
sb-hggjukqgjxcypokjguwv-auth-expires-at   // Token expiry
```

### In Memory (AuthContext)
```
{
  user: {
    id: "uuid",
    email: "user@example.com",
    user_metadata: {
      full_name: "John Doe",
      user_type: "property_owner"
    }
  },
  session: { ... },
  loading: false,
  isAuthenticated: true
}
```

---

## Using Auth in Components

### Option 1: With Context (Recommended)
```typescript
import { useAuthContext } from "@/context/AuthContext";

export function MyComponent() {
  const { user, loading, isAuthenticated } = useAuthContext();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user?.email}!</div>;
}
```

### Option 2: With Hook (Legacy, still works)
```typescript
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { user, loading } = useAuth();
  // Same as above
}
```

### Option 3: Protect Entire Route
```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

// In App.tsx:
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

---

## Debugging Commands (DevTools Console)

```javascript
// Check current auth state
JSON.stringify(JSON.parse(localStorage.getItem('sb-hggjukqgjxcypokjguwv-auth-token')), null, 2)

// Sign out programmatically
supabase.auth.signOut()

// Get current session
supabase.auth.getSession()

// Listen to auth changes (for debugging)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, 'Session:', session)
})
```

---

## Next Steps

1. ✅ Test auth flow locally
2. ✅ Verify Google OAuth works with `/auth/callback`
3. ⏭️ **Deploy to production**
4. ⏭️ Update Supabase redirect URI to production domain
5. ⏭️ Set up email verification (optional)
6. ⏭️ Add password reset flow (optional)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "404 after Google login" | Update redirect URI to `/auth/callback` |
| "UI doesn't update after login" | Restart dev server, clear cache |
| "Profile icon not showing" | Check AuthHeader is using AuthContext |
| "Can access /profile while logged out" | Verify ProtectedRoute is wrapping the route |
| "Token keeps expiring" | Check `autoRefreshToken: true` in Supabase config |
| "useAuthContext error" | Ensure component is inside `<AuthProvider>` |

---

## Questions?

1. Check [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) for detailed docs
2. Look at browser console for error messages
3. Check Supabase dashboard logs
4. Test with email first before OAuth

**You're ready to go!** 🚀
