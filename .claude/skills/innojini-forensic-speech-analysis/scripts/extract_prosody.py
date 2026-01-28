#!/usr/bin/env python3
"""
Prosody feature extraction using parselmouth (Praat).

Extracts F0 (pitch), intensity, duration, and speech rate for forensic analysis.

Usage:
    python extract_prosody.py input.wav -o prosody.json
    python extract_prosody.py input.wav --segments speakers.json -o prosody.json
    python extract_prosody.py input.wav --csv -o prosody.csv

Output:
    - JSON: Prosody statistics (mean, std, range)
    - CSV: Time-series data (with --csv flag)
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Optional, Dict, List
import warnings


def extract_prosody(
    audio_path: str,
    output_path: str,
    segments_path: Optional[str] = None,
    f0_min: float = 75.0,
    f0_max: float = 600.0,
    time_step: float = 0.01,
    csv_output: bool = False
) -> dict:
    """
    Extract prosody features from audio.
    
    Args:
        audio_path: Input audio file
        output_path: Output JSON path
        segments_path: Optional JSON with segments for per-segment analysis
        f0_min: Minimum F0 in Hz (default 75, lower for male voices)
        f0_max: Maximum F0 in Hz (default 600, higher for female voices)
        time_step: Time step in seconds for analysis (default 0.01)
        csv_output: Whether to also output CSV time-series
        
    Returns:
        Prosody features dict
    """
    try:
        import parselmouth
        from parselmouth.praat import call
        import numpy as np
    except ImportError:
        print("Error: parselmouth not installed. Run: pip install parselmouth")
        sys.exit(1)
    
    print(f"[1/4] Loading audio: {audio_path}")
    
    # Load audio
    sound = parselmouth.Sound(audio_path)
    total_duration = sound.get_total_duration()
    print(f"       Duration: {total_duration:.2f}s, Sample rate: {sound.sampling_frequency}Hz")
    
    def analyze_segment(snd, start: float = 0, end: Optional[float] = None) -> Dict:
        """Analyze a single audio segment."""
        # Extract segment if needed
        if end is not None and (start > 0 or end < snd.get_total_duration()):
            snd = snd.extract_part(start, end, parselmouth.WindowShape.RECTANGULAR, 1, False)
        
        duration = snd.get_total_duration()
        
        # F0 (Pitch) analysis
        pitch = call(snd, "To Pitch", time_step, f0_min, f0_max)
        
        # Get F0 values (excluding unvoiced frames)
        f0_values = pitch.selected_array['frequency']
        f0_voiced = f0_values[f0_values > 0]
        
        if len(f0_voiced) > 0:
            f0_stats = {
                "mean": float(np.mean(f0_voiced)),
                "std": float(np.std(f0_voiced)),
                "min": float(np.min(f0_voiced)),
                "max": float(np.max(f0_voiced)),
                "range": float(np.max(f0_voiced) - np.min(f0_voiced)),
                "median": float(np.median(f0_voiced)),
                "q25": float(np.percentile(f0_voiced, 25)),
                "q75": float(np.percentile(f0_voiced, 75))
            }
        else:
            f0_stats = {
                "mean": 0, "std": 0, "min": 0, "max": 0,
                "range": 0, "median": 0, "q25": 0, "q75": 0
            }
        
        # Voiced ratio
        total_frames = len(f0_values)
        voiced_frames = len(f0_voiced)
        voiced_ratio = voiced_frames / total_frames if total_frames > 0 else 0
        
        # Intensity analysis
        intensity = call(snd, "To Intensity", 100, time_step, "yes")
        int_values = intensity.values.flatten()
        int_values = int_values[~np.isnan(int_values)]
        
        if len(int_values) > 0:
            intensity_stats = {
                "mean": float(np.mean(int_values)),
                "std": float(np.std(int_values)),
                "min": float(np.min(int_values)),
                "max": float(np.max(int_values)),
                "range": float(np.max(int_values) - np.min(int_values))
            }
        else:
            intensity_stats = {"mean": 0, "std": 0, "min": 0, "max": 0, "range": 0}
        
        # Duration and speech rate estimation
        # Simple estimation: voiced segments / total duration
        duration_stats = {
            "total_seconds": float(duration),
            "voiced_ratio": float(voiced_ratio),
            "voiced_seconds": float(duration * voiced_ratio)
        }
        
        # Jitter and Shimmer (voice quality)
        voice_quality = {}
        try:
            point_process = call(snd, "To PointProcess (periodic, cc)", f0_min, f0_max)
            
            # Jitter (pitch perturbation)
            jitter_local = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
            jitter_rap = call(point_process, "Get jitter (rap)", 0, 0, 0.0001, 0.02, 1.3)
            
            # Shimmer (amplitude perturbation)
            shimmer_local = call([snd, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
            
            voice_quality = {
                "jitter_local": float(jitter_local) if not np.isnan(jitter_local) else None,
                "jitter_rap": float(jitter_rap) if not np.isnan(jitter_rap) else None,
                "shimmer_local": float(shimmer_local) if not np.isnan(shimmer_local) else None
            }
        except Exception:
            # Voice quality measures may fail on some audio
            voice_quality = {"jitter_local": None, "jitter_rap": None, "shimmer_local": None}
        
        return {
            "f0": f0_stats,
            "intensity": intensity_stats,
            "duration": duration_stats,
            "voice_quality": voice_quality
        }
    
    print(f"[2/4] Extracting prosody features (F0: {f0_min}-{f0_max}Hz)")
    
    # Segment-wise or whole-file analysis
    if segments_path and Path(segments_path).exists():
        print(f"[3/4] Analyzing per-segment: {segments_path}")
        
        with open(segments_path, 'r', encoding='utf-8') as f:
            segments_data = json.load(f)
        
        segments = segments_data.get("segments", segments_data)
        if isinstance(segments, dict):
            segments = [segments]
        
        results = []
        for i, seg in enumerate(segments):
            start = seg.get("start", 0)
            end = seg.get("end", total_duration)
            speaker = seg.get("speaker", "UNKNOWN")
            text = seg.get("text", "")
            
            features = analyze_segment(sound, start, end)
            features["start"] = start
            features["end"] = end
            features["speaker"] = speaker
            features["text"] = text
            results.append(features)
            
            if (i + 1) % 50 == 0:
                print(f"       Processed {i + 1}/{len(segments)} segments")
        
        # Aggregate statistics per speaker
        speaker_agg = aggregate_by_speaker(results)
        
        output_data = {
            "segments": results,
            "by_speaker": speaker_agg,
            "metadata": {
                "source_file": str(audio_path),
                "total_duration": total_duration,
                "num_segments": len(results),
                "f0_range": [f0_min, f0_max]
            }
        }
    else:
        print(f"[3/4] Analyzing whole file")
        
        features = analyze_segment(sound)
        output_data = {
            **features,
            "metadata": {
                "source_file": str(audio_path),
                "total_duration": total_duration,
                "f0_range": [f0_min, f0_max]
            }
        }
    
    print(f"[4/4] Writing output")
    
    # JSON output
    output = Path(output_path)
    with open(output.with_suffix('.json'), 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"       Saved: {output.with_suffix('.json')}")
    
    # CSV output (time-series)
    if csv_output:
        csv_path = output.with_suffix('.csv')
        write_timeseries_csv(sound, csv_path, f0_min, f0_max, time_step)
        print(f"       Saved: {csv_path}")
    
    print(f"\n✅ Prosody extraction complete")
    
    # Summary
    if "segments" in output_data:
        print(f"   Segments: {len(output_data['segments'])}")
        print(f"   Speakers: {len(output_data['by_speaker'])}")
    else:
        print(f"   F0 mean: {output_data['f0']['mean']:.1f}Hz")
        print(f"   Intensity mean: {output_data['intensity']['mean']:.1f}dB")
    
    return output_data


def aggregate_by_speaker(segments: List[Dict]) -> Dict:
    """Aggregate prosody statistics by speaker."""
    import numpy as np
    
    by_speaker = {}
    
    for seg in segments:
        spk = seg.get("speaker", "UNKNOWN")
        if spk not in by_speaker:
            by_speaker[spk] = {
                "f0_means": [],
                "f0_stds": [],
                "intensity_means": [],
                "duration_total": 0,
                "segment_count": 0
            }
        
        by_speaker[spk]["f0_means"].append(seg["f0"]["mean"])
        by_speaker[spk]["f0_stds"].append(seg["f0"]["std"])
        by_speaker[spk]["intensity_means"].append(seg["intensity"]["mean"])
        by_speaker[spk]["duration_total"] += seg["duration"]["total_seconds"]
        by_speaker[spk]["segment_count"] += 1
    
    # Calculate aggregates
    result = {}
    for spk, data in by_speaker.items():
        f0_means = [x for x in data["f0_means"] if x > 0]
        f0_stds = [x for x in data["f0_stds"] if x > 0]
        int_means = [x for x in data["intensity_means"] if x > 0]
        
        result[spk] = {
            "f0": {
                "mean": float(np.mean(f0_means)) if f0_means else 0,
                "std": float(np.mean(f0_stds)) if f0_stds else 0,
                "variability": float(np.std(f0_means)) if len(f0_means) > 1 else 0
            },
            "intensity": {
                "mean": float(np.mean(int_means)) if int_means else 0,
                "variability": float(np.std(int_means)) if len(int_means) > 1 else 0
            },
            "duration_total": round(data["duration_total"], 2),
            "segment_count": data["segment_count"]
        }
    
    return result


def write_timeseries_csv(
    sound,
    csv_path: Path,
    f0_min: float,
    f0_max: float,
    time_step: float
):
    """Write F0 and intensity time-series to CSV."""
    from parselmouth.praat import call
    import numpy as np
    
    pitch = call(sound, "To Pitch", time_step, f0_min, f0_max)
    intensity = call(sound, "To Intensity", 100, time_step, "yes")
    
    f0_values = pitch.selected_array['frequency']
    f0_times = pitch.xs()
    
    int_values = intensity.values.flatten()
    int_times = intensity.xs()
    
    # Interpolate to common time axis
    max_len = max(len(f0_times), len(int_times))
    times = np.linspace(0, sound.get_total_duration(), max_len)
    
    with open(csv_path, 'w', encoding='utf-8') as f:
        f.write("time,f0,intensity\n")
        for i, t in enumerate(times):
            f0 = f0_values[min(i, len(f0_values)-1)] if i < len(f0_values) else 0
            intensity_val = int_values[min(i, len(int_values)-1)] if i < len(int_values) else 0
            f.write(f"{t:.4f},{f0:.2f},{intensity_val:.2f}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Extract prosody features from audio"
    )
    parser.add_argument("audio", help="Input audio file")
    parser.add_argument("-o", "--output", default="prosody.json",
                        help="Output path (default: prosody.json)")
    parser.add_argument("--segments", "-s",
                        help="Segments JSON for per-segment analysis")
    parser.add_argument("--f0-min", type=float, default=75.0,
                        help="Minimum F0 in Hz (default: 75, lower for male)")
    parser.add_argument("--f0-max", type=float, default=600.0,
                        help="Maximum F0 in Hz (default: 600, higher for female)")
    parser.add_argument("--time-step", type=float, default=0.01,
                        help="Analysis time step in seconds (default: 0.01)")
    parser.add_argument("--csv", action="store_true",
                        help="Also output CSV time-series")
    
    args = parser.parse_args()
    
    if not Path(args.audio).exists():
        print(f"Error: Audio file not found: {args.audio}")
        sys.exit(1)
    
    extract_prosody(
        audio_path=args.audio,
        output_path=args.output,
        segments_path=args.segments,
        f0_min=args.f0_min,
        f0_max=args.f0_max,
        time_step=args.time_step,
        csv_output=args.csv
    )


if __name__ == "__main__":
    main()
