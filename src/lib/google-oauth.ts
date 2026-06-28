import { nanoid } from "nanoid";
import { prisma } from "./db";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture?: string;
};

export function getGoogleRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isGoogleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{ access_token: string }> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google authorization code");
  }

  return response.json();
}

export async function fetchGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  return response.json();
}

function sanitizeUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
}

async function generateUniqueUsername(email: string, name?: string): Promise<string> {
  const baseFromName = name ? sanitizeUsername(name.replace(/\s+/g, "_")) : "";
  const baseFromEmail = sanitizeUsername(email.split("@")[0] ?? "user");
  let base = baseFromName || baseFromEmail || "user";

  if (base.length < 3) base = `${base}_user`;

  let username = base;
  let attempt = 0;

  while (attempt < 20) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
    username = `${base}_${nanoid(4).toLowerCase()}`;
    attempt++;
  }

  return `user_${nanoid(8).toLowerCase()}`;
}

export async function findOrCreateGoogleUser(profile: GoogleUserInfo) {
  const email = profile.email.toLowerCase();

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email }] },
  });

  if (user) {
    const updates: { googleId?: string; image?: string } = {};
    if (!user.googleId) updates.googleId = profile.id;
    if (profile.picture && !user.image) updates.image = profile.picture;

    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }

    return { user, isNew: false };
  }

  const username = await generateUniqueUsername(email, profile.name);

  user = await prisma.user.create({
    data: {
      username,
      email,
      googleId: profile.id,
      image: profile.picture,
      isNewUser: true,
    },
  });

  return { user, isNew: true };
}

export async function handleInviteForUser(userId: string, inviteCode?: string) {
  if (!inviteCode) return;

  const challenge = await prisma.challenge.findUnique({ where: { inviteCode } });
  if (!challenge) return;

  const existing = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId, challengeId: challenge.id },
    },
  });

  if (!existing) {
    await prisma.challengeMember.create({
      data: { userId, challengeId: challenge.id },
    });
  } else if (existing.status === "LEFT") {
    await prisma.challengeMember.update({
      where: { id: existing.id },
      data: { status: "ACTIVE" },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { focusChallengeId: challenge.id },
  });
}
