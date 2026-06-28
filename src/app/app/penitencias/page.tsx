import { redirect } from "next/navigation";
import { AppPageTitle } from "@/components/app/app-page-title";
import { PenitenciasList } from "@/components/app/penitencias-list";
import { getSession } from "@/lib/auth";
import { getUserPenitencias } from "@/lib/penitencias";

export default async function PenitenciasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const penitencias = await getUserPenitencias(session.id);

  return (
    <div className="app-page">
      <AppPageTitle>Penitencias</AppPageTitle>
      <p className="mb-6 text-sm text-slate-500">
        Castigos y cargos recibidos en tus retos. Marca como cumplida cada penitencia cuando la
        hayas resuelto.
      </p>
      <PenitenciasList penitencias={penitencias} />
    </div>
  );
}
