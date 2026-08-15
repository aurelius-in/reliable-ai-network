import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "You built something real. Now it's time to get paid. Make it RAIN.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #070a12 0%, #0c1220 45%, #121a2b 100%)",
          color: "#eef2fa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#00e5ff",
          }}
        >
          Make it RAIN
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            You built something real.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            Now it's time to get paid.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#00e5ff",
            }}
          >
            Make it RAIN.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#94a3b8",
              maxWidth: 900,
              lineHeight: 1.35,
              marginTop: 12,
            }}
          >
            Find who may pay, stress-test the offer, and figure out the next
            conversation worth having.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#64748b",
          }}
        >
          <span>makeitrainapp.com</span>
          <span>Reliable AI Network, LLC</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
