import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full min-w-0 items-center justify-center bg-gradient-to-b from-slate-100 to-white px-4 py-10 sm:px-6 sm:py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
