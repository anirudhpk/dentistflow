import nodemailer from "nodemailer";

import { generatePrescriptionPdfBytes } from "./prescription-pdf";

function getAppBaseUrl() {
  return process.env.APP_BASE_URL?.replace(/\/$/, "") || "";
}

async function sendPrescriptionEmail(patient, pdfBytes) {
  if (!patient.email) {
    return { channel: "email", status: "skipped", reason: "No patient email." };
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return {
      channel: "email",
      status: "skipped",
      reason: "SMTP is not configured.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: patient.email,
    subject: `Prescription for ${patient.fullName}`,
    text: `Please find attached the prescription for ${patient.fullName}.`,
    attachments: [
      {
        filename: `${patient.id.toLowerCase()}-prescription.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  });

  return { channel: "email", status: "sent", recipient: patient.email };
}

async function sendPrescriptionWhatsApp(patient) {
  const { GUPSHUP_WA_API_KEY, GUPSHUP_WA_SOURCE, GUPSHUP_WA_APP_NAME } = process.env;
  const appBaseUrl = getAppBaseUrl();

  if (!patient.phone) {
    return { channel: "whatsapp", status: "skipped", reason: "No patient phone." };
  }

  if (!GUPSHUP_WA_API_KEY || !GUPSHUP_WA_SOURCE || !GUPSHUP_WA_APP_NAME) {
    return {
      channel: "whatsapp",
      status: "skipped",
      reason: "Gupshup WhatsApp is not configured.",
    };
  }

  if (!appBaseUrl) {
    return {
      channel: "whatsapp",
      status: "skipped",
      reason: "APP_BASE_URL is required for WhatsApp document delivery.",
    };
  }

  const fileUrl = `${appBaseUrl}/api/patients/${patient.id}/prescription`;
  const payload = new URLSearchParams({
    channel: "whatsapp",
    source: GUPSHUP_WA_SOURCE,
    destination: `91${patient.phone}`,
    "src.name": GUPSHUP_WA_APP_NAME,
    message: JSON.stringify({
      type: "file",
      url: fileUrl,
      filename: `${patient.id}-prescription.pdf`,
    }),
  });

  const response = await fetch("https://api.gupshup.io/wa/api/v1/msg", {
    method: "POST",
    headers: {
      apikey: GUPSHUP_WA_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${text}`);
  }

  return { channel: "whatsapp", status: "sent", recipient: `91${patient.phone}` };
}

export async function sendPrescription(patient) {
  const pdfBytes = await generatePrescriptionPdfBytes(patient);

  const [email, whatsapp] = await Promise.allSettled([
    sendPrescriptionEmail(patient, pdfBytes),
    sendPrescriptionWhatsApp(patient),
  ]);

  return [email, whatsapp].map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { channel: "unknown", status: "error", reason: result.reason.message }
  );
}
