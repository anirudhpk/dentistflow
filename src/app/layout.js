import "./globals.css";

export const metadata = {
  title: "DentistFlow Clinic OS",
  description:
    "A modern clinic management workspace for dental teams, appointments, and patient care.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
