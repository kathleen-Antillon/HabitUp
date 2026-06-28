import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
