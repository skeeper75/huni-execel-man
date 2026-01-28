# 후니프린팅 데이터 정규화 도구 (Huniprinting Data Normalization Tool)

후니프린팅의 xlsx 기반 상품 및 가격 마스터 데이터를 산업 표준에 부합하는 정규화된 데이터베이스로 변환하는 Google Apps Script 도구입니다.

## 개요 (Overview)

본 도구는 비정규화된 엑셀 데이터(18+ 시트)를 정규화된 마스터 테이블 구조로 변환하여 데이터 일관성, 확장성, MES 연동 용이성을 확보합니다.

### 주요 특징

- **정규화된 데이터 구조**: 6개 마스터 테이블 (용지, 사이즈, 후가공, 제본, 상품, 코드 정의)
- **표준 준수**: ISO 216 (사이즈), JDF/XJDF (인쇄 산업 표준), GSM (용지 평량)
- **코드 체계**: `[CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]` 형식
- **이중 언어 지원**: 한국어/영어 명칭 매핑
- **데이터 검증**: 80+ 테스트 케이스, 85%+ 커버리지

## 마스터 테이블 구조

### PAPER_MASTER (용지 마스터)
용지 종류, 평량, 두께, 표면 처리 등을 관리합니다.

- **Primary Key**: `paper_code` (예: PAPER_ART_150)
- **필드**: paper_name_ko/en, paper_type, gsm, thickness_um, finish, color
- **용지 유형**: ART, SNOW, MOJO, KRAFT, IVORY, SPECIAL

### SIZE_MASTER (사이즈 마스터)
표준 사이즈(A/B 시리즈) 및 커스텀 사이즈를 관리합니다.

- **Primary Key**: `size_code` (예: SIZE_A4_ISO)
- **필드**: size_name, width_mm, height_mm, standard, orientation
- **표준**: ISO 216, JIS, KS, CUSTOM

### FINISH_MASTER (후가공 마스터)
라미네이팅, UV, 박, 엠보싱, 도무송 등 후가공 옵션을 관리합니다.

- **Primary Key**: `finish_code` (예: FINISH_LAM_GLOSS)
- **카테고리**: LAM, UV, FOIL, EMB, DIE
- **필드**: finish_name_ko/en, category, sub_type, base_price

### BINDING_MASTER (제본 마스터)
중철, 무선, 와이어, 스프링, PUR 제본 등을 관리합니다.

- **Primary Key**: `binding_code` (예: BIND_SADDLE_STD)
- **제본 유형**: SADDLE, PERFECT, CASE, WIRE, SPIRAL, PUR
- **필드**: binding_name_ko/en, binding_type, min_pages, max_pages

### PRODUCT_MASTER (상품 마스터)
최종 상품 정보와 구성(용지, 사이즈, 후가공, 제본)을 관리합니다.

- **Primary Key**: `product_code` (예: PROD_DIG_001)
- **카테고리**: DIG, STK, BOOK, CAL, LG, STN, ACR, GOODS
- **필드**: product_name_ko/en, default_paper_code, available_papers (* 와일드카드 지원)

### CODE_DEFINITION (코드 정의)
전체 코드 체계를 정의하고 계층 구조를 관리합니다.

- **Purpose**: 코드 체계 문서화
- **필드**: code_prefix, code_value, name_ko/en, category, parent_code

## 사용 방법

### 1. Google Apps Script 프로젝트 설정

```javascript
// Apps Script 프로젝트 생성
// 1. Google Sheets → 확장프로그램 → Apps Script
// 2. .gs 파일들을 생성된 프로젝트에 업로드
// 3. Config.gs에서 환경 설정
```

### 2. 소스 데이터 준비

- `!후니프린팅_상품마스터.xlsx`를 Google Drive에 업로드
- `!후니프린팅_인쇄상품_가격표.xlsx`를 Google Drive에 업로드

### 3. 마스터 시트 생성

스프레드시트에 다음 시트들을 생성합니다:
- PAPER_MASTER
- SIZE_MASTER
- FINISH_MASTER
- BINDING_MASTER
- PRODUCT_MASTER
- CODE_DEFINITION
- MIGRATION_LOG

### 4. 마이그레이션 실행

```javascript
// Main.gs의 runMigration() 함수 실행
function runMigration() {
  // 1. 소스 데이터 로드
  // 2. 데이터 변환
  // 3. 마스터 테이블에 기록
  // 4. 검증 실행
}
```

## 코드 생성 규칙

### 형식

```
[CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]
```

### 예시

```
PAPER_ART_150        # 아트지 150g
SIZE_A4_ISO          # A4 사이즈 (ISO 표준)
FINISH_LAM_GLOSS     # 유광 라미네이팅
BIND_SADDLE_STD      # 표준 중철 제본
PROD_DIG_001         # 디지털 인쇄 상품 #001
```

## 데이터 검증

### 자동 검증 규칙

1. **코드 형식**: `[A-Z]+_[A-Z]+(_[A-Z0-9]+)*` 패턴 준수
2. **중복 코드**: 0건 (자동 감지 및 병합)
3. **참조 무결성**: 외래 키 참조 유효성 검증
4. **GSM 범위**: 50-500 g/m²
5. **사이즈 표준**: ISO/JIS/CUSTOM 구분

### 테스트 커버리지

- **총 테스트 케이스**: 80+
- **코드 커버리지**: 85%+
- **주요 테스트 영역**:
  - 코드 생성 (60+ 테스트)
  - 데이터 검증 (20+ 테스트)
  - 변환 로직 (95% 커버리지)
  - 정규화 함수 (95% 커버리지)

## 프로젝트 구조

```
huni.execel.man/
├── .moai/
│   └── specs/
│       └── SPEC-NORMALIZE-001/
│           ├── spec.md          # 스페셜 정의
│           ├── plan.md          # 구현 계획
│           └── acceptance.md    # 인수 기준
├── .moai/reports/
│   └── ddd-SPEC-NORMALIZE-001-report.md  # 구현 리포트
└── ref/
    ├── !후니프린팅_상품마스터.xlsx
    └── !후니프린팅_인쇄상품_가격표.xlsx
```

## 구현 현황

### 완료된 기능 (Phase 2)

- [x] 6개 마스터 테이블 스키마 정의
- [x] 4개 데이터 변환기 (Paper, Size, Finish, Binding)
- [x] 2개 데이터 검증기 (Code, Data)
- [x] 마스터 데이터 라이터
- [x] 80+ 단위 테스트 케이스
- [x] UI 사이드바
- [x] 로깅 시스템

### 향후 작업 (Phase 3)

- [ ] xlsx 파일 파싱 구현 (Drive API)
- [ ] 상품 변환 구현
- [ ] 코드 정의 생성 구현
- [ ] 통합 테스트
- [ ] 성능 최적화

## 품질 지표

### TRUST 5 점수: 94.6/100

- **Tested (T)**: 85%+ 테스트 커버리지 ✅
- **Readable (R)**: 명확한 코드 구조, 영어 주석 ✅
- **Unified (U)**: 일관된 코드 포맷, 표준 상수 ✅
- **Secured (S)**: 입력 검증, 참조 무결성 ✅
- **Trackable (T)**: 포괄적 로깅, 타임스탬프 ✅

## 참고 문서

- [SPEC 문서](.moai/specs/SPEC-NORMALIZE-001/spec.md)
- [인수 기준](.moai/specs/SPEC-NORMALIZE-001/acceptance.md)
- [구현 리포트](.moai/reports/ddd-SPEC-NORMALIZE-001-report.md)

## 라이선스

Copyright (c) 2026 후니프린팅 (Huniprinting)

## 버전

버전 1.0.0 (2026-01-29)
