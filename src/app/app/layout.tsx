import { BottomNav } from "@/components/app/bottom-nav";
import { TimezoneSync } from "@/components/app/timezone-sync";
import { TopNav } from "@/components/app/top-nav";
import { getSession } from "@/lib/auth";
import { processMissedGoalsForUser } from "@/lib/missed-goals";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const unreadCount = session ? await getUnreadNotificationCount(session.id) : 0;

  if (session) {
    await processMissedGoalsForUser(session.id);
  }

  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-clip bg-slate-50">
      {session && <TimezoneSync />}
      <TopNav unreadCount={unreadCount} />
      <main className="main-offset-top mx-auto w-full min-w-0 max-w-lg">{children}</main>
      <BottomNav />
    </div>
  );
}
