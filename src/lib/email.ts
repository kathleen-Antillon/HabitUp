import { getAppBaseUrl } from "@/lib/app-url";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "HabitUp <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[HabitUp] Email (no RESEND_API_KEY): to=${to} subject=${subject}`);
    console.log(text);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[HabitUp] Email failed (${response.status}): ${body}`);
    return false;
  }

  return true;
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Restablece tu contraseña en HabitUp";

  const text = [
    "Recibimos una solicitud para restablecer tu contraseña en HabitUp.",
    "",
    `Abre este enlace (válido por 1 hora): ${resetUrl}`,
    "",
    "Si no solicitaste este cambio, puedes ignorar este correo.",
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #334155;">
      <h1 style="font-size: 20px; margin-bottom: 16px;">Restablece tu contraseña</h1>
      <p style="line-height: 1.5; margin-bottom: 24px;">
        Recibimos una solicitud para restablecer tu contraseña en HabitUp.
        Haz clic en el botón para elegir una nueva contraseña. El enlace expira en 1 hora.
      </p>
      <a
        href="${resetUrl}"
        style="display: inline-block; background: #E07A5F; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 9999px;"
      >
        Restablecer contraseña
      </a>
      <p style="margin-top: 24px; font-size: 14px; color: #64748B; line-height: 1.5;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
        <a href="${resetUrl}" style="color: #0E68FF; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="margin-top: 24px; font-size: 14px; color: #64748B;">
        Si no solicitaste este cambio, ignora este correo.
      </p>
    </div>
  `.trim();

  return sendEmail({ to: email, subject, html, text });
}
