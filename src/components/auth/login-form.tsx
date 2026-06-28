"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type ActionResult } from "@/actions/auth";
import { AuthDivider, GoogleAuthError, GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/landing/auth-buttons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Iniciando sesión..." : "Iniciar sesión"}
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error") ?? undefined;
  const redirect = searchParams.get("redirect") ?? undefined;

  const [state, formAction] = useFormState<ActionResult | undefined, FormData>(
    async (_prev, formData) => loginAction(formData),
    undefined
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Bienvenido de vuelta</h1>
        <p className="mt-2 text-slate-600">Inicia sesión para continuar con tus retos</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GoogleSignInButton redirect={redirect} />
        <AuthDivider />

        <form action={formAction} className="space-y-4">
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
          <Link href="/forgot-password" className="font-medium text-emerald-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-slate-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-emerald-600 hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
