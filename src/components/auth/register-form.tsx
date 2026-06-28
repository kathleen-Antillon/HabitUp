"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction, type ActionResult } from "@/actions/auth";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/landing/auth-buttons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </Button>
  );
}

export function RegisterForm({ inviteCode }: { inviteCode?: string }) {
  const [state, formAction] = useFormState<ActionResult | undefined, FormData>(
    async (_prev, formData) => registerAction(formData),
    undefined
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
        <p className="mt-2 text-slate-600">Empieza tu camino hacia tu mejor versión</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <GoogleSignInButton inviteCode={inviteCode} label="Registrarse con Google" />
        <AuthDivider />

        <form action={formAction} className="space-y-4">
        {inviteCode && <input type="hidden" name="inviteCode" value={inviteCode} />}
        <div>
          <Label htmlFor="username">Usuario</Label>
          <Input id="username" name="username" required className="mt-1.5" placeholder="tu_usuario" />
        </div>
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" placeholder="email@ejemplo.com" />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required minLength={6} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="personalGoal">¿Cuál es tu objetivo? (opcional)</Label>
          <Textarea
            id="personalGoal"
            name="personalGoal"
            className="mt-1.5"
            placeholder="Ej: Ser más constante con el ejercicio y la alimentación..."
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
