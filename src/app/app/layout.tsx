import { BottomNav } from "@/components/app/bottom-nav";
import { TopNav } from "@/components/app/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="mx-auto min-h-screen max-w-lg pt-14">{children}</div>
      <BottomNav />
    </div>
  );
}
