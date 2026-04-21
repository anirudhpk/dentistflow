import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
            width: "82%",
            height: "82%",
            borderRadius: "30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            boxShadow: "0 14px 34px rgba(23, 61, 87, 0.18)",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#1f4f7a",
              letterSpacing: "-0.08em",
            }}
          >
            DF
          </div>
        </div>
      </div>
    ),
    size
  );
}
