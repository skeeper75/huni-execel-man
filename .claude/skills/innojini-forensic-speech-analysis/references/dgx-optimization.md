# DGX Spark 최적화 가이드

## 하드웨어 사양

### NVIDIA DGX Spark
- **GPU**: NVIDIA GB10 Grace Blackwell Superchip
- **메모리**: 128GB Unified Memory (CPU+GPU 공유)
- **아키텍처**: ARM-based Grace CPU + Blackwell GPU
- **특징**: Unified Memory Architecture (UMA)

---

## OOM 방지 전략

### 1. 청킹 (Chunking)

70분 이상의 긴 오디오 파일 처리 시 필수:

```python
# 권장 설정
CONFIG = {
    "chunk_length_s": 30,      # 30초 청크
    "stride_length_s": 5,      # 5초 오버랩 (chunk/6)
    "batch_size": 16,          # 배치 크기
    "compute_type": "float16", # 메모리 절약
}

# WhisperX 사용 예시
import whisperx

model = whisperx.load_model(
    "large-v3",
    device="cuda",
    compute_type="float16"
)

result = model.transcribe(
    audio,
    batch_size=16,
    chunk_length=30
)
```

### 2. Compute Type 선택

| Type | 메모리 | 속도 | 정확도 | 권장 상황 |
|------|--------|------|--------|----------|
| float32 | 높음 | 느림 | 최고 | 연구/검증 |
| float16 | 중간 | 빠름 | 좋음 | **일반 권장** |
| int8 | 낮음 | 가장 빠름 | 약간 낮음 | 메모리 부족 시 |

```python
# float16 (권장)
model = whisperx.load_model("large-v3", compute_type="float16")

# int8 (메모리 극히 부족 시)
model = whisperx.load_model("large-v3", compute_type="int8")
```

### 3. 배치 크기 조정

```python
# 메모리 상황별 배치 크기
BATCH_SIZE_GUIDE = {
    "128GB": 16,   # DGX Spark 기본
    "64GB": 8,
    "32GB": 4,
    "16GB": 2,
    "8GB": 1
}

# 동적 배치 크기 조정
def get_optimal_batch_size():
    import torch
    
    if torch.cuda.is_available():
        total_mem = torch.cuda.get_device_properties(0).total_memory
        total_gb = total_mem / (1024**3)
        
        if total_gb >= 120:
            return 16
        elif total_gb >= 60:
            return 8
        elif total_gb >= 30:
            return 4
        else:
            return 2
    return 1
```

---

## Unified Memory 활용

### UMA 특성

DGX Spark의 Unified Memory Architecture:
- CPU와 GPU가 메모리 공유
- 데이터 이동 오버헤드 감소
- 실제 사용 가능 메모리 > `cudaMemGetInfo` 반환값

### 메모리 모니터링

```python
import torch

def monitor_memory():
    """GPU 메모리 사용량 모니터링"""
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        reserved = torch.cuda.memory_reserved() / 1e9
        max_allocated = torch.cuda.max_memory_allocated() / 1e9
        
        print(f"Allocated: {allocated:.2f}GB")
        print(f"Reserved: {reserved:.2f}GB")
        print(f"Max Allocated: {max_allocated:.2f}GB")
        
        return {
            "allocated_gb": allocated,
            "reserved_gb": reserved,
            "max_allocated_gb": max_allocated
        }
    return None

def clear_memory():
    """GPU 메모리 정리"""
    import gc
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
```

---

## 모델별 메모리 요구량

### Whisper 모델

| 모델 | 파라미터 | float16 메모리 | 권장 배치 |
|------|---------|---------------|----------|
| tiny | 39M | ~1GB | 32 |
| base | 74M | ~1GB | 32 |
| small | 244M | ~2GB | 16 |
| medium | 769M | ~3GB | 16 |
| large-v2 | 1.5B | ~6GB | 8-16 |
| large-v3 | 1.5B | ~6GB | 8-16 |

### pyannote-audio

| 모델 | 메모리 | 비고 |
|------|--------|------|
| speaker-diarization-3.1 | ~4GB | 화자 분리 |
| segmentation-3.0 | ~2GB | VAD/세그먼테이션 |

### 전체 파이프라인 추정

```
전사 (Whisper large-v3): ~6GB
화자 분리 (pyannote): ~4GB
정렬 (WhisperX align): ~2GB
Prosody (parselmouth): <1GB
---
총 피크 메모리: ~12-15GB (순차 실행 시)
```

---

## 최적화 파이프라인

### 순차 처리 (메모리 효율)

```python
def optimized_pipeline(audio_path, output_dir):
    """
    메모리 효율적인 순차 처리 파이프라인
    """
    import whisperx
    import torch
    import gc
    
    device = "cuda"
    
    # 1. 전사 (메모리 해제 후 다음 단계)
    print("[1/4] Transcription...")
    model = whisperx.load_model("large-v3", device=device, compute_type="float16")
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=16)
    
    # 모델 메모리 해제
    del model
    gc.collect()
    torch.cuda.empty_cache()
    
    # 2. 정렬
    print("[2/4] Alignment...")
    model_a, metadata = whisperx.load_align_model(language_code="ko", device=device)
    result = whisperx.align(result["segments"], model_a, metadata, audio, device=device)
    
    del model_a
    gc.collect()
    torch.cuda.empty_cache()
    
    # 3. 화자 분리
    print("[3/4] Diarization...")
    diarize_model = whisperx.DiarizationPipeline(device=device)
    diarize_segments = diarize_model(audio)
    result = whisperx.assign_word_speakers(diarize_segments, result)
    
    del diarize_model
    gc.collect()
    torch.cuda.empty_cache()
    
    # 4. Prosody (CPU 기반, GPU 메모리 영향 없음)
    print("[4/4] Prosody extraction...")
    # parselmouth는 CPU 기반
    
    return result
```

### 배치 파일 처리

```python
def batch_process_files(file_list, output_dir, batch_size=5):
    """
    여러 파일 배치 처리 (메모리 관리 포함)
    """
    import torch
    
    results = []
    
    for i in range(0, len(file_list), batch_size):
        batch = file_list[i:i+batch_size]
        
        print(f"\nProcessing batch {i//batch_size + 1}/{(len(file_list)-1)//batch_size + 1}")
        
        for audio_path in batch:
            try:
                result = process_single_file(audio_path, output_dir)
                results.append({"file": audio_path, "status": "success", "result": result})
            except Exception as e:
                results.append({"file": audio_path, "status": "error", "error": str(e)})
        
        # 배치 간 메모리 정리
        torch.cuda.empty_cache()
        gc.collect()
        
        # 메모리 상태 확인
        monitor_memory()
    
    return results
```

---

## 트러블슈팅

### OOM 발생 시

```python
# 1단계: 배치 크기 감소
batch_size = batch_size // 2

# 2단계: compute_type 변경
compute_type = "int8"

# 3단계: 청크 크기 감소
chunk_length_s = 20  # 30 → 20

# 4단계: 모델 크기 축소
model_name = "medium"  # large-v3 → medium
```

### CUDA 오류 시

```bash
# CUDA 상태 확인
nvidia-smi

# PyTorch CUDA 확인
python -c "import torch; print(torch.cuda.is_available())"

# CUDA 버전 확인
python -c "import torch; print(torch.version.cuda)"
```

### 느린 처리 속도 시

```python
# 1. GPU 활용 확인
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"Current device: {torch.cuda.current_device()}")

# 2. 배치 크기 증가 (메모리 여유 시)
batch_size = 32

# 3. VAD 전처리 활성화
result = model.transcribe(audio, vad_filter=True)
```

---

## 환경 설정

### 필수 패키지 설치

```bash
# CUDA 11.8+ 환경
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Whisper 관련
pip install faster-whisper whisperx

# 화자 분리
pip install pyannote-audio

# Prosody
pip install parselmouth librosa
```

### 환경 변수

```bash
# HuggingFace 토큰 (pyannote 사용 시 필수)
export HF_TOKEN="your_huggingface_token"

# CUDA 설정
export CUDA_VISIBLE_DEVICES=0

# 메모리 최적화
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
```

---

## 성능 벤치마크 (참고)

### DGX Spark 예상 처리 시간

| 오디오 길이 | 전사 | 화자분리 | Prosody | 총 시간 |
|-----------|------|---------|---------|--------|
| 10분 | ~30초 | ~20초 | ~10초 | ~1분 |
| 30분 | ~1.5분 | ~1분 | ~30초 | ~3분 |
| 70분 | ~3.5분 | ~2분 | ~1분 | ~7분 |

*실제 성능은 오디오 품질, 화자 수, 배경 소음에 따라 변동

### RTF (Real-Time Factor)

```
RTF = 처리 시간 / 오디오 길이

목표 RTF:
- 전사: < 0.1 (10배 실시간 이상)
- 화자분리: < 0.05
- 전체 파이프라인: < 0.15
```
