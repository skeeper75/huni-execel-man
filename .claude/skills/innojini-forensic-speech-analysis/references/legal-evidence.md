# 법적 증거 요건 가이드

## 증거능력 기준

### Daubert 기준 (미국 연방법원)

1. **검증 가능성 (Testability)**
   - 방법론이 테스트되었거나 테스트 가능한가?
   - 가설이 반증 가능한가?

2. **동료 심사 (Peer Review)**
   - 학술지에 발표되었는가?
   - 동료 심사를 거쳤는가?

3. **알려진 오류율 (Error Rate)**
   - 오류율이 알려져 있는가?
   - 오류율이 수용 가능한 수준인가?

4. **일반적 수용 (General Acceptance)**
   - 관련 과학계에서 수용되는가?

### Frye 기준 (일부 주 법원)
- "일반적 수용" 단일 기준
- 관련 분야에서 일반적으로 수용되는 방법론인가?

### 한국 증거법 원칙

1. **관련성 (Relevance)**
   - 요증사실과 관련 있어야 함

2. **신빙성 (Reliability)**
   - 과학적으로 신뢰할 수 있는 방법론
   - 검증된 절차에 따른 분석

3. **전문성 (Expertise)**
   - 분석자의 자격 및 경험
   - 해당 분야 전문 지식

4. **재현 가능성 (Reproducibility)**
   - 동일 조건에서 동일 결과 도출
   - 분석 절차의 명확한 문서화

---

## 보고서 구조

### 필수 섹션

```markdown
# 음성 포렌식 분석 보고서

## 1. 요약 (Executive Summary)
- 분석 대상 요약
- 주요 발견사항 (3-5개 핵심 포인트)
- 결론 및 의견

## 2. 분석 대상
### 2.1 음성 파일 정보
| 파일명 | 해시값 (SHA-256) | 길이 | 녹음 일시 |
|--------|-----------------|------|----------|
| file1.wav | abc123... | 70:32 | 2024-01-15 |

### 2.2 녹음 환경
- 녹음 장치: (알려진 경우)
- 녹음 환경: 실내/실외, 배경 소음
- 샘플레이트: 16kHz / 44.1kHz

### 2.3 화자 정보
| 화자 ID | 역할 | 식별 방법 |
|---------|------|----------|
| SPEAKER_00 | 가해자 추정 | 발화 내용 기반 |
| SPEAKER_01 | 피해자 추정 | 발화 내용 기반 |

## 3. 분석 방법론
### 3.1 사용 도구 및 버전
| 도구 | 버전 | 용도 |
|------|------|------|
| whisperx | 3.x.x | 음성 전사 |
| pyannote-audio | 3.1 | 화자 분리 |
| parselmouth | 0.4.x | Prosody 추출 |

### 3.2 분석 파라미터
- Whisper 모델: large-v3
- 청킹: 30초, 5초 오버랩
- F0 범위: 75-600 Hz
- 배치 크기: 16

### 3.3 분석 절차
1. 음성 전사 (Transcription)
2. 화자 분리 (Diarization)
3. Prosody 특징 추출
4. 감정 분석
5. 패턴 탐지

## 4. 분석 결과
### 4.1 전사 결과
[별첨 A 참조]

### 4.2 화자 분리 통계
| 화자 | 총 발화 시간 | 발화 비율 | 세그먼트 수 |
|------|------------|----------|-----------|

### 4.3 Prosody 분석
#### 화자별 음성 특성
| 화자 | F0 평균 | F0 표준편차 | 강도 평균 |
|------|--------|-----------|----------|

#### 시계열 변화
[그래프 포함]

### 4.4 감정 분석
| 시간 구간 | 화자 | 주요 감정 | 각성도 | 긍/부정도 |
|----------|------|----------|--------|---------|

### 4.5 패턴 탐지 결과
#### 탐지된 지표
| 지표 유형 | 탐지 여부 | 점수 | 세부 내용 |
|----------|----------|------|----------|

## 5. 해석 및 논의
### 5.1 발견된 패턴
- [구체적 패턴 설명]

### 5.2 시계열 변화 해석
- [시간에 따른 변화 해석]

### 5.3 종합 평가
- [전체적인 분석 의견]

## 6. 제한점 및 면책
### 6.1 방법론적 제한
- AI 기반 분석의 확률적 성격
- 모델 학습 데이터의 편향 가능성
- 녹음 품질에 따른 정확도 변동

### 6.2 해석상 제한
- 음성 특성만으로 의도 판단 불가
- 개인별 baseline 차이 존재
- 문화적 맥락 고려 필요

### 6.3 면책 조항
본 분석 결과는 과학적 방법론에 기반한 
객관적 분석 결과이나, 법적 판단의 
유일한 근거로 사용될 수 없습니다.
최종 판단은 법률 전문가 및 
법원의 종합적 심리에 따라야 합니다.

## 7. 결론
[최종 의견 및 권고사항]

## 부록
### 부록 A: 전체 전사 텍스트
### 부록 B: Prosody 시계열 데이터
### 부록 C: 분석 스크립트 및 로그
```

---

## 보고서 작성 가이드라인

### 표현 원칙

#### 확률적 표현 사용
```
❌ "가스라이팅이 발생했다"
✅ "가스라이팅으로 해석될 수 있는 패턴이 관찰되었다"

❌ "피해자는 위축되었다"  
✅ "피해자 음성에서 F0 감소 추세가 관찰되며, 이는 위축 상태와 관련될 수 있다"
```

#### 객관적 기술
```
❌ "명백히", "확실히", "분명히"
✅ "분석 결과에 따르면", "데이터가 시사하는 바", "~가능성이 있다"
```

#### 제한점 명시
```
- 항상 분석의 한계를 명시
- 대안적 해석 가능성 언급
- 추가 분석 필요성 제시
```

### 시각화 포함

#### 필수 시각화
1. **F0 시계열 그래프**: 화자별 피치 변화
2. **발화량 차트**: 화자별 발화 비율
3. **감정 타임라인**: 시간에 따른 감정 변화

#### 시각화 코드 예시

```python
import matplotlib.pyplot as plt
import numpy as np

def create_f0_timeline(prosody_segments, output_path):
    """Create F0 timeline visualization for report."""
    
    fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
    
    speakers = list(set(s["speaker"] for s in prosody_segments))
    colors = plt.cm.Set1(np.linspace(0, 1, len(speakers)))
    
    for i, speaker in enumerate(speakers):
        segs = [s for s in prosody_segments if s["speaker"] == speaker]
        times = [(s["start"] + s["end"]) / 2 for s in segs]
        f0_means = [s["f0"]["mean"] for s in segs]
        int_means = [s["intensity"]["mean"] for s in segs]
        
        axes[0].scatter(times, f0_means, c=[colors[i]], label=speaker, alpha=0.7)
        axes[0].plot(times, f0_means, c=colors[i], alpha=0.3)
        
        axes[1].scatter(times, int_means, c=[colors[i]], label=speaker, alpha=0.7)
        axes[1].plot(times, int_means, c=colors[i], alpha=0.3)
    
    axes[0].set_ylabel("F0 (Hz)")
    axes[0].set_title("Pitch (F0) Over Time")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    axes[1].set_ylabel("Intensity (dB)")
    axes[1].set_xlabel("Time (seconds)")
    axes[1].set_title("Intensity Over Time")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return output_path
```

---

## 전문가 증언 준비

### 증언 체크리스트

```markdown
□ 자격 및 경험 문서화
  - 학위, 자격증
  - 관련 경력 연수
  - 이전 법정 증언 경험

□ 방법론 설명 준비
  - 일반인도 이해할 수 있는 설명
  - 시각 자료 준비

□ 반대 심문 대비
  - 방법론 한계 인정 준비
  - 대안적 해석 가능성 인지
  - 오류율 데이터 준비

□ 증거 연관성 설명
  - 분석 결과가 사건과 어떻게 관련되는지
  - 법적 요증사실과의 연결
```

### 예상 질문 및 답변

```
Q: 이 분석 방법의 오류율은 얼마입니까?
A: 음성 전사의 경우 한국어 Character Error Rate(CER)이 
   약 X%로 알려져 있습니다. 화자 분리의 Diarization 
   Error Rate(DER)은 약 Y%입니다. 다만, 이는 평균값이며 
   녹음 품질에 따라 변동됩니다.

Q: 이 결과가 확실히 가스라이팅이라고 말할 수 있습니까?
A: 아닙니다. 본 분석은 가스라이팅과 관련된 것으로 
   알려진 음성적 패턴의 존재 여부를 객관적으로 분석한 
   것입니다. 최종 판단은 법원의 종합적 심리에 따라야 합니다.

Q: 다른 해석 가능성은 없습니까?
A: 있습니다. 예를 들어, 피해자 음성의 F0 감소는 
   단순 피로나 건강 상태 변화로도 설명될 수 있습니다.
   이러한 대안적 가능성도 보고서에 명시하였습니다.
```

---

## 증거 보존

### 원본 보존 원칙

```python
import hashlib

def calculate_file_hash(file_path):
    """Calculate SHA-256 hash of file for integrity verification."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def document_evidence(file_path, output_json):
    """Document evidence file metadata."""
    import os
    from datetime import datetime
    
    metadata = {
        "file_path": str(file_path),
        "file_name": os.path.basename(file_path),
        "file_size_bytes": os.path.getsize(file_path),
        "sha256_hash": calculate_file_hash(file_path),
        "documented_at": datetime.now().isoformat(),
        "documented_by": "forensic_analysis_system"
    }
    
    with open(output_json, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return metadata
```

### Chain of Custody

```markdown
## 증거 관리 기록

| 일시 | 담당자 | 행위 | 비고 |
|------|-------|------|------|
| 2024-01-15 10:00 | 홍길동 | 파일 수령 | 원본 USB 수령 |
| 2024-01-15 10:30 | 홍길동 | 해시값 기록 | SHA-256: abc123... |
| 2024-01-15 11:00 | 홍길동 | 분석용 복사본 생성 | 원본 별도 보관 |
| 2024-01-16 09:00 | 김철수 | 분석 시작 | - |
| 2024-01-17 18:00 | 김철수 | 분석 완료 | 결과 파일 생성 |
```

---

## 국과수 연계 참고

### 공식 감정 의뢰 절차

1. **의뢰 기관**: 검찰, 경찰, 법원 등
2. **의뢰 방법**: 공문 발송
3. **소요 시간**: 감정 유형에 따라 상이
4. **연락처**: 033-902-5000

### 디지털 증거 관련 부서
- **디지털과**: 영상, 오디오, 디지털포렌식
- **위치**: 강원특별자치도 원주시 입춘로 10

---

## 윤리적 고려사항

### 분석자 윤리

1. **객관성 유지**: 의뢰인 편향 없이 객관적 분석
2. **한계 인정**: 분석의 한계를 솔직하게 인정
3. **과장 금지**: 결과를 과장하거나 축소하지 않음
4. **기밀 유지**: 분석 대상 정보의 철저한 보안

### 피해자 보호

1. **2차 피해 방지**: 분석 과정에서 피해자 재트라우마 주의
2. **정보 보호**: 피해자 신원 정보 보호
3. **동의 확인**: 필요시 피해자 동의 확인

### 오탐 리스크

- **False Positive의 심각성**: 무고한 사람이 피해 가능
- **신중한 표현**: 단정적 표현 지양
- **추가 조사 권고**: 필요시 추가 분석 권고
