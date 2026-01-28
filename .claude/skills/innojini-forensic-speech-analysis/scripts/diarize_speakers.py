#!/usr/bin/env python3
"""
Speaker diarization and transcription combination.

Uses pyannote-audio for speaker separation and optionally combines with transcription.

Usage:
    python diarize_speakers.py input.wav -o speakers.json
    python diarize_speakers.py input.wav --min-speakers 2 --max-speakers 2
    python diarize_speakers.py input.wav --transcription transcript.json -o combined.json

Requirements:
    - HuggingFace token: export HF_TOKEN="your_token"
    - Accept licenses at:
      https://huggingface.co/pyannote/speaker-diarization-3.1
      https://huggingface.co/pyannote/segmentation-3.0

Output:
    - JSON: Speaker segments with timestamps and statistics
    - RTTM: Standard diarization format (with --rttm flag)
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional, List, Dict


def diarize_speakers(
    audio_path: str,
    output_path: str,
    transcription_path: Optional[str] = None,
    min_speakers: Optional[int] = None,
    max_speakers: Optional[int] = None,
    hf_token: Optional[str] = None,
    rttm: bool = False,
    device: str = "auto"
) -> dict:
    """
    Perform speaker diarization on audio file.
    
    Args:
        audio_path: Input audio file
        output_path: Output JSON path
        transcription_path: Optional transcription JSON to combine
        min_speakers: Minimum number of speakers (optional)
        max_speakers: Maximum number of speakers (optional)
        hf_token: HuggingFace token (or set HF_TOKEN env var)
        rttm: Whether to output RTTM format
        device: cuda, cpu, or auto
        
    Returns:
        Diarization result dict
    """
    try:
        import torch
        from pyannote.audio import Pipeline
    except ImportError:
        print("Error: pyannote-audio not installed. Run: pip install pyannote-audio")
        sys.exit(1)
    
    # Get HF token
    token = hf_token or os.environ.get("HF_TOKEN")
    if not token:
        print("Error: HuggingFace token required.")
        print("Set HF_TOKEN environment variable or use --hf-token")
        print("Get token at: https://huggingface.co/settings/tokens")
        sys.exit(1)
    
    # Device selection
    if device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    device_torch = torch.device(device)
    
    print(f"[1/4] Loading diarization pipeline on {device}")
    
    try:
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=token
        )
        pipeline.to(device_torch)
    except Exception as e:
        print(f"Error loading pipeline: {e}")
        print("Make sure you accepted the license at:")
        print("  https://huggingface.co/pyannote/speaker-diarization-3.1")
        sys.exit(1)
    
    print(f"[2/4] Running diarization: {audio_path}")
    
    # Run diarization
    diarization_params = {}
    if min_speakers is not None:
        diarization_params["min_speakers"] = min_speakers
    if max_speakers is not None:
        diarization_params["max_speakers"] = max_speakers
    
    diarization = pipeline(audio_path, **diarization_params)
    
    print(f"[3/4] Extracting segments")
    
    # Convert to segments
    segments = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        segments.append({
            "start": round(turn.start, 3),
            "end": round(turn.end, 3),
            "speaker": speaker
        })
    
    # Calculate statistics
    speaker_stats = {}
    for seg in segments:
        spk = seg["speaker"]
        dur = seg["end"] - seg["start"]
        if spk not in speaker_stats:
            speaker_stats[spk] = {
                "total_duration": 0,
                "segment_count": 0,
                "avg_segment_duration": 0
            }
        speaker_stats[spk]["total_duration"] += dur
        speaker_stats[spk]["segment_count"] += 1
    
    # Calculate averages
    for spk in speaker_stats:
        stats = speaker_stats[spk]
        stats["total_duration"] = round(stats["total_duration"], 2)
        stats["avg_segment_duration"] = round(
            stats["total_duration"] / stats["segment_count"], 2
        )
    
    # Combine with transcription if provided
    if transcription_path and Path(transcription_path).exists():
        print(f"[3.5/4] Combining with transcription: {transcription_path}")
        with open(transcription_path, 'r', encoding='utf-8') as f:
            transcript = json.load(f)
        
        segments = assign_speakers_to_transcript(
            segments, 
            transcript.get("segments", [])
        )
    
    # Build result
    result = {
        "segments": segments,
        "statistics": speaker_stats,
        "num_speakers": len(speaker_stats),
        "total_duration": sum(s["total_duration"] for s in speaker_stats.values()),
        "metadata": {
            "source_file": str(audio_path),
            "min_speakers": min_speakers,
            "max_speakers": max_speakers
        }
    }
    
    print(f"[4/4] Writing output")
    
    # JSON output
    output = Path(output_path)
    with open(output, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"       Saved: {output}")
    
    # RTTM output (optional)
    if rttm:
        rttm_path = output.with_suffix('.rttm')
        audio_name = Path(audio_path).stem
        with open(rttm_path, 'w') as f:
            for seg in segments:
                duration = seg["end"] - seg["start"]
                f.write(f"SPEAKER {audio_name} 1 {seg['start']:.3f} {duration:.3f} "
                       f"<NA> <NA> {seg['speaker']} <NA> <NA>\n")
        print(f"       Saved: {rttm_path}")
    
    print(f"\n✅ Diarization complete: {len(speaker_stats)} speakers, {len(segments)} segments")
    
    # Print speaker summary
    print("\nSpeaker Summary:")
    for spk, stats in sorted(speaker_stats.items()):
        pct = (stats["total_duration"] / result["total_duration"]) * 100
        print(f"  {spk}: {stats['total_duration']:.1f}s ({pct:.1f}%), "
              f"{stats['segment_count']} segments")
    
    return result


def assign_speakers_to_transcript(
    diarization_segments: List[Dict],
    transcript_segments: List[Dict]
) -> List[Dict]:
    """
    Assign speaker labels to transcript segments based on overlap.
    
    Uses maximum overlap to assign speakers to transcript segments.
    """
    result = []
    
    for t_seg in transcript_segments:
        t_start = t_seg.get("start", 0)
        t_end = t_seg.get("end", 0)
        
        # Find overlapping diarization segments
        best_speaker = "UNKNOWN"
        best_overlap = 0
        
        for d_seg in diarization_segments:
            d_start = d_seg["start"]
            d_end = d_seg["end"]
            
            # Calculate overlap
            overlap_start = max(t_start, d_start)
            overlap_end = min(t_end, d_end)
            overlap = max(0, overlap_end - overlap_start)
            
            if overlap > best_overlap:
                best_overlap = overlap
                best_speaker = d_seg["speaker"]
        
        # Create combined segment
        combined = {
            "start": t_start,
            "end": t_end,
            "text": t_seg.get("text", ""),
            "speaker": best_speaker
        }
        
        # Preserve word-level data if exists
        if "words" in t_seg:
            combined["words"] = t_seg["words"]
        
        result.append(combined)
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Speaker diarization for audio files"
    )
    parser.add_argument("audio", help="Input audio file")
    parser.add_argument("-o", "--output", default="speakers.json",
                        help="Output JSON path (default: speakers.json)")
    parser.add_argument("--transcription", "-t",
                        help="Transcription JSON to combine with diarization")
    parser.add_argument("--min-speakers", type=int,
                        help="Minimum number of speakers")
    parser.add_argument("--max-speakers", type=int,
                        help="Maximum number of speakers")
    parser.add_argument("--hf-token",
                        help="HuggingFace token (or set HF_TOKEN env var)")
    parser.add_argument("--rttm", action="store_true",
                        help="Also output RTTM format")
    parser.add_argument("--device", default="auto",
                        choices=["auto", "cuda", "cpu"],
                        help="Device (default: auto)")
    
    args = parser.parse_args()
    
    if not Path(args.audio).exists():
        print(f"Error: Audio file not found: {args.audio}")
        sys.exit(1)
    
    diarize_speakers(
        audio_path=args.audio,
        output_path=args.output,
        transcription_path=args.transcription,
        min_speakers=args.min_speakers,
        max_speakers=args.max_speakers,
        hf_token=args.hf_token,
        rttm=args.rttm,
        device=args.device
    )


if __name__ == "__main__":
    main()
