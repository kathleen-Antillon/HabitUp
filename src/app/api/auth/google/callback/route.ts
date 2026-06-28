import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import {
  exchangeGoogleCode,
  fetchGoogleUser,
  findOrCreateGoogleUser,
  handleInviteForUser,
  isGoogleAuthConfigured,
} from "@/lib/google-oauth";

const OAUTH_STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const stored = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google_denied", origin));
  }

  if (!isGoogleAuthConfigured() || !code || !state || !stored) {
    return NextResponse.redirect(new URL("/login?error=google_failed", origin));
  }

  let invite: string | undefined;
  let redirectTo: string | undefined;

  try {
    const parsed = JSON.parse(stored) as {
      state: string;
      invite?: string;
      redirect?: string;
    };
    if (parsed.state !== state) {
      return NextResponse.redirect(new URL("/login?error=google_state", origin));
    }
    invite = parsed.invite;
    redirectTo = parsed.redirect;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_state", origin));
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const profile = await fetchGoogleUser(tokens.access_token);

    if (!profile.email || !profile.verified_email) {
      return NextResponse.redirect(new URL("/login?error=google_email", origin));
    }

    const { user, isNew } = await findOrCreateGoogleUser(profile);
    await handleInviteForUser(user.id, invite);
    await createSession(user.id);

    if (redirectTo?.startsWith("/app")) {
      return NextResponse.redirect(new URL(redirectTo, origin));
    }

    if (isNew || user.isNewUser) {
      return NextResponse.redirect(new URL("/app/home?welcome=1", origin));
    }

    return NextResponse.redirect(new URL("/app/home", origin));
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", origin));
  }
}
