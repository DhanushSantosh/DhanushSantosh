import { ImageResponse } from "next/og";

import { brandConfig } from "@/config/brand";
import { hero, techStack } from "@/data/content";

export const runtime = "nodejs";

type PreviewVariant = "og" | "wide";

const PREVIEW_DIMENSIONS: Record<PreviewVariant, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  wide: { width: 1280, height: 720 },
};

function buildPreviewImage(variant: PreviewVariant) {
  const { width, height } = PREVIEW_DIMENSIONS[variant];
  const spotlightSize = variant === "wide" ? 540 : 460;
  const headlineSize = variant === "wide" ? 76 : 70;
  const summarySize = variant === "wide" ? 28 : 26;
  const framePadding = variant === "wide" ? 56 : 48;
  const chips = [...techStack.fullStack.slice(0, 3), ...techStack.ai.slice(0, 3)];

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "linear-gradient(145deg, #02060d 0%, #030913 48%, #071526 100%)",
          color: "#f5f5f5",
          fontFamily:
            '"Geist", "Segoe UI", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 14% 18%, rgba(95,225,255,0.18), transparent 38%), radial-gradient(circle at 84% 20%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 72% 78%, rgba(46,113,255,0.22), transparent 34%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-8%",
            right: "-6%",
            width: spotlightSize,
            height: spotlightSize,
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(95,225,255,0.18) 0%, rgba(95,225,255,0.12) 22%, rgba(95,225,255,0.02) 55%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: 42,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 24px 80px rgba(0,0,0,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 30,
            bottom: 30,
            left: 30,
            width: 180,
            display: "flex",
            borderRadius: 42,
            border: "1px solid rgba(255,255,255,0.05)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 64,
            bottom: 64,
            left: 119,
            width: 1,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 18%, rgba(255,255,255,0.12) 82%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 90,
            width: 1,
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 16%, rgba(255,255,255,0.06) 84%, rgba(255,255,255,0) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: framePadding,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 16,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(245,245,245,0.58)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "999px",
                  background: "#5fe1ff",
                  boxShadow: "0 0 18px rgba(95,225,255,0.65)",
                }}
              />
              Xerocore Portfolio
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                fontSize: 18,
                color: "rgba(245,245,245,0.72)",
              }}
            >
              cinematic interfaces
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch",
              gap: 28,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                maxWidth: variant === "wide" ? 760 : 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: headlineSize,
                  lineHeight: 1.04,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  textWrap: "balance",
                }}
              >
                {hero.name}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 26,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(245,245,245,0.58)",
                }}
              >
                {hero.role}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 28,
                  maxWidth: 720,
                  fontSize: summarySize,
                  lineHeight: 1.4,
                  color: "rgba(245,245,245,0.82)",
                  textWrap: "balance",
                }}
              >
                {hero.tagline}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minWidth: 250,
                maxWidth: 280,
                padding: "26px 24px",
                borderRadius: 32,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  "linear-gradient(180deg, rgba(7,20,34,0.92) 0%, rgba(3,10,18,0.84) 100%)",
                boxShadow: "0 20px 64px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "rgba(245,245,245,0.44)",
                }}
              >
                Current Build
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  marginTop: 24,
                }}
              >
                {[
                  "AI-native product systems",
                  "Motion-forward frontend craft",
                  "Production-minded engineering",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 18,
                      color: "rgba(245,245,245,0.86)",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.28)",
                        background: "rgba(95,225,255,0.22)",
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                maxWidth: 860,
              }}
            >
              {chips.map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 18,
                    color: "rgba(245,245,245,0.75)",
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "rgba(245,245,245,0.56)",
                letterSpacing: "0.06em",
              }}
            >
              {brandConfig.displayDomain}
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant") === "wide" ? "wide" : "og";

  return buildPreviewImage(variant);
}
