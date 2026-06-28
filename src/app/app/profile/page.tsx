import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/challenges";
import { ProfileClient } from "@/components/app/profile-client";
import { AppPageTitle } from "@/components/app/app-page-title";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getUserProfile(session.id);
  if (!profile) redirect("/login");

  return (
    <div className="px-4 pb-6 pt-6">
      <AppPageTitle>Perfil</AppPageTitle>
      <ProfileClient profile={profile} />
    </div>
  );
}
