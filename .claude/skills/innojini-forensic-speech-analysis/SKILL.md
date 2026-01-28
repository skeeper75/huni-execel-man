---
name: forensic-speech-analysis
description: |
  Forensic speech analysis skill for legal proceedings, criminal investigations, and psychological abuse detection. Core capabilities: (1) Long audio transcription with OOM-safe chunking for 70+ minute files on DGX Spark, (2) Speaker diarization and identification, (3) Prosody analysis (F0/pitch, intensity, duration, speech rate), (4) Emotion recognition with Korean emotional speech patterns, (5) Gaslighting/manipulation pattern detection through acoustic and linguistic indicators, (6) Legal evidence report generation meeting Daubert/Korean court standards.
  
  Triggers: "음성 전사", "녹음 분석", "화자 분리", "speaker diarization", "포렌식", "forensic speech", "가스라이팅 탐지", "gaslighting detection", "manipulation detection", "감정 분석", "emotion recognition", "prosody", "F0 분석", "피치 분석", "법정 보고서", "증거 보고서", "시계열 분석", "DGX Spark", "OOM", "긴 녹음", "한국어 음성", "통화 녹음", "arousal", "valence", "KESDy18"
  
  Hardware optimized: NVIDIA DGX Spark (128GB unified memory). Languages: Korean (primary), English (secondary).
---

# Forensic Speech Analysis

## Quick Reference

### OOM Prevention (70+ min files)

```python
CONFIG = {
    "chunk_length_s": 30,      # Whisper optimal
    "stride_length_s": 5,      # chunk/6 overlap
    "batch_size": 16,          # DGX Spark safe
    "compute_type": "float16", # Memory efficient
    "vad_filter": True,        # Remove silence
    "language": "ko"           # Korean
}
```

### Model Selection

| Task | Model | Memory |
|------|-------|--------|
| Korean ASR | whisper-large-v3 / whisper-large-v3-turbo-ko | ~6GB |
| Diarization | pyannote/speaker-diarization-3.1 | ~4GB |
| Alignment | whisperx align (ko) | ~2GB |
| Prosody | parselmouth (Praat) | <1GB |

### Core Commands

```bash
# Long file transcription
python scripts/transcribe_chunked.py input.wav -o result.json

# Speaker diarization
python scripts/diarize_speakers.py input.wav -o speakers.json

# Prosody extraction
python scripts/extract_prosody.py input.wav -o prosody.json
```

---

## Workflows

### Workflow 1: Long Audio Transcription

**Trigger**: "70분 녹음 전사", "긴 파일", "OOM 방지"

```
1. Load audio → Resample to 16kHz
2. VAD preprocessing → Remove silence
3. Chunk into 30s segments (5s overlap)
4. Batch transcribe (batch_size=16)
5. Merge chunk boundaries
6. Output JSON/TXT/SRT
```

**Script**: `python scripts/transcribe_chunked.py input.wav -o output.json`

For DGX Spark optimization: See [references/dgx-optimization.md](references/dgx-optimization.md)

---

### Workflow 2: Speaker Diarization

**Trigger**: "화자 분리", "화자 구분", "speaker diarization"

```
1. Load pyannote model (requires HF_TOKEN)
2. Run diarization
3. Extract RTTM segments
4. Combine with transcription
5. Generate speaker statistics
```

**Script**: `python scripts/diarize_speakers.py input.wav -o speakers.json`

**Requirements**: `export HF_TOKEN="your_token"` (pyannote license agreement)

---

### Workflow 3: Prosody Extraction

**Trigger**: "prosody 분석", "F0 추출", "피치 분석", "운율"

```
1. Load audio with parselmouth
2. Extract Pitch object (75-600 Hz)
3. Calculate F0: mean, std, min, max, range
4. Calculate Intensity: mean, std
5. Calculate Duration: total, voiced_ratio
6. Estimate speech rate
```

**Script**: `python scripts/extract_prosody.py input.wav -o prosody.json`

For emotion-prosody mapping: See [references/prosody-patterns.md](references/prosody-patterns.md)

---

### Workflow 4: Emotion Analysis

**Trigger**: "감정 분석", "emotion recognition", "감정 변화"

```
1. Extract prosody per segment
2. Apply emotion mapping (KESDy18 patterns)
3. Assign labels: 기쁨/분노/슬픔/공포/중립
4. Calculate arousal/valence
5. Generate timeline visualization
```

**Korean emotion patterns**:

| Emotion | F0 | Intensity | Duration |
|---------|-----|-----------|----------|
| 중립 | baseline | baseline | baseline |
| 분노 | ↑↑ high, var↑ | ↑ strong | ↓ fast |
| 슬픔 | ↓ low, var↓ | ↓ weak | ↑ slow |
| 공포 | ↑ high, irregular | mid | fast |

For detailed patterns: See [references/prosody-patterns.md](references/prosody-patterns.md)

---

### Workflow 5: Gaslighting Pattern Detection

**Trigger**: "가스라이팅", "조작 패턴", "manipulation", "정서적 학대"

```
1. Acoustic indicators
   - Rapid pitch switching (authority ↔ soothing)
   - Strategic pauses (silence pressure)
   - Volume manipulation
   
2. Linguistic patterns
   - Denial phrases: "네가 예민한 거야", "내가 언제"
   - Absolute terms: "항상", "절대", "매번"
   - Questioning attacks: "그게 말이 돼?"
   
3. Interaction patterns
   - Turn asymmetry (perpetrator dominance)
   - Interruption frequency
   - Response delay analysis
   
4. Temporal deterioration
   - Victim voice changes over time
   - Escalating control patterns
```

For detection criteria: See [references/gaslighting-indicators.md](references/gaslighting-indicators.md)

---

### Workflow 6: Legal Evidence Report

**Trigger**: "법정 보고서", "증거 보고서", "forensic report"

```
1. Collect all analysis results
2. Load template (assets/report_template.md)
3. Write sections:
   - Executive Summary
   - Methodology (models, parameters, versions)
   - Analysis Results
   - Pattern Findings
   - Limitations & Disclaimers
4. Export DOCX/PDF
```

For legal requirements: See [references/legal-evidence.md](references/legal-evidence.md)

**Template**: See [assets/report_template.md](assets/report_template.md)

---

## Reference Documents

| Document | Content | When to Load |
|----------|---------|--------------|
| [korean-resources.md](references/korean-resources.md) | Korean datasets, models, access methods | Korean ASR tasks |
| [prosody-patterns.md](references/prosody-patterns.md) | Emotion-prosody mapping, extraction code | Emotion analysis |
| [gaslighting-indicators.md](references/gaslighting-indicators.md) | Detection criteria, thresholds | Manipulation detection |
| [legal-evidence.md](references/legal-evidence.md) | Daubert standards, report format | Report generation |
| [dgx-optimization.md](references/dgx-optimization.md) | DGX Spark memory optimization | OOM issues |

---

## Scripts

| Script | Purpose | Key Parameters |
|--------|---------|----------------|
| `transcribe_chunked.py` | OOM-safe transcription | `--batch-size`, `--model`, `--language` |
| `diarize_speakers.py` | Speaker separation | `--min-speakers`, `--max-speakers` |
| `extract_prosody.py` | F0, intensity extraction | `--segments`, `--f0-min`, `--f0-max` |

---

## Dependencies

```bash
# Core ASR
pip install faster-whisper whisperx transformers torch

# Speaker diarization (requires HF token)
pip install pyannote-audio

# Prosody analysis
pip install parselmouth librosa

# Utilities
pip install pandas numpy tqdm soundfile

# Report generation
pip install python-docx markdown
```

### HuggingFace Token Setup

```bash
# Required for pyannote-audio
export HF_TOKEN="your_huggingface_token"

# Accept model licenses at:
# - https://huggingface.co/pyannote/speaker-diarization-3.1
# - https://huggingface.co/pyannote/segmentation-3.0
```

---

## Output Formats

### Transcription JSON

```json
{
  "segments": [
    {"start": 0.0, "end": 2.5, "text": "안녕하세요", "speaker": "SPEAKER_00"}
  ],
  "language": "ko"
}
```

### Prosody JSON

```json
{
  "f0": {"mean": 150.2, "std": 25.3, "range": 120.5},
  "intensity": {"mean": 65.2, "std": 8.1},
  "duration": {"total_seconds": 30.0, "voiced_ratio": 0.75}
}
```

### Gaslighting Report JSON

```json
{
  "indicators": {
    "pitch_switching": 0.7,
    "strategic_pauses": 0.5,
    "denial_phrases": ["네가 예민한 거야", "내가 언제"],
    "victim_deterioration": 0.8
  },
  "risk_score": 0.65,
  "confidence": "medium"
}
```
