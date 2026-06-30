import { BRAND } from "@/lib/brand-colors";

type EmailLayoutOptions = {
  previewText: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

export function buildEmailLayout({
  previewText,
  title,
  bodyHtml,
  cta,
  footerNote,
}: EmailLayoutOptions): string {
  const ctaBlock = cta
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto 0;">
        <tr>
          <td style="border-radius: 9999px; background: ${BRAND.action};">
            <a
              href="${cta.href}"
              style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;"
            >
              ${cta.label}
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  const footer = footerNote
    ? `<p style="margin: 32px 0 0; font-size: 13px; line-height: 1.5; color: ${BRAND.serenity};">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${BRAND.clarity};">
    <span style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${previewText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${BRAND.clarity}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden;">
            <tr>
              <td style="background: ${BRAND.discipline}; padding: 20px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 40px; vertical-align: middle;">
                      <div style="width: 36px; height: 36px; border-radius: 10px; background: #ffffff; color: ${BRAND.discipline}; font-size: 18px; font-weight: 700; line-height: 36px; text-align: center;">H</div>
                    </td>
                    <td style="padding-left: 12px; vertical-align: middle;">
                      <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">HabitUp</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 28px 36px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: ${BRAND.discipline};">
                <h1 style="margin: 0 0 12px; font-size: 22px; line-height: 1.3; color: ${BRAND.discipline};">${title}</h1>
                ${bodyHtml}
                ${ctaBlock}
                ${footer}
              </td>
            </tr>
          </table>
          <p style="margin: 20px 0 0; font-family: system-ui, sans-serif; font-size: 12px; color: ${BRAND.serenity};">
            © ${new Date().getFullYear()} HabitUp
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

export type GoalReminderChallenge = {
  name: string;
  goalsCount: number;
  completedCount: number;
  url: string;
};

export function buildGoalReminderEmail({
  username,
  dateLabel,
  challenges,
  homeUrl,
}: {
  username: string;
  dateLabel: string;
  challenges: GoalReminderChallenge[];
  homeUrl: string;
}): { subject: string; html: string; text: string } {
  const subject =
    challenges.length === 1
      ? `Recuerda completar tus objetivos en ${challenges[0].name}`
      : `Tienes ${challenges.length} retos pendientes por hoy`;

  const challengeRows = challenges
    .map(
      (c) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
            <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${BRAND.discipline};">${c.name}</p>
            <p style="margin: 0 0 10px; font-size: 13px; color: ${BRAND.serenity};">
              ${c.completedCount}/${c.goalsCount} objetivos completados hoy
            </p>
            <a href="${c.url}" style="font-size: 13px; font-weight: 600; color: #0E68FF; text-decoration: none;">
              Completar objetivos →
            </a>
          </td>
        </tr>
      `
    )
    .join("");

  const bodyHtml = `
    <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: ${BRAND.serenity};">
      Hola <strong style="color: ${BRAND.discipline};">${username}</strong>,
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: ${BRAND.serenity};">
      Aún no has completado tus objetivos del <strong style="color: ${BRAND.discipline};">${dateLabel}</strong>.
      Tómate un momento para registrar tu progreso antes de que termine el día.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${challengeRows}
    </table>
  `;

  const html = buildEmailLayout({
    previewText: `Completa tus objetivos de hoy en HabitUp (${dateLabel})`,
    title: "⏰ Recordatorio de objetivos",
    bodyHtml,
    cta: { label: "Ir a mis retos", href: homeUrl },
    footerNote:
      "Recibes este correo porque tienes retos activos con objetivos pendientes hoy. Tienes hasta medianoche en tu zona horaria para completarlos.",
  });

  const text = [
    `Hola ${username},`,
    "",
    `Aún no has completado tus objetivos del ${dateLabel}:`,
    "",
    ...challenges.map(
      (c) =>
        `- ${c.name}: ${c.completedCount}/${c.goalsCount} objetivos (${c.url})`
    ),
    "",
    `Ir a mis retos: ${homeUrl}`,
    "",
    "Tienes hasta medianoche en tu zona horaria para completarlos.",
  ].join("\n");

  return { subject, html, text };
}
