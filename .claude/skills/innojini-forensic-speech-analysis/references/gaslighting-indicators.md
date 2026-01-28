# 가스라이팅 탐지 지표

## 개요

가스라이팅(Gaslighting)은 정서적 조작의 한 형태로, 가해자가 피해자의 현실 인식을 왜곡하여 자신감과 판단력을 약화시키는 행위입니다. 음성 포렌식에서는 음향적, 언어적, 상호작용적 지표를 통해 이를 탐지할 수 있습니다.

---

## 1. 음향 지표 (Acoustic Indicators)

### 1.1 가해자 음성 패턴

| 지표 | 설명 | 측정 방법 | 임계값 |
|------|------|----------|--------|
| **피치 전환** | 권위적 톤 ↔ 회유 톤 급전환 | F0 변화율 | >50 Hz/sec |
| **전략적 휴지** | 침묵으로 압박 후 발화 | pause duration | >3초 + 이후 발화 |
| **음량 조절** | 큰소리 → 부드러운 톤 | intensity 변화 | >10 dB 급변 |
| **속도 조절** | 빠르게 몰아붙이기 → 느리게 | speech rate 변동 | >30% 변화 |

### 탐지 코드

```python
def detect_pitch_switching(prosody_segments, speaker):
    """
    Detect rapid pitch transitions (authority ↔ soothing).
    
    가해자 전형 패턴: 높은 피치(권위) → 낮은 피치(회유) 반복
    """
    speaker_segs = [s for s in prosody_segments if s["speaker"] == speaker]
    
    if len(speaker_segs) < 2:
        return {"detected": False, "count": 0}
    
    switches = []
    for i in range(1, len(speaker_segs)):
        prev_f0 = speaker_segs[i-1]["f0"]["mean"]
        curr_f0 = speaker_segs[i]["f0"]["mean"]
        
        if prev_f0 == 0 or curr_f0 == 0:
            continue
        
        # 시간 간격
        time_gap = speaker_segs[i]["start"] - speaker_segs[i-1]["end"]
        
        # F0 변화율 (Hz/sec)
        f0_change = abs(curr_f0 - prev_f0)
        if time_gap > 0:
            f0_rate = f0_change / time_gap
        else:
            f0_rate = f0_change
        
        # 급격한 전환 탐지 (50 Hz/sec 이상)
        if f0_rate > 50:
            switches.append({
                "time": speaker_segs[i]["start"],
                "f0_change": f0_change,
                "f0_rate": f0_rate,
                "direction": "up" if curr_f0 > prev_f0 else "down"
            })
    
    return {
        "detected": len(switches) > 2,  # 3회 이상이면 패턴으로 간주
        "count": len(switches),
        "switches": switches,
        "score": min(1.0, len(switches) / 5)  # 5회를 최대로 정규화
    }


def detect_strategic_pauses(prosody_segments, speaker, min_pause=3.0):
    """
    Detect strategic pauses (silence pressure).
    
    전략적 휴지: 긴 침묵 후 즉각적인 발화 (압박 효과)
    """
    speaker_segs = [s for s in prosody_segments if s["speaker"] == speaker]
    
    strategic_pauses = []
    for i in range(1, len(speaker_segs)):
        pause_duration = speaker_segs[i]["start"] - speaker_segs[i-1]["end"]
        
        if pause_duration >= min_pause:
            # 휴지 후 발화의 특성 분석
            post_pause_f0 = speaker_segs[i]["f0"]["mean"]
            post_pause_int = speaker_segs[i]["intensity"]["mean"]
            
            strategic_pauses.append({
                "time": speaker_segs[i-1]["end"],
                "duration": pause_duration,
                "post_pause_f0": post_pause_f0,
                "post_pause_intensity": post_pause_int
            })
    
    return {
        "detected": len(strategic_pauses) > 1,
        "count": len(strategic_pauses),
        "pauses": strategic_pauses,
        "score": min(1.0, len(strategic_pauses) / 3)
    }


def detect_volume_manipulation(prosody_segments, speaker):
    """
    Detect volume manipulation (loud → soft pattern).
    
    음량 조절: 큰소리 → 부드러운 톤 (위협 후 회유)
    """
    speaker_segs = [s for s in prosody_segments if s["speaker"] == speaker]
    
    manipulations = []
    for i in range(1, len(speaker_segs)):
        prev_int = speaker_segs[i-1]["intensity"]["mean"]
        curr_int = speaker_segs[i]["intensity"]["mean"]
        
        int_change = curr_int - prev_int
        
        # 10dB 이상 급격한 감소 (큰소리 → 작은소리)
        if int_change < -10:
            manipulations.append({
                "time": speaker_segs[i]["start"],
                "intensity_drop": abs(int_change),
                "pattern": "loud_to_soft"
            })
        # 10dB 이상 급격한 증가 (작은소리 → 큰소리)
        elif int_change > 10:
            manipulations.append({
                "time": speaker_segs[i]["start"],
                "intensity_rise": int_change,
                "pattern": "soft_to_loud"
            })
    
    return {
        "detected": len(manipulations) > 2,
        "count": len(manipulations),
        "manipulations": manipulations,
        "score": min(1.0, len(manipulations) / 4)
    }
```

### 1.2 피해자 음성 변화 패턴 (시계열)

| 단계 | F0 | 발화량 | 특징 |
|------|-----|-------|------|
| 초기 | 정상 범위 | 정상 | 자신감 있는 억양 |
| 중기 | ↓ 10-20% | ↓ 30% | 주저함, 의문형 증가 |
| 후기 | ↓ 20-30% | ↓ 50%+ | 짧은 응답, 떨림 증가 |

```python
def analyze_victim_deterioration(prosody_segments, victim_speaker):
    """
    Analyze victim's voice deterioration over time.
    
    피해자 음성 악화 패턴 분석:
    - F0 점진적 감소
    - 발화량 감소
    - 떨림(jitter) 증가
    """
    victim_segs = [s for s in prosody_segments if s["speaker"] == victim_speaker]
    
    if len(victim_segs) < 5:
        return {"status": "insufficient_data", "score": 0}
    
    # 시간순 정렬
    victim_segs.sort(key=lambda x: x["start"])
    
    # 전반부 vs 후반부 비교
    mid = len(victim_segs) // 2
    early_segs = victim_segs[:mid]
    late_segs = victim_segs[mid:]
    
    # F0 변화
    early_f0 = np.mean([s["f0"]["mean"] for s in early_segs if s["f0"]["mean"] > 0])
    late_f0 = np.mean([s["f0"]["mean"] for s in late_segs if s["f0"]["mean"] > 0])
    f0_change = (late_f0 - early_f0) / early_f0 if early_f0 > 0 else 0
    
    # 발화량 변화
    early_dur = np.mean([s["end"] - s["start"] for s in early_segs])
    late_dur = np.mean([s["end"] - s["start"] for s in late_segs])
    dur_change = (late_dur - early_dur) / early_dur if early_dur > 0 else 0
    
    # 떨림(Jitter) 변화
    early_jitter = np.mean([s["voice_quality"]["jitter"] for s in early_segs 
                           if s["voice_quality"].get("jitter")])
    late_jitter = np.mean([s["voice_quality"]["jitter"] for s in late_segs 
                          if s["voice_quality"].get("jitter")])
    jitter_change = (late_jitter - early_jitter) / early_jitter if early_jitter > 0 else 0
    
    # 악화 점수 계산
    deterioration_score = 0
    indicators = []
    
    if f0_change < -0.1:  # F0 10% 이상 감소
        deterioration_score += 0.35
        indicators.append(f"F0 decreased by {abs(f0_change)*100:.1f}%")
    
    if dur_change < -0.2:  # 발화량 20% 이상 감소
        deterioration_score += 0.35
        indicators.append(f"Speech duration decreased by {abs(dur_change)*100:.1f}%")
    
    if jitter_change > 0.2:  # Jitter 20% 이상 증가
        deterioration_score += 0.3
        indicators.append(f"Voice tremor increased by {jitter_change*100:.1f}%")
    
    return {
        "detected": deterioration_score > 0.5,
        "score": min(1.0, deterioration_score),
        "f0_change_pct": f0_change * 100,
        "duration_change_pct": dur_change * 100,
        "jitter_change_pct": jitter_change * 100,
        "indicators": indicators,
        "stage": classify_deterioration_stage(f0_change, dur_change)
    }

def classify_deterioration_stage(f0_change, dur_change):
    """Classify deterioration stage."""
    if f0_change > -0.05 and dur_change > -0.1:
        return "early"
    elif f0_change > -0.15 and dur_change > -0.3:
        return "middle"
    else:
        return "late"
```

---

## 2. 언어 지표 (Linguistic Indicators)

### 2.1 부정/전가 표현

```python
DENIAL_PATTERNS = {
    "ko": [
        # 기억 왜곡
        "기억이 이상한 거 아니야",
        "그런 적 없어",
        "내가 언제 그랬어",
        "네가 착각하는 거야",
        "말도 안 돼",
        
        # 감정 전가
        "네가 예민한 거야",
        "네가 이상한 거야",
        "왜 그렇게 예민해",
        "너무 과민반응이야",
        "오버하지 마",
        
        # 책임 회피
        "네 탓이야",
        "네가 그렇게 만든 거야",
        "니가 시작한 거잖아",
        
        # 현실 부정
        "그건 사실이 아니야",
        "증거 있어?",
        "네 생각일 뿐이야"
    ],
    "en": [
        "you're too sensitive",
        "that never happened",
        "you're imagining things",
        "you're crazy",
        "you're overreacting"
    ]
}

def detect_denial_patterns(transcript, language="ko"):
    """
    Detect denial/gaslighting phrases in transcript.
    """
    patterns = DENIAL_PATTERNS.get(language, DENIAL_PATTERNS["ko"])
    
    found_patterns = []
    text = transcript.lower() if language == "en" else transcript
    
    for pattern in patterns:
        if pattern in text:
            found_patterns.append(pattern)
    
    return {
        "detected": len(found_patterns) > 0,
        "count": len(found_patterns),
        "patterns": found_patterns,
        "score": min(1.0, len(found_patterns) / 3)
    }
```

### 2.2 절대적 용어

```python
ABSOLUTE_TERMS = {
    "ko": ["항상", "절대", "매번", "언제나", "전혀", "절대로", "늘", "한 번도"],
    "en": ["always", "never", "every time", "constantly", "absolutely"]
}

def detect_absolute_terms(transcript, speaker_segments, speaker, language="ko"):
    """
    Detect absolute terms used by specific speaker.
    
    가해자가 절대적 용어를 자주 사용하면 조작 지표
    """
    terms = ABSOLUTE_TERMS.get(language, ABSOLUTE_TERMS["ko"])
    
    speaker_text = " ".join([
        seg.get("text", "") for seg in speaker_segments 
        if seg.get("speaker") == speaker
    ])
    
    found = []
    for term in terms:
        if term in speaker_text:
            count = speaker_text.count(term)
            found.append({"term": term, "count": count})
    
    total_count = sum(f["count"] for f in found)
    
    return {
        "detected": total_count > 3,
        "count": total_count,
        "terms": found,
        "score": min(1.0, total_count / 5)
    }
```

### 2.3 질문형 공격

```python
ATTACKING_QUESTIONS = {
    "ko": [
        "그게 말이 돼?",
        "제정신이야?",
        "왜 그래?",
        "뭐가 문제야?",
        "대체 왜 그러는 거야?",
        "니가 뭔데?",
        "무슨 자격으로?"
    ]
}

def detect_attacking_questions(transcript, language="ko"):
    """Detect rhetorical attacking questions."""
    patterns = ATTACKING_QUESTIONS.get(language, ATTACKING_QUESTIONS["ko"])
    
    found = [p for p in patterns if p in transcript]
    
    return {
        "detected": len(found) > 0,
        "count": len(found),
        "patterns": found,
        "score": min(1.0, len(found) / 2)
    }
```

---

## 3. 상호작용 지표 (Interaction Indicators)

### 3.1 발화 턴 비대칭

```python
def analyze_turn_asymmetry(diarization_segments):
    """
    Analyze turn-taking asymmetry between speakers.
    
    가스라이팅 패턴: 가해자가 발화량의 70% 이상 차지
    """
    speaker_durations = {}
    
    for seg in diarization_segments:
        spk = seg["speaker"]
        dur = seg["end"] - seg["start"]
        speaker_durations[spk] = speaker_durations.get(spk, 0) + dur
    
    total = sum(speaker_durations.values())
    if total == 0:
        return {"status": "no_speech"}
    
    ratios = {spk: dur/total for spk, dur in speaker_durations.items()}
    
    # 비대칭 감지 (한 화자가 70% 이상)
    max_ratio = max(ratios.values())
    dominant_speaker = max(ratios, key=ratios.get)
    
    return {
        "detected": max_ratio > 0.7,
        "ratios": ratios,
        "dominant_speaker": dominant_speaker,
        "dominance_ratio": max_ratio,
        "score": max(0, (max_ratio - 0.5) * 2)  # 0.5 이상부터 점수화
    }
```

### 3.2 끼어들기 분석

```python
def analyze_interruptions(diarization_segments):
    """
    Analyze interruption patterns.
    
    끼어들기: 한 화자 발화 중 다른 화자가 시작
    """
    # 시간순 정렬
    sorted_segs = sorted(diarization_segments, key=lambda x: x["start"])
    
    interruptions = {spk: 0 for spk in set(s["speaker"] for s in sorted_segs)}
    
    for i in range(1, len(sorted_segs)):
        prev = sorted_segs[i-1]
        curr = sorted_segs[i]
        
        # 다른 화자이고, 이전 발화가 끝나기 전에 시작
        if prev["speaker"] != curr["speaker"] and curr["start"] < prev["end"]:
            # 끼어든 화자 카운트
            interruptions[curr["speaker"]] += 1
    
    total_interruptions = sum(interruptions.values())
    
    return {
        "detected": total_interruptions > 3,
        "by_speaker": interruptions,
        "total": total_interruptions,
        "score": min(1.0, total_interruptions / 5)
    }
```

### 3.3 반응 지연 분석

```python
def analyze_response_delay(diarization_segments, victim_speaker):
    """
    Analyze victim's response delay patterns.
    
    피해자 반응 지연 증가: 망설임, 두려움 지표
    """
    sorted_segs = sorted(diarization_segments, key=lambda x: x["start"])
    
    victim_delays = []
    
    for i in range(1, len(sorted_segs)):
        prev = sorted_segs[i-1]
        curr = sorted_segs[i]
        
        # 피해자가 응답하는 경우
        if prev["speaker"] != victim_speaker and curr["speaker"] == victim_speaker:
            delay = curr["start"] - prev["end"]
            if delay > 0:
                victim_delays.append(delay)
    
    if len(victim_delays) < 2:
        return {"status": "insufficient_data"}
    
    # 전반부 vs 후반부 비교
    mid = len(victim_delays) // 2
    early_delay = np.mean(victim_delays[:mid])
    late_delay = np.mean(victim_delays[mid:])
    
    delay_increase = (late_delay - early_delay) / early_delay if early_delay > 0 else 0
    
    return {
        "detected": delay_increase > 0.5,  # 50% 이상 증가
        "early_avg_delay": early_delay,
        "late_avg_delay": late_delay,
        "increase_ratio": delay_increase,
        "score": min(1.0, max(0, delay_increase))
    }
```

---

## 4. 종합 탐지 알고리즘

```python
def detect_gaslighting(
    transcript: str,
    prosody_segments: list,
    diarization_segments: list,
    suspected_perpetrator: str = None,
    suspected_victim: str = None,
    language: str = "ko"
) -> dict:
    """
    Comprehensive gaslighting detection.
    
    Returns:
        - indicators: 각 지표별 결과
        - risk_score: 종합 위험 점수 (0-1)
        - confidence: 신뢰도
        - interpretation: 해석
    """
    # 화자 추론 (명시되지 않은 경우)
    if not suspected_perpetrator or not suspected_victim:
        turn_analysis = analyze_turn_asymmetry(diarization_segments)
        if turn_analysis.get("detected"):
            suspected_perpetrator = turn_analysis["dominant_speaker"]
            suspected_victim = [s for s in turn_analysis["ratios"] 
                              if s != suspected_perpetrator][0]
    
    # 1. 음향 지표
    acoustic = {
        "pitch_switching": detect_pitch_switching(prosody_segments, suspected_perpetrator),
        "strategic_pauses": detect_strategic_pauses(prosody_segments, suspected_perpetrator),
        "volume_manipulation": detect_volume_manipulation(prosody_segments, suspected_perpetrator),
        "victim_deterioration": analyze_victim_deterioration(prosody_segments, suspected_victim)
    }
    
    # 2. 언어 지표
    linguistic = {
        "denial_patterns": detect_denial_patterns(transcript, language),
        "absolute_terms": detect_absolute_terms(transcript, prosody_segments, 
                                                suspected_perpetrator, language),
        "attacking_questions": detect_attacking_questions(transcript, language)
    }
    
    # 3. 상호작용 지표
    interaction = {
        "turn_asymmetry": analyze_turn_asymmetry(diarization_segments),
        "interruptions": analyze_interruptions(diarization_segments),
        "response_delay": analyze_response_delay(diarization_segments, suspected_victim)
    }
    
    # 종합 점수 계산
    acoustic_score = np.mean([v.get("score", 0) for v in acoustic.values()])
    linguistic_score = np.mean([v.get("score", 0) for v in linguistic.values()])
    interaction_score = np.mean([v.get("score", 0) for v in interaction.values()])
    
    # 가중 평균 (음향 40%, 언어 35%, 상호작용 25%)
    risk_score = (
        acoustic_score * 0.4 +
        linguistic_score * 0.35 +
        interaction_score * 0.25
    )
    
    # 신뢰도 (탐지된 지표 수 기반)
    detected_count = sum([
        1 for cat in [acoustic, linguistic, interaction]
        for v in cat.values() if v.get("detected")
    ])
    confidence = "high" if detected_count >= 5 else "medium" if detected_count >= 3 else "low"
    
    # 해석
    if risk_score >= 0.7:
        interpretation = "High risk of gaslighting patterns detected"
    elif risk_score >= 0.4:
        interpretation = "Moderate indicators of manipulative communication"
    else:
        interpretation = "Low indication of gaslighting patterns"
    
    return {
        "indicators": {
            "acoustic": acoustic,
            "linguistic": linguistic,
            "interaction": interaction
        },
        "scores": {
            "acoustic": round(acoustic_score, 3),
            "linguistic": round(linguistic_score, 3),
            "interaction": round(interaction_score, 3)
        },
        "risk_score": round(risk_score, 3),
        "confidence": confidence,
        "interpretation": interpretation,
        "detected_indicators": detected_count,
        "speakers": {
            "suspected_perpetrator": suspected_perpetrator,
            "suspected_victim": suspected_victim
        }
    }
```

---

## 5. 주의사항 및 제한점

### 법적 고려사항
- 음성 분석 결과는 **보조 증거**로만 활용
- 최종 판단은 **전문가 해석** 필요
- **확률적 성격** 명시 필수

### 기술적 제한
- 녹음 품질에 따른 정확도 변동
- 화자별 baseline 필요 (개인차 존재)
- 연기/의도적 조작 가능성

### 윤리적 고려
- 오탐(false positive)의 심각한 결과 인식
- 피해자 2차 피해 방지
- 개인정보 보호
