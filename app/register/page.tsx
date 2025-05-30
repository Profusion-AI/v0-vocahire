import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'
  const protocol = appUrl.includes('localhost') ? 'http' : 'https'
  const redirectUrl = `${protocol}://${appUrl}/interview-v2`
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none",
          }
        }}
        forceRedirectUrl={redirectUrl}
        signInUrl="/login"
      />
    </div>
  );
}