---
name: toon
description: |
  Token-Oriented Object Notation (TOON) 포맷 처리 스킬. JSON 대비 30-60% 토큰 절감하는 LLM 최적화 직렬화 포맷.

  🔹 변환: "JSON을 TOON으로", "TOON 변환", "토큰 절약", "데이터 압축"
  🔹 파싱: "TOON 파싱", "TOON 읽기", "TOON 해석"
  🔹 생성: "TOON 형식으로", "TOON 포맷", "테이블 데이터"
  🔹 최적화: "스킬 데이터 최적화", "프롬프트 토큰 절감"

  사용 시점: (1) JSON/YAML/CSV → TOON 변환, (2) TOON 데이터 파싱/생성, (3) 스킬 내 데이터 토큰 최적화, (4) 균일 배열 데이터 압축
---

# TOON (Token-Oriented Object Notation)

LLM 프롬프트용 토큰 효율적 데이터 직렬화 포맷. YAML의 들여쓰기 구조 + CSV의 테이블 형식 결합.

## 핵심 문법

### 객체
```toon
id: 123
name: Alice
active: true
```

### 중첩 객체
```toon
user:
  id: 123
  name: Alice
```

### 균일 배열 (테이블) - TOON의 핵심 강점
```toon
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Carol,editor
```
→ `[N]`: 배열 길이, `{fields}`: 필드 헤더

### 원시 배열
```toon
tags[3]: admin,ops,dev
```

### 혼합/비균일 배열
```toon
items[3]:
  - 1
  - name: test
  - text
```

## 언제 TOON을 사용하나?

| 데이터 유형 | TOON 효율 | 권장 |
|------------|----------|------|
| 균일 객체 배열 (테이블) | ✅ 30-60% 절감 | TOON |
| 단순 키-값 객체 | ⚠️ 10-20% 절감 | TOON/JSON |
| 깊은 중첩 구조 | ❌ 비효율 | JSON |
| 비균일 배열 | ❌ 비효율 | JSON |

## 스크립트 사용

### JSON → TOON 변환
```bash
python scripts/toon_codec.py encode input.json
python scripts/toon_codec.py encode input.json -o output.toon
echo '{"name":"Alice"}' | python scripts/toon_codec.py encode -
```

### TOON → JSON 파싱
```bash
python scripts/toon_codec.py decode input.toon
python scripts/toon_codec.py decode input.toon -o output.json
```

### 토큰 비교 분석
```bash
python scripts/toon_codec.py analyze input.json
```

### 다양한 포맷 변환
```bash
python scripts/format_converter.py data.csv --to toon
python scripts/format_converter.py data.yaml --to toon
python scripts/format_converter.py data.md --to toon  # 마크다운 테이블
```

## 인라인 변환 (스크립트 없이)

간단한 데이터는 직접 변환:

**JSON 입력:**
```json
{"prices":[{"type":"무선","qty":100,"price":45000},{"type":"중철","qty":100,"price":32000}]}
```

**TOON 출력:**
```toon
prices[2]{type,qty,price}:
  무선,100,45000
  중철,100,32000
```

## 스킬 데이터 최적화 패턴

기존 스킬의 JSON 참조 데이터를 TOON으로 변환하여 토큰 절감:

### Before (JSON) - ~85 토큰
```json
{"binding_prices":[{"qty_min":1,"qty_max":3,"price":3000},{"qty_min":4,"qty_max":9,"price":2000}]}
```

### After (TOON) - ~35 토큰
```toon
binding_prices[2]{qty_min,qty_max,price}:
  1,3,3000
  4,9,2000
```

## 쿼팅 규칙

| 조건 | 쿼팅 | 예시 |
|-----|------|-----|
| 일반 문자열 | 불필요 | `Alice` |
| 공백 포함 | 불필요 | `hello world` |
| 앞뒤 공백 | 필요 | `" padded "` |
| 구분자/콜론 포함 | 필요 | `"a,b"`, `"a:b"` |
| 숫자처럼 보임 | 필요 | `"42"`, `"true"` |
| 유니코드/이모지 | 불필요 | `안녕 👋` |

## 고급: 키 폴딩

깊은 단일 키 체인을 점 표기법으로 압축:

```toon
# 기본
data:
  metadata:
    items[2]: a,b

# 키 폴딩 적용
data.metadata.items[2]: a,b
```

## 참조 문서

- `references/spec-summary.toon` - TOON 스펙 요약 (TOON 형식)
- `references/examples.md` - 다양한 변환 예시
