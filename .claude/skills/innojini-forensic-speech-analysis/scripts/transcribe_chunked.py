#!/usr/bin/env python3
"""
OOM-safe chunked transcription for long audio files.

Optimized for DGX Spark (128GB unified memory) and 70+ minute recordings.

Usage:
    python transcribe_chunked.py input.wav -o output.json
    python transcribe_chunked.py input.wav --model large-v3 --batch-size 8 --language ko

Output:
    - JSON: Timestamped transcription with segments
    - TXT: Plain text transcription
    - SRT: Subtitle format (optional with --srt)
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Optional


def transcribe_chunked(
    audio_path: str,
    output_path: str,
    model_name: str = "large-v3",
    language: str = "ko",
    chunk_length_s: int = 30,
    batch_size: int = 16,
    compute_type: str = "float16",
    align: bool = True,
    srt: bool = False,
    device: str = "auto"
) -> dict:
    """
    Transcribe long audio with OOM-safe chunking.
    
    Args:
        audio_path: Input audio file path
        output_path: Output JSON path
        model_name: Whisper model (tiny, base, small, medium, large-v2, large-v3)
        language: Language code (ko, en, etc.)
        chunk_length_s: Chunk length in seconds (default 30)
        batch_size: Batch size for processing (default 16)
        compute_type: float16, int8, or float32
        align: Whether to run word-level alignment
        srt: Whether to output SRT subtitle
        device: cuda, cpu, or auto
        
    Returns:
        Transcription result dict
    """
    try:
        import whisperx
        import torch
    except ImportError:
        print("Error: whisperx not installed. Run: pip install whisperx")
        sys.exit(1)
    
    # Device selection
    if device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    
    print(f"[1/5] Loading model: {model_name} on {device} ({compute_type})")
    
    # Load model
    model = whisperx.load_model(
        model_name,
        device=device,
        compute_type=compute_type,
        language=language
    )
    
    print(f"[2/5] Loading audio: {audio_path}")
    audio = whisperx.load_audio(audio_path)
    duration = len(audio) / 16000  # 16kHz sample rate
    print(f"       Duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")
    
    print(f"[3/5] Transcribing with batch_size={batch_size}, chunk={chunk_length_s}s")
    result = model.transcribe(
        audio,
        batch_size=batch_size,
        chunk_length=chunk_length_s,
        language=language
    )
    
    # Word-level alignment
    if align and result.get("segments"):
        print(f"[4/5] Aligning words (language={language})")
        try:
            model_a, metadata = whisperx.load_align_model(
                language_code=language,
                device=device
            )
            result = whisperx.align(
                result["segments"],
                model_a,
                metadata,
                audio,
                device=device,
                return_char_alignments=False
            )
        except Exception as e:
            print(f"       Warning: Alignment failed ({e}), skipping")
    else:
        print("[4/5] Skipping alignment")
    
    print(f"[5/5] Writing output")
    
    # Prepare output
    output = Path(output_path)
    
    # Add metadata
    result["metadata"] = {
        "source_file": str(audio_path),
        "duration_seconds": duration,
        "model": model_name,
        "language": language,
        "chunk_length_s": chunk_length_s,
        "batch_size": batch_size
    }
    
    # JSON output
    json_path = output.with_suffix('.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"       Saved: {json_path}")
    
    # TXT output
    txt_path = output.with_suffix('.txt')
    text = " ".join([seg.get("text", "") for seg in result.get("segments", [])])
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(text.strip())
    print(f"       Saved: {txt_path}")
    
    # SRT output (optional)
    if srt:
        srt_path = output.with_suffix('.srt')
        with open(srt_path, 'w', encoding='utf-8') as f:
            for i, seg in enumerate(result.get("segments", []), 1):
                start = format_timestamp(seg.get("start", 0))
                end = format_timestamp(seg.get("end", 0))
                text = seg.get("text", "").strip()
                f.write(f"{i}\n{start} --> {end}\n{text}\n\n")
        print(f"       Saved: {srt_path}")
    
    print(f"\n✅ Transcription complete: {len(result.get('segments', []))} segments")
    
    return result


def format_timestamp(seconds: float) -> str:
    """Format seconds to SRT timestamp (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def main():
    parser = argparse.ArgumentParser(
        description="OOM-safe chunked transcription for long audio files"
    )
    parser.add_argument("audio", help="Input audio file (wav, mp3, m4a, etc.)")
    parser.add_argument("-o", "--output", default="transcription.json",
                        help="Output file path (default: transcription.json)")
    parser.add_argument("--model", default="large-v3",
                        choices=["tiny", "base", "small", "medium", "large-v2", "large-v3"],
                        help="Whisper model size (default: large-v3)")
    parser.add_argument("--language", default="ko",
                        help="Language code (default: ko)")
    parser.add_argument("--chunk-length", type=int, default=30,
                        help="Chunk length in seconds (default: 30)")
    parser.add_argument("--batch-size", type=int, default=16,
                        help="Batch size (default: 16, reduce if OOM)")
    parser.add_argument("--compute-type", default="float16",
                        choices=["float16", "int8", "float32"],
                        help="Compute type (default: float16)")
    parser.add_argument("--no-align", action="store_true",
                        help="Skip word-level alignment")
    parser.add_argument("--srt", action="store_true",
                        help="Also output SRT subtitle file")
    parser.add_argument("--device", default="auto",
                        choices=["auto", "cuda", "cpu"],
                        help="Device (default: auto)")
    
    args = parser.parse_args()
    
    if not Path(args.audio).exists():
        print(f"Error: Audio file not found: {args.audio}")
        sys.exit(1)
    
    transcribe_chunked(
        audio_path=args.audio,
        output_path=args.output,
        model_name=args.model,
        language=args.language,
        chunk_length_s=args.chunk_length,
        batch_size=args.batch_size,
        compute_type=args.compute_type,
        align=not args.no_align,
        srt=args.srt,
        device=args.device
    )


if __name__ == "__main__":
    main()
