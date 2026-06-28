import { RegisterForm } from "@/components/auth/register-form";
import { Suspense } from "react";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { invite?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 py-12">
      <Suspense>
        <RegisterForm inviteCode={searchParams.invite} />
      </Suspense>
    </div>
  );
}
