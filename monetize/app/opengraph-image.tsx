import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Make it RAIN — monetization tools for software creators";
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
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Turn what you shipped into revenue
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#94a3b8",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Guided monetization for indie developers and AI builders. 15 tools.
            Free 30-day trial.
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
