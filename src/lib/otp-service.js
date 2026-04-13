import { otpStore } from "./otp-store";

const GUPSHUP_BASE_URL = "https://enterprise.smsgupshup.com/GatewayAPI/rest";
const DEFAULT_OTP_LENGTH = 6;
const DEFAULT_OTP_TYPE = "NUMERIC";
const DEFAULT_OTP_TEMPLATE =
  "Your DentistFlow verification code is %code%.";
const DEFAULT_EXPIRY_SECONDS = 300;

function sanitizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

function formatIndianPhone(phone) {
  return `91${sanitizePhone(phone)}`;
}

function buildGupshupParams(values) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

function parseGupshupResponse(text) {
  const parts = text.split("|").map((part) => part.trim());
  return {
    ok: parts[0]?.toLowerCase() === "success",
    phone: parts[1] || "",
    requestId: parts[2] || "",
    message: parts.slice(3).join(" | ") || text,
    raw: text,
  };
}

function generateLocalOtp(length = DEFAULT_OTP_LENGTH) {
  const minimum = 10 ** (length - 1);
  const maximum = 10 ** length - 1;
  return String(Math.floor(minimum + Math.random() * (maximum - minimum)));
}

function getProvider() {
  if (process.env.GUPSHUP_USER_ID && process.env.GUPSHUP_PASSWORD) {
    return "gupshup";
  }

  return "mock";
}

async function sendWithGupshup(phone) {
  const params = buildGupshupParams({
    userid: process.env.GUPSHUP_USER_ID,
    password: process.env.GUPSHUP_PASSWORD,
    method: "TWO_FACTOR_AUTH",
    v: "1.1",
    phone_no: formatIndianPhone(phone),
    msg: process.env.GUPSHUP_OTP_TEMPLATE || DEFAULT_OTP_TEMPLATE,
    format: "text",
    otpCodeLength: process.env.GUPSHUP_OTP_LENGTH || DEFAULT_OTP_LENGTH,
    otpCodeType: process.env.GUPSHUP_OTP_TYPE || DEFAULT_OTP_TYPE,
  });

  const response = await fetch(`${GUPSHUP_BASE_URL}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const text = await response.text();
  const parsed = parseGupshupResponse(text);

  if (!response.ok || !parsed.ok) {
    throw new Error(parsed.message || "Gupshup failed to send OTP.");
  }

  return {
    provider: "gupshup",
    phone,
    requestId: parsed.requestId,
    message: parsed.message,
  };
}

async function verifyWithGupshup(phone, otp) {
  const params = buildGupshupParams({
    userid: process.env.GUPSHUP_USER_ID,
    password: process.env.GUPSHUP_PASSWORD,
    method: "TWO_FACTOR_AUTH",
    v: "1.1",
    phone_no: formatIndianPhone(phone),
    otp_code: otp,
  });

  const response = await fetch(`${GUPSHUP_BASE_URL}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const text = await response.text();
  const parsed = parseGupshupResponse(text);

  if (!response.ok || !parsed.ok) {
    throw new Error(parsed.message || "OTP verification failed.");
  }

  return {
    provider: "gupshup",
    phone,
    requestId: parsed.requestId,
    message: parsed.message,
  };
}

async function sendWithMock(phone) {
  const code = generateLocalOtp();
  const requestId = crypto.randomUUID();
  const expiresAt = Date.now() + DEFAULT_EXPIRY_SECONDS * 1000;

  otpStore.set(phone, {
    code,
    requestId,
    expiresAt,
  });

  return {
    provider: "mock",
    phone,
    requestId,
    message: `Mock OTP generated for local development. Use ${code} to verify.`,
    devCode: code,
    expiresAt,
  };
}

async function verifyWithMock(phone, otp) {
  const current = otpStore.get(phone);

  if (!current) {
    throw new Error("No OTP request found for this phone number.");
  }

  if (Date.now() > current.expiresAt) {
    otpStore.delete(phone);
    throw new Error("This OTP has expired. Please request a new one.");
  }

  if (current.code !== otp) {
    throw new Error("The OTP you entered is incorrect.");
  }

  otpStore.delete(phone);

  return {
    provider: "mock",
    phone,
    requestId: current.requestId,
    message: "OTP verified successfully.",
  };
}

export function validatePhone(phone) {
  return sanitizePhone(phone).length === 10;
}

export async function sendOtp(phone) {
  const normalizedPhone = sanitizePhone(phone);
  const provider = getProvider();

  if (!validatePhone(normalizedPhone)) {
    throw new Error("A valid 10-digit mobile number is required.");
  }

  if (provider === "gupshup") {
    return sendWithGupshup(normalizedPhone);
  }

  return sendWithMock(normalizedPhone);
}

export async function verifyOtp(phone, otp) {
  const normalizedPhone = sanitizePhone(phone);
  const normalizedOtp = String(otp || "").replace(/\D/g, "");
  const provider = getProvider();

  if (!validatePhone(normalizedPhone)) {
    throw new Error("A valid 10-digit mobile number is required.");
  }

  if (!normalizedOtp) {
    throw new Error("An OTP is required.");
  }

  if (provider === "gupshup") {
    return verifyWithGupshup(normalizedPhone, normalizedOtp);
  }

  return verifyWithMock(normalizedPhone, normalizedOtp);
}
