export type Word = {
  word: string;
  start: number;
  end: number;
  speaker?: string;
};

export type Transcript = {
  language?: string;
  words: Word[];
};

export type CaptionTheme = {
  name: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  textColor: string;
  activeWordColor: string;
  highlightBackground: string | null;
  strokeColor: string | null;
  strokeWidth: number;
  backgroundColor: string;
  position: "bottom" | "center" | "top";
  letterSpacing: string;
  textTransform: "none" | "uppercase";
};
