import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none",
          }
        }}
        forceRedirectUrl="http://localhost:3001/interview"
        signUpUrl="/register"
      />
    </div>
  );
}