export default function manifest() {
  return {
    name: "DentistFlow Clinic OS",
    short_name: "DentistFlow",
    description:
      "Dental clinic management for patient intake, visits, prescriptions, and follow-ups.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4fbff",
    theme_color: "#d8f0f7",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
