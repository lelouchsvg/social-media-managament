#!/usr/bin/env python3
"""Transcribe a video/audio file with whisperX into the word-level JSON
schema consumed by apps/caption-studio (see src/captions/types.ts).

Requires the whisperX package (`pip install whisperx`) and ffmpeg on PATH.
Speaker diarization needs a Hugging Face token with access to
pyannote/speaker-diarization-community-1 (https://huggingface.co/settings/tokens).

Usage:
    python scripts/transcribe.py input.mp4 -o captions.json
    python scripts/transcribe.py input.mp4 -o captions.json --diarize --hf-token $HF_TOKEN
    python scripts/transcribe.py input.mp4 -o captions.json --model base --device cpu --compute-type int8
"""

import argparse
import json
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audio", help="Path to an audio or video file")
    parser.add_argument("-o", "--output", required=True, help="Path to write captions JSON")
    parser.add_argument("--model", default="large-v2", help="Whisper model size (default: large-v2)")
    parser.add_argument("--language", default=None, help="Force a language code (default: auto-detect)")
    parser.add_argument("--device", default="cuda", choices=["cuda", "cpu"])
    parser.add_argument("--compute-type", default="float16", help="float16, int8, etc.")
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--diarize", action="store_true", help="Label words with speaker IDs")
    parser.add_argument("--hf-token", default=None, help="Hugging Face token, required with --diarize")
    parser.add_argument("--min-speakers", type=int, default=None)
    parser.add_argument("--max-speakers", type=int, default=None)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.diarize and not args.hf_token:
        print("--diarize requires --hf-token", file=sys.stderr)
        sys.exit(1)

    import whisperx  # imported lazily so --help works without the dependency installed

    model = whisperx.load_model(args.model, args.device, compute_type=args.compute_type)
    audio = whisperx.load_audio(args.audio)

    result = model.transcribe(
        audio, batch_size=args.batch_size, language=args.language
    )

    align_model, metadata = whisperx.load_align_model(
        language_code=result["language"], device=args.device
    )
    result = whisperx.align(
        result["segments"], align_model, metadata, audio, args.device,
        return_char_alignments=False,
    )

    if args.diarize:
        from whisperx.diarize import DiarizationPipeline

        diarize_model = DiarizationPipeline(token=args.hf_token, device=args.device)
        diarize_segments = diarize_model(
            audio, min_speakers=args.min_speakers, max_speakers=args.max_speakers
        )
        result = whisperx.assign_word_speakers(diarize_segments, result)

    words = []
    for segment in result["segments"]:
        for w in segment.get("words", []):
            # Words whisperX couldn't align (e.g. "£13.60") have no timing;
            # skip them rather than writing out a caption with no position.
            if "start" not in w or "end" not in w:
                continue
            entry = {"word": w["word"].strip(), "start": w["start"], "end": w["end"]}
            if "speaker" in w:
                entry["speaker"] = w["speaker"]
            words.append(entry)

    with open(args.output, "w") as f:
        json.dump({"language": result.get("language"), "words": words}, f, indent=2)

    print(f"Wrote {len(words)} words to {args.output}")


if __name__ == "__main__":
    main()
