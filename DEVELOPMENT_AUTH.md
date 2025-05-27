# VocaHire Development Authentication Guide

## 🚀 Quick Auth for Local Development

### Option 1: Clerk Test Accounts (Recommended)
When using a Clerk development instance (keys starting with `pk_test_`), you get:

**Pre-made test accounts:**
- Email: `test@clerk.dev`
- Password: `clerk123`

**Or create test accounts instantly:**
```
+1@clerk.dev → Generates a test account
+2@clerk.dev → Another test account
```

### Option 2: Mock Auth Mode
Add to `.env.local`:
```env
# Skip auth entirely in dev
DEV_MOCK_AUTH=true
NEXT_PUBLIC_DEV_MOCK_USER_ID=dev_user_123
NEXT_PUBLIC_DEV_MOCK_EMAIL=dev@vocahire.com
```

### Option 3: Auto-Login Route
Visit: http://localhost:3001/api/auth/dev-login

This creates a mock session and redirects you to the app.

### Option 4: Persistent Session
```bash
# In your browser console:
localStorage.setItem('__dev_auth', JSON.stringify({
  userId: 'dev_user_123',
  email: 'dev@vocahire.com',
  credits: 10
}))
```

## 🔧 Implementation

### For Server Components
```typescript
import { auth } from '@clerk/nextjs/server';
import { DEV_USER } from '@/lib/auth-dev';

export default async function Page() {
  // In dev with mock auth, use dev user
  const { userId } = process.env.DEV_MOCK_AUTH 
    ? { userId: DEV_USER.id }
    : await auth();
    
  // Continue with your logic...
}
```

### For Client Components
```typescript
import { useUser } from '@clerk/nextjs';
import { DEV_USER } from '@/lib/auth-dev';

export function MyComponent() {
  const { user } = process.env.NEXT_PUBLIC_DEV_MOCK_AUTH
    ? { user: DEV_USER, isSignedIn: true }
    : useUser();
    
  // Continue with your logic...
}
```

## 🎯 Recommended Workflow

1. **Use Clerk test accounts** - Fastest, no code changes needed
2. **Add keyboard shortcut** - Press `Cmd+K` to auto-login
3. **Keep session alive** - Clerk dev sessions last 7 days
4. **Skip auth pages** - Redirect straight to `/interview` in dev

## ⚡ Hot Keys (Optional Enhancement)

Add to your layout:
```typescript
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+K = Quick login
      if (e.metaKey && e.key === 'k') {
        window.location.href = '/api/auth/dev-login';
      }
      // Cmd+Shift+K = Clear session
      if (e.metaKey && e.shiftKey && e.key === 'K') {
        clerk.signOut();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}, []);
```