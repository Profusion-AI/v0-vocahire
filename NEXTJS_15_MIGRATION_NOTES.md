# Next.js 15 Migration Notes

## Dynamic Route Parameters are Now Async

In Next.js 15, all dynamic route parameters (`params`) are now asynchronous and return a Promise. This is a breaking change from previous versions.

### Key Changes:

1. **Route Handlers** (API Routes):
   ```typescript
   // Before (Next.js 14)
   export async function GET(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     const id = params.id;
   }

   // After (Next.js 15)
   export async function GET(
     request: Request,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params;
   }
   ```

2. **Page Components**:
   ```typescript
   // Before
   export default function Page({ params }: { params: { slug: string } }) {
     return <div>{params.slug}</div>;
   }

   // After
   export default async function Page({ 
     params 
   }: { 
     params: Promise<{ slug: string }> 
   }) {
     const { slug } = await params;
     return <div>{slug}</div>;
   }
   ```

3. **Layout Components**:
   ```typescript
   // After
   export default async function Layout({
     children,
     params,
   }: {
     children: React.ReactNode
     params: Promise<{ team: string }>
   }) {
     const { team } = await params;
     return <div>{children}</div>;
   }
   ```

4. **Client Components** (use React's `use` hook):
   ```typescript
   'use client'
   import { use } from 'react'

   export default function Page({
     params,
   }: {
     params: Promise<{ slug: string }>
   }) {
     const { slug } = use(params);
     return <div>{slug}</div>;
   }
   ```

### Why This Change?

- Enables better streaming and performance optimizations
- Aligns with Next.js's move towards making everything async by default
- Allows for more efficient data fetching patterns

### Common Errors:

1. **TypeScript Error**: 
   ```
   Type "{ params: { sessionId: string; }; }" is not a valid type for the function's second argument.
   ```
   **Fix**: Change params type to `Promise<{ sessionId: string }>`

2. **Runtime Error**: 
   ```
   Cannot read property 'id' of undefined
   ```
   **Fix**: Await the params before accessing properties

### Migration Checklist:

- [ ] Update all Route Handlers to use `Promise<{ ... }>` for params
- [ ] Add `await` before accessing params properties
- [ ] Update Page components to be async (or use `use()` hook)
- [ ] Update Layout components similarly
- [ ] Update generateStaticParams if using params from parent
- [ ] Update any generateMetadata functions to await params

### Additional Resources:

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Dynamic Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)