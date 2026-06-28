"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="px-4 py-10 text-center">
      <h1 className="mb-2 text-xl font-bold text-slate-900">Algo salió mal</h1>
      <p className="mb-6 text-sm text-slate-600">
        No se pudo cargar esta pantalla. Prueba recargar la página.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
