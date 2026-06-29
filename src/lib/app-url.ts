/** Base URL for links in emails and OAuth redirects. */
export function getAppBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return base.replace(/\/$/, "");
}
