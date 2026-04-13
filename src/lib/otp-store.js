const globalForOtpStore = globalThis;

if (!globalForOtpStore.__dentistOtpStore) {
  globalForOtpStore.__dentistOtpStore = new Map();
}

export const otpStore = globalForOtpStore.__dentistOtpStore;
