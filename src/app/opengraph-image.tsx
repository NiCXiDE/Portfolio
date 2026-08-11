import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE_NAME;
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
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #DEF0FD 0%, #B8D4E8 45%, #404179 100%)",
          color: "#1a1a2e",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
          Nicolas Ayala
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 36,
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          Diseño gráfico &amp; interfaces
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          {SITE_NAME}
        </div>
      </div>
    ),
    { ...size },
  );
}
