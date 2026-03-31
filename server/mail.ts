import nodemailer from "nodemailer";
import { log } from "./index";
import dotenv from "dotenv";

dotenv.config();

/**
 * Sends a reminder email via Gmail SMTP (Nodemailer) to any arbitrary recipient email.
 * This does NOT send to the logged-in user's email — it sends to whatever
 * email address the user typed in the reminder form.
 */
export async function sendReminderEmail(recipientEmail: string) {
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASS;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
      <div style="background: #0f172a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🩺 SkinVision</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px;">
        <h2 style="color: #0f172a;">Hello!</h2>
        <p style="color: #475569;">Your monthly skin check reminder is here. Early detection is key to staying healthy.</p>
        <a href="${process.env.APP_URL || "http://localhost:5000"}/analyze"
           style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 8px;">
          Start My Scan
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          This reminder was sent to <strong>${recipientEmail}</strong>.
        </p>
      </div>
    </div>
  `;

  // If no Gmail credentials configured, return preview-only mode
  if (!gmailUser || !gmailPass) {
    log(`Gmail SMTP not configured — returning preview simulation`, "mail-service");
    return {
      success: true,
      sentReal: false,
      htmlContent,
      error: "SMTP credentials not set in .env"
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"SkinVision" <${gmailUser}>`,
      to: recipientEmail,          // ← The email the user typed in the form
      subject: "🩺 Your Monthly SkinCheck Reminder",
      html: htmlContent,
    });

    log(`Email sent successfully to ${recipientEmail} (messageId: ${info.messageId})`, "mail-service");
    return {
      success: true,
      sentReal: true,
      htmlContent,
      messageId: info.messageId,
    };
  } catch (error: any) {
    log(`Nodemailer error: ${error.message}`, "mail-service");
    return {
      success: true,
      sentReal: false,
      htmlContent,
      error: error.message,
    };
  }
}
