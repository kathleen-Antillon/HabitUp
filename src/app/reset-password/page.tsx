import { InvalidResetLink, ResetPasswordForm } from "@/components/auth/reset-password-form";
import { findValidResetToken } from "@/lib/password-reset";

type Props = {
  searchParams: { token?: string };
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const token = searchParams.token?.trim();

  if (!token) {
    return (
      <div className="flex min-h-dvh w-full min-w-0 items-center justify-center bg-gradient-to-b from-slate-100 to-white px-4 py-10 sm:px-6 sm:py-12">
        <InvalidResetLink />
      </div>
    );
  }

  const resetToken = await findValidResetToken(token);

  return (
    <div className="flex min-h-dvh w-full min-w-0 items-center justify-center bg-gradient-to-b from-slate-100 to-white px-4 py-10 sm:px-6 sm:py-12">
      {resetToken ? <ResetPasswordForm token={token} /> : <InvalidResetLink />}
    </div>
  );
}
