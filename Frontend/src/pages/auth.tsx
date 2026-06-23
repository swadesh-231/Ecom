import { SignIn, SignUp } from "@clerk/react";

const wrapper =
  "flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12";

export function SignInPage() {
  return (
    <div className={wrapper}>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className={wrapper}>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
