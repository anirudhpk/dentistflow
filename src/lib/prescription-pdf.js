import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function wrapText(text, maxChars = 72) {
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

function drawBlock(page, font, title, content, x, y, width) {
  page.drawText(title, {
    x,
    y,
    size: 13,
    font,
    color: rgb(0.06, 0.16, 0.3),
  });

  let cursorY = y - 22;
  const lines = wrapText(content || "Not recorded yet.");

  for (const line of lines) {
    page.drawText(line, {
      x,
      y: cursorY,
      size: 11,
      font,
      color: rgb(0.22, 0.27, 0.35),
      maxWidth: width,
    });
    cursorY -= 16;
  }

  return cursorY - 8;
}

export async function generatePrescriptionPdfBytes(patient) {
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

  page.drawText("DentistFlow Clinic Prescription", {
    x: 190,
    y: 775,
    size: 22,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });
  page.drawText("Reserved header area includes space for the clinic logo.", {
    x: 190,
    y: 753,
    size: 11,
    font: bodyFont,
    color: rgb(0.36, 0.4, 0.47),
  });

  page.drawLine({
    start: { x: 48, y: 715 },
    end: { x: 547, y: 715 },
    thickness: 1,
    color: rgb(0.85, 0.89, 0.94),
  });

  page.drawText(`Patient: ${patient.fullName}`, {
    x: 48,
    y: 688,
    size: 12,
    font: titleFont,
    color: rgb(0.06, 0.16, 0.3),
  });
  page.drawText(`Patient ID: ${patient.id}`, {
    x: 48,
    y: 668,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });
  page.drawText(`Phone: +91 ${patient.phone.slice(0, 5)} ${patient.phone.slice(5)}`, {
    x: 220,
    y: 668,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });
  page.drawText(`Age/Gender: ${patient.age} / ${patient.gender}`, {
    x: 400,
    y: 668,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });

  page.drawText(`Visit Type: ${patient.visitType}`, {
    x: 48,
    y: 648,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
    x: 400,
    y: 648,
    size: 11,
    font: bodyFont,
    color: rgb(0.22, 0.27, 0.35),
  });

  let cursorY = 610;
  cursorY = drawBlock(page, titleFont, "Chief Complaint", patient.chiefComplaint, 48, cursorY, 500);
  cursorY = drawBlock(page, titleFont, "Symptoms", patient.symptoms, 48, cursorY, 500);
  cursorY = drawBlock(page, titleFont, "Diagnosis", patient.diagnosis, 48, cursorY, 500);
  cursorY = drawBlock(
    page,
    titleFont,
    "Recommended Medicines",
    patient.recommendedMedicines,
    48,
    cursorY,
    500
  );
  cursorY = drawBlock(
    page,
    titleFont,
    "Follow-up Plan",
    patient.nextFollowUpDate
      ? `${patient.followUpNote || "Follow-up required"} Next review on ${patient.nextFollowUpDate}.`
      : patient.followUpNote || "No follow-up date recorded yet.",
    48,
    cursorY,
    500
  );

  page.drawLine({
    start: { x: 320, y: 92 },
    end: { x: 545, y: 92 },
    thickness: 1,
    color: rgb(0.7, 0.75, 0.82),
  });
  page.drawText("Doctor signature", {
    x: 392,
    y: 76,
    size: 11,
    font: bodyFont,
    color: rgb(0.36, 0.4, 0.47),
  });

  return pdf.save();
}
