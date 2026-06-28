import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { buildGoogleAuthUrl, isGoogleAuthConfigured } from "@/lib/google-oauth";

const OAUTH_STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", request.url)
    );
  }

  const { searchParams } = new URL(request.url);
  const invite = searchParams.get("invite") ?? undefined;
  const redirect = searchParams.get("redirect") ?? undefined;

  const state = nanoid(32);
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, JSON.stringify({ state, invite, redirect }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
