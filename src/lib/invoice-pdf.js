import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function wrapLines(text, maxChars = 70) {
  const lines = [];
  for (const paragraph of String(text || "").split("\n")) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let current = words[0];
    for (const word of words.slice(1)) {
      if (`${current} ${word}`.length <= maxChars) {
        current += ` ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

export async function generateInvoicePdfBytes(patient) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 48,
    y: 730,
    width: 120,
    height: 72,
    borderColor: rgb(0.79, 0.84, 0.9),
    borderWidth: 1,
  });
  page.drawText("Clinic Logo", {
    x: 72,
    y: 763,
    size: 12,
    font: titleFont,
    color: rgb(0.45, 0.5, 0.58),
  });

  page.drawText("DentistFlow Invoice", {
    x: 190,
    y: 775,
    size: 24,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });

  page.drawText(`Invoice No: ${patient.invoiceNumber || patient.id}`, {
    x: 48,
    y: 690,
    size: 12,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });
  page.drawText(`Patient: ${patient.fullName}`, {
    x: 48,
    y: 668,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });
  page.drawText(`Phone: +91 ${patient.phone.slice(0, 5)} ${patient.phone.slice(5)}`, {
    x: 290,
    y: 668,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });
  page.drawText(`Status: ${patient.invoiceStatus || "Unpaid"}`, {
    x: 48,
    y: 646,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
    x: 290,
    y: 646,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });

  page.drawText("Invoice Items", {
    x: 48,
    y: 605,
    size: 14,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });

  let cursorY = 580;
  for (const line of wrapLines(patient.invoiceItems || "No items added yet.")) {
    page.drawText(line, {
      x: 48,
      y: cursorY,
      size: 11,
      font: bodyFont,
      color: rgb(0.22, 0.27, 0.35),
    });
    cursorY -= 16;
  }

  page.drawText("Notes", {
    x: 48,
    y: cursorY - 20,
    size: 14,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });
  cursorY -= 44;
  for (const line of wrapLines(patient.invoiceNotes || "No notes.")) {
    page.drawText(line, {
      x: 48,
      y: cursorY,
      size: 11,
      font: bodyFont,
      color: rgb(0.22, 0.27, 0.35),
    });
    cursorY -= 16;
  }

  page.drawRectangle({
    x: 380,
    y: 120,
    width: 165,
    height: 78,
    color: rgb(0.95, 0.98, 1),
    borderColor: rgb(0.83, 0.9, 0.94),
    borderWidth: 1,
  });
  page.drawText("Total", {
    x: 400,
    y: 170,
    size: 12,
    font: titleFont,
    color: rgb(0.36, 0.4, 0.47),
  });
  page.drawText(`Rs ${Number(patient.invoiceTotal || 0).toFixed(2)}`, {
    x: 400,
    y: 140,
    size: 22,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });

  return pdf.save();
}
