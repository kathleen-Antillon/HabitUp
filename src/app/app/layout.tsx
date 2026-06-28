import { BottomNav } from "@/components/app/bottom-nav";
import { TopNav } from "@/components/app/top-nav";
import { getSession } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const unreadCount = session ? await getUnreadNotificationCount(session.id) : 0;

  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-clip bg-slate-50">
      <TopNav unreadCount={unreadCount} />
      <main className="mx-auto w-full min-w-0 max-w-lg pt-14">{children}</main>
      <BottomNav />
    </div>
  );
}
