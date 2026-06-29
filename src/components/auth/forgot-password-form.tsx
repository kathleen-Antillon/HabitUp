"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { forgotPasswordAction, type ActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, primaryButtonClass } from "@/components/landing/auth-buttons";
import { linkButtonClass } from "@/lib/link-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={`w-full ${primaryButtonClass}`} disabled={pending}>
      {pending ? "Enviando..." : "Enviar instrucciones"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState<ActionResult | undefined, FormData>(
    async (_prev, formData) => forgotPasswordAction(formData),
    undefined
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
        <p className="mt-2 text-slate-600">Te enviaremos un correo con instrucciones</p>
      </div>

      <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
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
