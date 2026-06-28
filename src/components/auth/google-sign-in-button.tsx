import Link from "next/link";
import { isGoogleAuthEnabled } from "@/lib/google-oauth";

type GoogleSignInButtonProps = {
  inviteCode?: string;
  redirect?: string;
  label?: string;
};

export function GoogleSignInButton({
  inviteCode,
  redirect,
  label = "Continuar con Google",
}: GoogleSignInButtonProps) {
  if (!isGoogleAuthEnabled()) return null;

  const params = new URLSearchParams();
  if (inviteCode) params.set("invite", inviteCode);
  if (redirect) params.set("redirect", redirect);
  const query = params.toString();
  const href = `/api/auth/google${query ? `?${query}` : ""}`;

  return (
    <Link
      href={href}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <GoogleIcon />
      {label}
    </Link>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-slate-500">o</span>
      </div>
    </div>
  );
}

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google no está configurado. Contacta al administrador.",
  google_denied: "Cancelaste el inicio de sesión con Google.",
  google_failed: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
  google_state: "La sesión de Google expiró. Inténtalo de nuevo.",
  google_email: "Tu cuenta de Google no tiene un correo verificado.",
};

export function GoogleAuthError({ code }: { code?: string }) {
  if (!code) return null;
  const message = GOOGLE_ERROR_MESSAGES[code];
  if (!message) return null;
  return <p className="text-sm text-red-600">{message}</p>;
}
