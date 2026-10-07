import type { CaptionTheme } from "./types";

// Theme shape is a simplified take on the palette/typography schema used by
// hyperframes' embedded-captions skill (see external-tools/hyperframes/skills/
// embedded-captions/themes/*.json) — font, palette, stroke/glow, position —
// adapted to what CSS + Remotion's `spring`/`interpolate` can drive directly.
export const themes: Record<string, CaptionTheme> = {
  bold: {
    name: "bold",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 900,
    fontSize: 88,
    textColor: "#ffffff",
    activeWordColor: "#ffe600",
    highlightBackground: null,
    strokeColor: "#000000",
    strokeWidth: 14,
    backgroundColor: "transparent",
    position: "bottom",
    letterSpacing: "0em",
    textTransform: "uppercase",
  },
  minimal: {
    name: "minimal",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: 600,
    fontSize: 64,
    textColor: "rgba(255,255,255,0.85)",
    activeWordColor: "#ffffff",
    highlightBackground: "rgba(255,255,255,0.14)",
    strokeColor: null,
    strokeWidth: 0,
    backgroundColor: "transparent",
    position: "center",
    letterSpacing: "0.01em",
    textTransform: "none",
  },
  neon: {
    name: "neon",
    fontFamily: "'Space Grotesk', Arial, sans-serif",
    fontWeight: 700,
    fontSize: 72,
    textColor: "#ffe9d6",
    activeWordColor: "#ff3fae",
    highlightBackground: null,
    strokeColor: null,
    strokeWidth: 0,
    backgroundColor: "transparent",
    position: "bottom",
    letterSpacing: "0.02em",
    textTransform: "none",
  },
};

export type ThemeName = keyof typeof themes;
