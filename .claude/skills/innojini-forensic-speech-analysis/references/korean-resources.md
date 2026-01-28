# 한국어 음성 포렌식 리소스

## 감정 음성 데이터셋

### KESDy18 (ETRI)
- **규모**: 30명 성우(남/여 각 15명), 4감정 × 20문장
- **감정**: 중립, 행복, 슬픔, 분노
- **특징**: arousal(각성도), valence(긍/부정도) 평가 포함
- **용도**: 감정 분류 모델 학습
- **접근**: https://nanum.etri.re.kr → SER-DB-ETRIv18 검색 → 협약서 제출

```
협약 조건:
- 연구 용도 한정 (상업용 불허)
- 제3자 양도 금지
- 협약서 서명 필수
```

### AIHub 감정 음성
- **규모**: 전문 성우 8명 + 일반인 501명
- **특징**: 다양한 감정 레이블, VAD(valence-arousal-dominance)
- **접근**: https://aihub.or.kr → 회원가입 → 신청서 작성 → 승인 (1일 소요)

### KAV DB (학술 연구)
- **규모**: 배우 2명, 6개 정서
- **감정**: 행복, 분노, 공포, 슬픔, 놀람, 중립
- **특징**: 운율 기반 감정 인식용, Cronbach's α = 0.847
- **접근**: 논문 저자 연락

---

## 한국어 ASR 데이터셋

| 데이터셋 | 규모 | 특징 | 접근 |
|---------|------|------|------|
| Zeroth Korean | ~50시간 | Whisper fine-tune 표준 | HuggingFace |
| AIHub 대화음성 | 4,000시간 | 성별, 지역, 연령, 노이즈 | aihub.or.kr |
| AIHub 한국어음성 | 1,000시간+ | 2,000여명 발성 | aihub.or.kr |
| ETRI 음향모델 | 과기부 R&D | 저음질 전화망 포함 | data.go.kr |

---

## 한국어 Fine-tuned Whisper 모델

### 권장 모델

```python
# 1순위: Large-v3-turbo 한국어 최적화
from transformers import AutoModelForSpeechSeq2Seq
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    "o0dimplz0o/Whisper-Large-v3-turbo-STT-Zeroth-KO-v2"
)

# 2순위: Medium 한국어
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    "seastar105/whisper-medium-ko-zeroth"
)
```

### 모델 비교

| 모델 | 크기 | 메모리 | 특징 |
|-----|------|--------|------|
| whisper-large-v3-turbo-ko | ~3GB | ~6GB | 한국어 최적화, 빠름 |
| whisper-medium-ko-zeroth | ~1.5GB | ~4GB | Zeroth 데이터 학습 |
| whisper-large-v3 (원본) | ~3GB | ~6GB | 다국어, 한국어 제한적 |

### WhisperX 한국어 설정

```python
import whisperx

# 한국어 전사
model = whisperx.load_model("large-v3", device="cuda", language="ko")
result = model.transcribe(audio, language="ko")

# 한국어 정렬
model_a, metadata = whisperx.load_align_model(language_code="ko", device="cuda")
result = whisperx.align(result["segments"], model_a, metadata, audio, device="cuda")
```

---

## 국립과학수사연구원 (참고)

### 디지털과 현황
- 인원: 20명
- 업무: 영상, 오디오, 디지털포렌식 감정 및 연구
- 연구: 딥러닝 기반 화자인식, 보이스피싱 분석

### 연구 성과
- 보이스피싱 음성분석 모델: 기존 영국/러시아 프로그램 대비 77% 성능 향상
- 범죄 집단 구성 기능: 세계 최초 특허 출원

### 연락처
- 대표: 033-902-5000
- 위치: 강원특별자치도 원주시 입춘로 10

---

## 데이터셋 신청 가이드

### ETRI AI나눔

```
1. https://nanum.etri.re.kr 접속
2. 회원가입 → 로그인
3. SER-DB-ETRIv18 검색
4. 사용 허가 협약서 작성
   - 연구 목적 명시
   - 소속 기관 정보
   - 책임자 서명
5. 승인 후 다운로드 (연구용 한정)
```

### AIHub

```
1. https://aihub.or.kr 접속
2. 회원가입 → 로그인
3. "감정 음성" 또는 "한국어 음성" 검색
4. 이용신청
   - 사용 목적 명시
   - 사용 기간 명시
5. 허가 메일 수신 후 다운로드 (보통 1일)
```

### 보안 데이터 (안심존)

의료 데이터 등 보안이 필요한 경우:
```
필요 서류:
- IRB 심의 결과 통지서
- IRB 승인된 연구계획서
- 소속 증빙 서류
- 안심존 이용 신청서
```

---

## HuggingFace 모델 다운로드

```bash
# 환경 설정
pip install transformers torch

# 모델 다운로드
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor

model_id = "seastar105/whisper-medium-ko-zeroth"
model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id)
processor = AutoProcessor.from_pretrained(model_id)

# 저장
model.save_pretrained("./whisper-ko")
processor.save_pretrained("./whisper-ko")
```

---

## 한국어 특수 고려사항

### 발음 규칙
- 연음: "학교" → [학꾜]
- 경음화: "국밥" → [국빱]
- 비음화: "입문" → [임문]

### ASR 오류 유형
- 조사 오류: "을/를", "이/가"
- 어미 오류: "~요", "~습니다"
- 고유명사 인식 한계

### 평가 지표
- CER (Character Error Rate): 한국어 권장
- WER (Word Error Rate): 띄어쓰기 의존성 높음
