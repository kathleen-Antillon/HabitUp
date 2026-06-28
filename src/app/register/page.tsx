import { RegisterForm } from "@/components/auth/register-form";
import { Suspense } from "react";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { invite?: string };
}) {
  return (
    <div className="flex min-h-dvh w-full min-w-0 items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-10 sm:px-6 sm:py-12">
      <Suspense>
        <RegisterForm inviteCode={searchParams.invite} />
      </Suspense>
    </div>
  );
}
