import { ImageResponse } from "next/og";

export const contentType = "image/png";

export default async function Icon({ searchParams }) {
  const params = await searchParams;
  const requestedSize = Number(params?.get("size")) || 512;
  const size = Math.max(32, Math.min(requestedSize, 512));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #f4fbff 0%, #e3f5fb 52%, #d8f0f7 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "78%",
            height: "78%",
            borderRadius: "28%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            boxShadow: "0 18px 50px rgba(23, 61, 87, 0.14)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "12%",
              borderRadius: "26%",
              border: "12px solid #b8dff0",
            }}
          />
          <div
            style={{
              fontSize: size * 0.46,
              fontWeight: 700,
              color: "#1f4f7a",
              letterSpacing: "-0.06em",
            }}
          >
            DF
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
