import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none",
          }
        }}
        forceRedirectUrl="http://localhost:3001/interview"
        signInUrl="/login"
      />
    </div>
  );
}