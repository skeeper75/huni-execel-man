# Transformers API Reference

데이터 변환기(Transformer)는 비정규화된 원본 데이터를 정규화된 마스터 테이블 형식으로 변환합니다.

## 목차

- [공통 인터페이스](#공통-인터페이스)
- [PaperTransformer](#papertransformer)
- [SizeTransformer](#sizetransformer)
- [FinishTransformer](#finishtransformer)
- [BindingTransformer](#bindingtransformer)

---

## 공통 인터페이스

모든 Transformer는 다음 인터페이스를 구현합니다:

```javascript
class Transformer {
  /**
   * 원본 데이터를 정규화된 레코드로 변환
   * @param {Object} sourceData - 원본 데이터 객체
   * @returns {Object} 정규화된 레코드
   */
  transform(sourceData) {}

  /**
   * 복수의 원본 데이터를 일괄 변환
   * @param {Array<Object>} sourceDataArray - 원본 데이터 배열
   * @returns {Array<Object>} 정규화된 레코드 배열
   */
  transformBatch(sourceDataArray) {}
}
```

---

## PaperTransformer

용지 데이터를 정규화된 PAPER_MASTER 레코드로 변환합니다.

### 기능

- 한국어 용지 용어 → 정규화된 코드 (12개 용어 → 6개 코드)
- GSM 추출 및 검증
- 영어 명칭 자동 생성
- 미지 용지 유형 → SPECIAL 처리

### 사용 예시

```javascript
const paperTransformer = new PaperTransformer();

// 단일 레코드 변환
const source = {
  용지명: '아트지 150g',
  두께: '120μm',
  표면: '광택'
};

const record = paperTransformer.transform(source);
// 결과: {
//   paper_code: 'PAPER_ART_150',
//   paper_name_ko: '아트지 150g',
//   paper_name_en: 'Art Paper 150gsm',
//   paper_type: 'ART',
//   gsm: 150,
//   thickness_um: 120,
//   finish: 'GLOSS',
//   status: 'A'
// }

// 일괄 변환
const sources = [
  { 용지명: '아트지 150g' },
  { 용지명: '스노우지 200g' }
];

const records = paperTransformer.transformBatch(sources);
```

### 정규화 규칙

| 한국어 용어 | 정규화 코드 | 영어명 |
|-------------|-------------|--------|
| 아트지, 아트 | ART | Art Paper |
| 스노우지, 스노우, 스노화이트 | SNOW | Snow White |
| 모조지, 모조 | MOJO | Uncoated |
| 크라프트, 크라프트지 | KRAFT | Kraft |
| 아이보리, 백상지 | IVORY | Ivory Board |
| 랑데뷰, 마시멜로, 빛나래 | SPECIAL | Specialty |
| 누브지, 스타드림 | SPECIAL | Specialty |
| 기타/미지 | SPECIAL | Specialty |

### GSM 추출

```javascript
// 정규식 패턴: /(\d+)\s*[gG]/
// 예시:
'아트지 150g'    → 150
'스노우지 200 g'  → 200
'모조지 100G'    → 100
'특수지 250'     → null (g 단위 없음)
```

### 메서드

#### `normalizePaperType(koreanName)`

한국어 용지명을 정규화된 코드로 변환합니다.

```javascript
/**
 * @param {string} koreanName - 한국어 용지명
 * @returns {string} 정규화된 코드 (ART, SNOW, MOJO, KRAFT, IVORY, SPECIAL)
 */
normalizePaperType(koreanName)
```

#### `extractGSM(paperName)`

용지명에서 GSM 평량을 추출합니다.

```javascript
/**
 * @param {string} paperName - 용지명 (예: "아트지 150g")
 * @returns {number|null} GSM 값 또는 null (추출 실패)
 */
extractGSM(paperName)
```

#### `generateEnglishName(paperType, gsm)`

영어 명칭을 생성합니다.

```javascript
/**
 * @param {string} paperType - 용지 유형 코드
 * @param {number} gsm - GSM 평량
 * @returns {string} 영어 명칭
 */
generateEnglishName(paperType, gsm)
// 예: 'Art Paper 150gsm', 'Snow White 200gsm'
```

---

## SizeTransformer

사이즈 데이터를 정규화된 SIZE_MASTER 레코드로 변환합니다.

### 기능

- 사이즈 문자열 → 표준 코드 (ISO/JIS/KS/CUSTOM)
- mm 단위 변환
- 커스텀 사이즈 파싱 (예: "200x300mm")

### 사용 예시

```javascript
const sizeTransformer = new SizeTransformer();

// 표준 사이즈
const source1 = { 사이즈: 'A4' };
const record1 = sizeTransformer.transform(source1);
// 결과: {
//   size_code: 'SIZE_A4_ISO',
//   size_name: 'A4',
//   width_mm: 210,
//   height_mm: 297,
//   standard: 'ISO'
// }

// JIS 표준
const source2 = { 사이즈: 'B5' };
const record2 = sizeTransformer.transform(source2);
// 결과: {
//   size_code: 'SIZE_B5_JIS',
//   width_mm: 182,
//   height_mm: 257,
//   standard: 'JIS'
// }

// 커스텀 사이즈
const source3 = { 사이즈: '200x300mm' };
const record3 = sizeTransformer.transform(source3);
// 결과: {
//   size_code: 'SIZE_CUSTOM_200X300',
//   size_name: '200x300',
//   width_mm: 200,
//   height_mm: 300,
//   standard: 'CUSTOM'
// }
```

### 표준 사이즈 정의

#### ISO 216 A 시리즈

| 코드 | 사이즈 | 너비(mm) | 높이(mm) |
|------|--------|----------|----------|
| SIZE_A3_ISO | A3 | 297 | 420 |
| SIZE_A4_ISO | A4 | 210 | 297 |
| SIZE_A5_ISO | A5 | 148 | 210 |
| SIZE_A6_ISO | A6 | 105 | 148 |

#### JIS B 시리즈

| 코드 | 사이즈 | 너비(mm) | 높이(mm) |
|------|--------|----------|----------|
| SIZE_B4_JIS | B4 | 257 | 364 |
| SIZE_B5_JIS | B5 | 182 | 257 |

#### KS 표준

| 코드 | 사이즈 | 너비(mm) | 높이(mm) |
|------|--------|----------|----------|
| SIZE_KUKJEON_KS | 국전 | 636 | 939 |
| SIZE_46_KS | 4x6 | 788 | 1091 |

### 메서드

#### `identifyStandard(sizeName)`

사이즈 표준을 식별합니다.

```javascript
/**
 * @param {string} sizeName - 사이즈명
 * @returns {string} 표준 코드 (ISO, JIS, KS, CUSTOM)
 */
identifyStandard(sizeName)
```

#### `parseCustomSize(sizeString)`

커스텀 사이즈를 파싱합니다.

```javascript
/**
 * @param {string} sizeString - 사이즈 문자열 (예: "200x300mm")
 * @returns {Object|null} {width, height} 또는 null
 */
parseCustomSize(sizeString)
```

---

## FinishTransformer

후가공 데이터를 정규화된 FINISH_MASTER 레코드로 변환합니다.

### 기능

- 한국어 후가공 용어 → 정규화된 코드 (15개 용어 → 5x7 코드)
- 복합 후가공 분리 (예: "무광코팅+금박" → 2개 레코드)

### 사용 예시

```javascript
const finishTransformer = new FinishTransformer();

// 단일 후가공
const source1 = { 후가공: '유광 라미네이팅' };
const records1 = finishTransformer.transform(source1);
// 결과: [{
//   finish_code: 'FINISH_LAM_GLOSS',
//   finish_name_ko: '유광 라미네이팅',
//   finish_name_en: 'Gloss Lamination',
//   category: 'LAM',
//   sub_type: 'GLOSS'
// }]

// 복합 후가공
const source2 = { 후가공: '무광코팅+금박' };
const records2 = finishTransformer.transform(source2);
// 결과: [
//   {
//     finish_code: 'FINISH_LAM_MATTE',
//     finish_name_ko: '무광 라미네이팅',
//     category: 'LAM',
//     sub_type: 'MATTE'
//   },
//   {
//     finish_code: 'FINISH_FOIL_GOLD',
//     finish_name_ko: '금박',
//     category: 'FOIL',
//     sub_type: 'GOLD'
//   }
// ]
```

### 정규화 규칙

| 한국어 용어 | 카테고리 | 서브타입 | 코드 |
|-------------|----------|----------|------|
| 유광 라미네이팅, 유광코팅 | LAM | GLOSS | FINISH_LAM_GLOSS |
| 무광 라미네이팅, 무광코팅 | LAM | MATTE | FINISH_LAM_MATTE |
| 벨벳 라미네이팅 | LAM | VELVET | FINISH_LAM_VELVET |
| UV코팅, 부분UV | UV | SPOT | FINISH_UV_SPOT |
| 전면UV | UV | FULL | FINISH_UV_FULL |
| 금박, 금색박 | FOIL | GOLD | FINISH_FOIL_GOLD |
| 은박, 은색박 | FOIL | SILVER | FINISH_FOIL_SILVER |
| 홀로그램박 | FOIL | HOLO | FINISH_FOIL_HOLO |
| 엠보싱, 형압 | EMB | STD | FINISH_EMB_STD |
| 도무송 | DIE | STD | FINISH_DIE_STD |
| 타공 | DIE | PUNCH | FINISH_DIE_PUNCH |
| 귀도리 | DIE | ROUND | FINISH_DIE_ROUND |

### 메서드

#### `splitCompositeFinish(finishString)`

복합 후가공을 분리합니다.

```javascript
/**
 * @param {string} finishString - 후가공 문자열 (예: "무광코팅+금박")
 * @returns {Array<string>} 분리된 후가공 배열
 */
splitCompositeFinish(finishString)
// 예: "무광코팅+금박" → ['무광코팅', '금박']
```

---

## BindingTransformer

제본 데이터를 정규화된 BINDING_MASTER 레코드로 변환합니다.

### 기능

- 한국어 제본 용어 → 정규화된 코드 (12개 용어 → 6개 코드)
- 페이지 제약 조건 설정

### 사용 예시

```javascript
const bindingTransformer = new BindingTransformer();

const source = { 제본: '중철제본' };
const record = bindingTransformer.transform(source);
// 결과: {
//   binding_code: 'BIND_SADDLE_STD',
//   binding_name_ko: '중철 제본',
//   binding_name_en: 'Saddle Stitch',
//   binding_type: 'SADDLE',
//   min_pages: 8,
//   max_pages: 64,
//   page_unit: 4,
//   cover_required: false
// }
```

### 정규화 규칙

| 한국어 용어 | 타입 | 페이지 범위 | 코드 |
|-------------|------|-------------|------|
| 중철, 중철제본 | SADDLE | 8-64 | BIND_SADDLE_STD |
| 무선, 무선제본, 떡제본 | PERFECT | 48-500 | BIND_PERFECT_STD |
| 양장, 양장제본 | CASE | 100-1000 | BIND_CASE_STD |
| 와이어, 와이어제본 | WIRE | 10-200 | BIND_WIRE_STD |
| 스프링, 스프링제본 | SPIRAL | 10-300 | BIND_SPIRAL_STD |
| PUR제본 | PUR | 100-800 | BIND_PUR_STD |

### 메서드

#### `getPageConstraints(bindingType)`

제본 유형별 페이지 제약 조건을 반환합니다.

```javascript
/**
 * @param {string} bindingType - 제본 유형 코드
 * @returns {Object} {min_pages, max_pages, page_unit, cover_required}
 */
getPageConstraints(bindingType)
// 예: getPageConstraints('SADDLE')
// → {min_pages: 8, max_pages: 64, page_unit: 4, cover_required: false}
```

---

## 오류 처리

모든 Transformer는 변환 실패 시 상세한 오류 정보를 반환합니다:

```javascript
try {
  const record = transformer.transform(source);
} catch (error) {
  console.error('Transform error:', {
    source: source,
    error: error.message,
    code: error.code
  });
}
```

### 일반적인 오류 코드

| 코드 | 설명 | 해결 방법 |
|------|------|-----------|
| INVALID_INPUT | 입력 데이터 형식 오류 | 입력 데이터 구조 확인 |
| UNKNOWN_TYPE | 알 수 없는 유형 | 매핑 테이블에 추가 |
# EXTRACT_FAILED | 데이터 추출 실패 | 정규식 패턴 확인 |
# OUT_OF_RANGE | 값 범위 초과 | 유효 범위 확인 |

---

**버전**: 1.0.0
**최종 업데이트**: 2026-01-29
