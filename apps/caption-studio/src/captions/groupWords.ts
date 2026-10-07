import type { Word } from "./types";

export type CaptionLine = {
  words: Word[];
  start: number;
  end: number;
};

type GroupOptions = {
  maxWordsPerLine?: number;
  maxLineDurationSeconds?: number;
  pauseBreakSeconds?: number;
};

// Chunks a flat whisperX-style word list into short on-screen caption lines,
// breaking on speech pauses or once a line gets too long/long-lived.
export const groupWordsIntoLines = (
  words: Word[],
  options: GroupOptions = {},
): CaptionLine[] => {
  const {
    maxWordsPerLine = 5,
    maxLineDurationSeconds = 2.2,
    pauseBreakSeconds = 0.6,
  } = options;

  const lines: CaptionLine[] = [];
  let current: Word[] = [];

  const flush = () => {
    if (current.length === 0) return;
    lines.push({
      words: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
    current = [];
  };

  for (const w of words) {
    const prev = current[current.length - 1];
    const gap = prev ? w.start - prev.end : 0;
    const lineDuration = prev ? w.end - current[0].start : 0;

    if (
      prev &&
      (gap >= pauseBreakSeconds ||
        current.length >= maxWordsPerLine ||
        lineDuration >= maxLineDurationSeconds)
    ) {
      flush();
    }

    current.push(w);
  }
  flush();

  return lines;
};
