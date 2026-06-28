import { redirect } from "next/navigation";
import { AppPageTitle } from "@/components/app/app-page-title";
import {
  MarkAllNotificationsReadButton,
  NotificationsList,
} from "@/components/app/notifications-list";
import { getSession } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/notifications";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await getNotificationsForUser(session.id);
  const hasUnread = notifications.some((notification) => !notification.readAt);

  return (
    <div className="px-4 pb-6 pt-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <AppPageTitle>Notificaciones</AppPageTitle>
        <MarkAllNotificationsReadButton hasUnread={hasUnread} />
      </div>

      <NotificationsList notifications={notifications} />
    </div>
  );
}
