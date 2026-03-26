import nodemailer from "nodemailer";
import env from "../config/env.js";

let transporter;

function isEmailConfigured() {
  return Boolean(env.smtpHost && env.smtpPort && env.emailFrom);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth:
        env.smtpUser || env.smtpPass
          ? {
              user: env.smtpUser,
              pass: env.smtpPass
            }
          : undefined
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const activeTransporter = getTransporter();

  if (!activeTransporter || !to) {
    return false;
  }

  await activeTransporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html
  });

  return true;
}
