import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Only create if we have host and port
  if (ENV.smtpHost) {
    transporter = nodemailer.createTransport({
      host: ENV.smtpHost,
      port: ENV.smtpPort,
      secure: ENV.smtpPort === 465, // true for 465, false for other ports
      auth: ENV.smtpUser && ENV.smtpPass ? {
        user: ENV.smtpUser,
        pass: ENV.smtpPass,
      } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  console.log(`[Email] Attempting to send to: ${to}, Subject: ${subject}`);
  const client = getTransporter();

  if (!client) {
    console.log("==========================================");
    console.log(`[Email Log] SMTP not configured. Logged email:`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log("==========================================");
    return { success: true, loggedToConsole: true };
  }

  try {
    const info = await client.sendMail({
      from: ENV.smtpFrom,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });
    console.log(`[Email] Sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Failed to send email via SMTP:", error);
    return { success: false, error };
  }
}
