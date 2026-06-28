"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Bell,
  Eye,
  Flag,
  LogOut,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { markNotificationReadAction } from "@/actions/notifications";
import {
  formatNotificationTime,
  getNotificationTypeLabel,
  type NotificationView,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

function NotificationIcon({ type }: { type: NotificationView["type"] }) {
  const className = "h-5 w-5";

  switch (type) {
    case "JOIN_REQUEST":
      return <UserPlus className={className} />;
    case "MEMBER_JOINED":
      return <Users className={className} />;
    case "MEMBER_LEFT":
      return <LogOut className={className} />;
    case "CHALLENGE_DELETED":
      return <Trash2 className={className} />;
    case "PENITENCIA_RECEIVED":
    case "PENITENCIA_CREATED":
      return <Flag className={className} />;
    case "ATRAPADO_RECEIVED":
    case "ATRAPADO_REPORTED":
      return <Eye className={className} />;
    default:
      return <Bell className={className} />;
  }
}

function iconTone(type: NotificationView["type"]) {
  switch (type) {
    case "PENITENCIA_RECEIVED":
    case "ATRAPADO_RECEIVED":
      return "bg-red-100 text-red-700";
    case "JOIN_REQUEST":
    case "MEMBER_JOINED":
      return "bg-emerald-100 text-emerald-700";
    case "CHALLENGE_DELETED":
    case "MEMBER_LEFT":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function NotificationItem({ notification }: { notification: NotificationView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isUnread = !notification.readAt;

  function handleClick() {
    startTransition(async () => {
      if (isUnread) {
        await markNotificationReadAction(notification.id);
      }
      if (notification.href) {
        router.push(notification.href);
      }
    });
  }

  const content = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          iconTone(notification.type)
        )}
      >
        <NotificationIcon type={notification.type} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-800")}>
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-slate-400">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          {getNotificationTypeLabel(notification.type)}
        </p>
      </div>
      {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
    </>
  );

  if (notification.href) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
          isUnread
            ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"
            : "border-slate-200 bg-white hover:border-slate-300"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        isUnread ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white"
      )}
    >
      {content}
    </div>
  );
}

export function NotificationsList({
  notifications,
}: {
  notifications: NotificationView[];
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Bell className="h-7 w-7 text-slate-400" />
        </div>
        <p className="font-medium text-slate-900">No tienes notificaciones</p>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Aquí aparecerán invitaciones, reportes, penitencias y cambios en tus retos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

export function MarkAllNotificationsReadButton({
  hasUnread,
}: {
  hasUnread: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!hasUnread) return null;

  function handleClick() {
    startTransition(async () => {
      const { markAllNotificationsReadAction } = await import("@/actions/notifications");
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-50"
    >
      {pending ? "Marcando..." : "Marcar todas como leídas"}
    </button>
  );
}
