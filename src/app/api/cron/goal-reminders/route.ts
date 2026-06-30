import { NextResponse } from "next/server";
import { sendGoalRemindersForDueUsers } from "@/lib/goal-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendGoalRemindersForDueUsers();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[goal-reminders cron]", error);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
