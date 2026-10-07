import React, { useMemo } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Transcript } from "./captions/types";
import { groupWordsIntoLines } from "./captions/groupWords";
import { themes, type ThemeName } from "./captions/themes";
import sampleCaptions from "../public/sample-captions.json";

export type CaptionedClipProps = {
  transcript: Transcript;
  theme: ThemeName;
  videoSrc?: string;
  backgroundColor: string;
  endPaddingSeconds: number;
};

export const captionedClipDefaultProps: CaptionedClipProps = {
  transcript: sampleCaptions as Transcript,
  theme: "bold",
  backgroundColor: "#0b0b0f",
  endPaddingSeconds: 0.6,
};

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

const calculateMetadata: CalculateMetadataFunction<CaptionedClipProps> = ({
  props,
}) => {
  const words = props.transcript.words;
  const lastEnd = words.length ? words[words.length - 1].end : 3;
  const durationInFrames = Math.max(
    1,
    Math.ceil((lastEnd + props.endPaddingSeconds) * FPS),
  );
  return { durationInFrames, fps: FPS, width: WIDTH, height: HEIGHT };
};

export const CaptionedClipComposition: React.FC = () => {
  return (
    <Composition
      id="CaptionedClip"
      component={CaptionedClip}
      durationInFrames={90}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={captionedClipDefaultProps}
      calculateMetadata={calculateMetadata}
    />
  );
};

const positionStyle: Record<
  string,
  React.CSSProperties
> = {
  bottom: { justifyContent: "flex-end", paddingBottom: 220 },
  center: { justifyContent: "center" },
  top: { justifyContent: "flex-start", paddingTop: 220 },
};

export const CaptionedClip: React.FC<CaptionedClipProps> = ({
  transcript,
  theme: themeName,
  videoSrc,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themes[themeName];
  const currentTime = frame / fps;

  const lines = useMemo(
    () => groupWordsIntoLines(transcript.words),
    [transcript],
  );

  const activeLine = lines.find(
    (line) => currentTime >= line.start && currentTime <= line.end + 0.15,
  );

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {videoSrc ? (
        <OffthreadVideo src={videoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}

      <AbsoluteFill
        style={{
          ...positionStyle[theme.position],
          alignItems: "center",
          padding: "0 64px",
        }}
      >
        {activeLine ? (
          <CaptionLineView
            words={activeLine.words}
            currentTime={currentTime}
            fps={fps}
            theme={theme}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CaptionLineView: React.FC<{
  words: { word: string; start: number; end: number }[];
  currentTime: number;
  fps: number;
  theme: (typeof themes)[ThemeName];
}> = ({ words, currentTime, fps, theme }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 20px",
        maxWidth: "90%",
      }}
    >
      {words.map((w, i) => {
        const isActive = currentTime >= w.start && currentTime <= w.end;
        const hasStarted = currentTime >= w.start;

        const entrance = spring({
          frame: Math.max(0, (currentTime - w.start) * fps),
          fps,
          config: { damping: 14, stiffness: 180, mass: 0.6 },
        });

        return (
          <span
            key={`${w.word}-${i}`}
            style={{
              fontFamily: theme.fontFamily,
              fontWeight: theme.fontWeight,
              fontSize: theme.fontSize,
              letterSpacing: theme.letterSpacing,
              textTransform: theme.textTransform,
              color: isActive ? theme.activeWordColor : theme.textColor,
              opacity: hasStarted ? 1 : 0.35,
              transform: `scale(${hasStarted ? 0.9 + entrance * 0.1 : 0.9})`,
              backgroundColor:
                isActive && theme.highlightBackground
                  ? theme.highlightBackground
                  : "transparent",
              padding: theme.highlightBackground ? "4px 14px" : undefined,
              borderRadius: theme.highlightBackground ? 12 : undefined,
              WebkitTextStroke:
                theme.strokeColor && theme.strokeWidth
                  ? `${theme.strokeWidth}px ${theme.strokeColor}`
                  : undefined,
              paintOrder: "stroke fill",
              textShadow:
                theme.name === "neon"
                  ? isActive
                    ? `0 0 8px ${theme.activeWordColor}, 0 0 22px ${theme.activeWordColor}`
                    : "0 0 6px rgba(255,214,170,0.45)"
                  : undefined,
              lineHeight: 1.15,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};
