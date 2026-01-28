# 감정별 Prosody 패턴

## Prosody 특징 정의

| 특징 | 정의 | 단위 | 추출 방법 |
|------|------|------|----------|
| F0 (기본 주파수) | 성대 진동 주파수 | Hz | Praat pitch analysis |
| Intensity | 음성 강도/음량 | dB | Praat intensity analysis |
| Duration | 발화 지속 시간 | seconds | Segment boundaries |
| Speech Rate | 발화 속도 | syllables/sec | Duration / syllable count |
| Voiced Ratio | 유성음 비율 | 0-1 | Voiced frames / total |
| Jitter | 피치 불규칙성 | % | Cycle-to-cycle F0 variation |
| Shimmer | 진폭 불규칙성 | % | Cycle-to-cycle amplitude variation |

---

## 추출 코드 (parselmouth)

### 기본 추출

```python
import parselmouth
from parselmouth.praat import call
import numpy as np

def extract_prosody_features(audio_path, f0_min=75, f0_max=600):
    """
    Extract comprehensive prosody features.
    
    Args:
        audio_path: Path to audio file
        f0_min: Minimum F0 (75 for male, 100 for female)
        f0_max: Maximum F0 (300 for male, 600 for female)
    """
    sound = parselmouth.Sound(audio_path)
    
    # F0 (Pitch)
    pitch = call(sound, "To Pitch", 0.0, f0_min, f0_max)
    f0_values = pitch.selected_array['frequency']
    f0_voiced = f0_values[f0_values > 0]
    
    f0_features = {
        "mean": np.mean(f0_voiced) if len(f0_voiced) > 0 else 0,
        "std": np.std(f0_voiced) if len(f0_voiced) > 0 else 0,
        "min": np.min(f0_voiced) if len(f0_voiced) > 0 else 0,
        "max": np.max(f0_voiced) if len(f0_voiced) > 0 else 0,
        "range": np.ptp(f0_voiced) if len(f0_voiced) > 0 else 0,
        "slope": calculate_f0_slope(f0_voiced)  # 억양 기울기
    }
    
    # Intensity
    intensity = call(sound, "To Intensity", 100, 0.0)
    int_mean = call(intensity, "Get mean", 0, 0, "energy")
    int_std = call(intensity, "Get standard deviation", 0, 0)
    
    intensity_features = {
        "mean": int_mean,
        "std": int_std
    }
    
    # Voice Quality (Jitter/Shimmer)
    point_process = call(sound, "To PointProcess (periodic, cc)", f0_min, f0_max)
    
    jitter = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
    shimmer = call([sound, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    
    voice_quality = {
        "jitter": jitter if not np.isnan(jitter) else 0,
        "shimmer": shimmer if not np.isnan(shimmer) else 0
    }
    
    # Duration
    duration = sound.get_total_duration()
    voiced_ratio = len(f0_voiced) / len(f0_values) if len(f0_values) > 0 else 0
    
    return {
        "f0": f0_features,
        "intensity": intensity_features,
        "voice_quality": voice_quality,
        "duration": duration,
        "voiced_ratio": voiced_ratio
    }

def calculate_f0_slope(f0_values):
    """Calculate F0 slope (intonation direction)."""
    if len(f0_values) < 2:
        return 0
    x = np.arange(len(f0_values))
    slope, _ = np.polyfit(x, f0_values, 1)
    return float(slope)
```

### 세그먼트별 추출

```python
def extract_segment_prosody(audio_path, segments, f0_min=75, f0_max=600):
    """
    Extract prosody for each segment.
    
    Args:
        segments: List of {"start": float, "end": float, "speaker": str}
    """
    sound = parselmouth.Sound(audio_path)
    results = []
    
    for seg in segments:
        start, end = seg["start"], seg["end"]
        segment_sound = sound.extract_part(start, end)
        
        features = extract_prosody_features_from_sound(segment_sound, f0_min, f0_max)
        features["start"] = start
        features["end"] = end
        features["speaker"] = seg.get("speaker", "UNKNOWN")
        
        results.append(features)
    
    return results
```

---

## 감정별 Prosody 패턴

### 한국어 감정 음성 특징

| 감정 | F0 Mean | F0 Std | Intensity | Duration | Speech Rate |
|------|---------|--------|-----------|----------|-------------|
| 중립 | baseline | baseline | baseline | baseline | baseline |
| 분노 | ↑ 20-40% | ↑ 50%+ | ↑ 5-10dB | ↓ 빠름 | ↑ 빠름 |
| 슬픔 | ↓ 10-20% | ↓ 30% | ↓ 3-5dB | ↑ 느림 | ↓ 느림 |
| 공포 | ↑ 15-30% | ↑ 불규칙 | 중간 | 빠름 | ↑ 빠르고 불규칙 |
| 기쁨/행복 | ↑ 20-35% | ↑ 40% | ↑ 3-5dB | 중간 | ↑ 빠름 |
| 놀람 | ↑↑ 급상승 | ↑ 크게 | ↑ 급상승 | 짧음 | 불규칙 |

### 성별 기준값

| 성별 | F0 Mean (중립) | F0 Range | 권장 f0_min | 권장 f0_max |
|------|---------------|----------|-------------|-------------|
| 남성 | 100-150 Hz | 80-200 Hz | 75 Hz | 300 Hz |
| 여성 | 180-250 Hz | 150-350 Hz | 100 Hz | 500 Hz |
| 아동 | 250-350 Hz | 200-450 Hz | 150 Hz | 600 Hz |

---

## 감정 분류 알고리즘

### 규칙 기반 분류

```python
def classify_emotion_rule_based(prosody):
    """
    Rule-based emotion classification from prosody.
    
    Returns: {"emotion": str, "confidence": float, "features": dict}
    """
    f0_mean = prosody["f0"]["mean"]
    f0_std = prosody["f0"]["std"]
    f0_range = prosody["f0"]["range"]
    intensity = prosody["intensity"]["mean"]
    
    # 기준값 설정 (화자 baseline 필요)
    # 여기서는 일반적인 한국어 성인 기준 사용
    baseline_f0 = 150  # Hz (남녀 평균)
    baseline_int = 65  # dB
    
    # 특징 정규화
    f0_ratio = f0_mean / baseline_f0
    int_ratio = intensity / baseline_int
    f0_var_ratio = f0_std / (f0_mean + 1)  # 변이 계수
    
    scores = {
        "neutral": 0,
        "anger": 0,
        "sadness": 0,
        "fear": 0,
        "happiness": 0
    }
    
    # 분노: 높은 F0, 높은 변이, 높은 강도
    if f0_ratio > 1.2 and f0_var_ratio > 0.15 and int_ratio > 1.05:
        scores["anger"] = 0.7 + min(0.3, (f0_ratio - 1.2) * 0.5)
    
    # 슬픔: 낮은 F0, 낮은 변이, 낮은 강도
    if f0_ratio < 0.9 and f0_var_ratio < 0.1 and int_ratio < 0.95:
        scores["sadness"] = 0.6 + min(0.3, (0.9 - f0_ratio) * 0.5)
    
    # 공포: 높은 F0, 불규칙한 변이
    if f0_ratio > 1.15 and f0_var_ratio > 0.2:
        scores["fear"] = 0.5 + min(0.3, f0_var_ratio * 0.5)
    
    # 기쁨: 높은 F0, 높은 변이, 중간 강도
    if f0_ratio > 1.2 and f0_var_ratio > 0.12:
        scores["happiness"] = 0.5 + min(0.3, (f0_ratio - 1.2) * 0.4)
    
    # 중립: 기준 근처
    if 0.9 <= f0_ratio <= 1.1 and f0_var_ratio < 0.15:
        scores["neutral"] = 0.6
    
    # 최고 점수 감정 선택
    emotion = max(scores, key=scores.get)
    confidence = scores[emotion]
    
    return {
        "emotion": emotion,
        "confidence": confidence,
        "scores": scores,
        "features": {
            "f0_ratio": f0_ratio,
            "int_ratio": int_ratio,
            "f0_var_ratio": f0_var_ratio
        }
    }
```

### Arousal/Valence 계산

```python
def calculate_arousal_valence(prosody):
    """
    Calculate arousal (activation) and valence (pleasantness).
    
    Arousal: 1 (calm) - 5 (excited)
    Valence: 1 (negative) - 5 (positive)
    """
    f0_mean = prosody["f0"]["mean"]
    f0_std = prosody["f0"]["std"]
    f0_range = prosody["f0"]["range"]
    intensity = prosody["intensity"]["mean"]
    speech_rate = prosody.get("speech_rate", 4.0)  # syllables/sec
    
    # Arousal: F0, intensity, speech rate 기반
    # 높을수록 활성화 상태
    arousal_features = [
        min(1, f0_mean / 200),           # F0 정규화
        min(1, f0_std / 50),              # F0 변이
        min(1, intensity / 80),           # 강도
        min(1, speech_rate / 6)           # 발화 속도
    ]
    arousal = 1 + 4 * np.mean(arousal_features)
    
    # Valence: F0 contour, intensity variation 기반
    # (긍정 감정은 상승 억양, 부정은 하강)
    f0_slope = prosody["f0"].get("slope", 0)
    
    valence_features = [
        0.5 + min(0.5, f0_slope / 10),   # 상승 억양 = 긍정
        min(1, f0_range / 100) * 0.3     # 넓은 범위 = 긍정적 경향
    ]
    valence = 1 + 4 * np.mean(valence_features)
    
    return {
        "arousal": round(arousal, 2),  # 1-5
        "valence": round(valence, 2)   # 1-5
    }
```

---

## 시계열 분석

### 화자별 시간 추이

```python
def analyze_temporal_trend(segments_prosody, speaker):
    """
    Analyze prosody changes over time for a specific speaker.
    
    Returns trend indicators for gaslighting detection.
    """
    # 특정 화자 세그먼트만 추출
    speaker_segs = [s for s in segments_prosody if s["speaker"] == speaker]
    
    if len(speaker_segs) < 3:
        return {"status": "insufficient_data"}
    
    # 시간순 정렬
    speaker_segs.sort(key=lambda x: x["start"])
    
    # F0 추이
    f0_means = [s["f0"]["mean"] for s in speaker_segs if s["f0"]["mean"] > 0]
    f0_trend = calculate_trend(f0_means)
    
    # Intensity 추이
    int_means = [s["intensity"]["mean"] for s in speaker_segs]
    int_trend = calculate_trend(int_means)
    
    # 발화량 추이
    durations = [s["end"] - s["start"] for s in speaker_segs]
    dur_trend = calculate_trend(durations)
    
    return {
        "f0_trend": f0_trend,       # -1: 감소, 0: 유지, 1: 증가
        "intensity_trend": int_trend,
        "duration_trend": dur_trend,
        "segment_count": len(speaker_segs),
        "interpretation": interpret_victim_pattern(f0_trend, int_trend, dur_trend)
    }

def calculate_trend(values):
    """Calculate linear trend of values."""
    if len(values) < 2:
        return 0
    x = np.arange(len(values))
    slope, _ = np.polyfit(x, values, 1)
    
    # 정규화된 기울기
    mean_val = np.mean(values)
    if mean_val == 0:
        return 0
    normalized_slope = slope / mean_val
    
    if normalized_slope < -0.05:
        return -1  # 감소
    elif normalized_slope > 0.05:
        return 1   # 증가
    else:
        return 0   # 유지

def interpret_victim_pattern(f0_trend, int_trend, dur_trend):
    """
    Interpret prosody trends for potential victim pattern.
    
    가스라이팅 피해자 전형적 패턴:
    - F0 감소 (자신감 저하)
    - Intensity 감소 (목소리 작아짐)
    - Duration 감소 (발화량 감소)
    """
    victim_indicators = 0
    
    if f0_trend == -1:
        victim_indicators += 1
    if int_trend == -1:
        victim_indicators += 1
    if dur_trend == -1:
        victim_indicators += 1
    
    if victim_indicators >= 2:
        return "potential_victim_deterioration"
    elif victim_indicators == 1:
        return "mild_change"
    else:
        return "stable"
```

---

## 한국어 특이사항

### 경음화와 감정
- 분노 시 경음화 증가: /ㄱ/→/ㄲ/, /ㄷ/→/ㄸ/
- 강조 시 발음 명확화

### 휴지(Pause) 패턴
- 슬픔: 문장 간 휴지 증가 (>500ms)
- 분노: 휴지 감소, 빠른 발화
- 공포: 불규칙한 휴지

### 억양 패턴
- 의문형 종결어미: 상승 억양 (↗)
- 평서형 종결어미: 하강 억양 (↘)
- 감탄형: 급격한 상승 후 하강 (↗↘)
