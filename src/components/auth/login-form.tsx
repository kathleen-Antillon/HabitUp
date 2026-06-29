"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type ActionResult } from "@/actions/auth";
import { AuthDivider, GoogleAuthError, GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, primaryButtonClass } from "@/components/landing/auth-buttons";
import { linkButtonClass } from "@/lib/link-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={`w-full ${primaryButtonClass}`} disabled={pending}>
      {pending ? "Iniciando sesión..." : "Iniciar sesión"}
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error") ?? undefined;
  const redirect = searchParams.get("redirect") ?? undefined;
  const inviteCode = searchParams.get("invite") ?? undefined;

  const [state, formAction] = useFormState<ActionResult | undefined, FormData>(
    async (_prev, formData) => loginAction(formData),
    undefined
  );

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Bienvenido de vuelta</h1>
        <p className="mt-2 text-slate-600">Inicia sesión para continuar con tus retos</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GoogleSignInButton inviteCode={inviteCode} redirect={redirect} />
        <AuthDivider />

        <form action={formAction} className="space-y-4">
          {redirect && <input type="hidden" name="redirect" value={redirect} />}
          {inviteCode && <input type="hidden" name="inviteCode" value={inviteCode} />}
          <div>
            <Label htmlFor="identifier">Usuario o correo</Label>
            <Input id="identifier" name="identifier" required className="mt-1.5" placeholder="tu_usuario o email@ejemplo.com" />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required className="mt-1.5" />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <GoogleAuthError code={googleError} />
          <SubmitButton />
        </form>
      </div>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link href="/forgot-password" className={linkButtonClass}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-slate-600">
          ¿No tienes cuenta?{" "}
          <Link
            href={inviteCode ? `/register?invite=${inviteCode}` : "/register"}
            className={linkButtonClass}
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
