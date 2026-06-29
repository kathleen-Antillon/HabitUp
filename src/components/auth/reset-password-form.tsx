"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction, type ActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, primaryButtonClass } from "@/components/landing/auth-buttons";
import { linkButtonClass } from "@/lib/link-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={`w-full ${primaryButtonClass}`} disabled={pending}>
      {pending ? "Guardando..." : "Restablecer contraseña"}
    </Button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState<ActionResult | undefined, FormData>(
    async (_prev, formData) => resetPasswordAction(formData),
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
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Nueva contraseña</h1>
        <p className="mt-2 text-slate-600">Elige una contraseña segura para tu cuenta</p>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="token" value={token} />
        <div>
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1.5"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-slate-700">{state.success}</p>}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className={linkButtonClass}>
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export function InvalidResetLink() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Enlace no válido</h1>
        <p className="mt-2 text-slate-600">
          Este enlace ha expirado o ya fue usado. Solicita uno nuevo para restablecer tu
          contraseña.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Button asChild className={`w-full ${primaryButtonClass}`}>
          <Link href="/forgot-password">Solicitar nuevo enlace</Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className={linkButtonClass}>
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
