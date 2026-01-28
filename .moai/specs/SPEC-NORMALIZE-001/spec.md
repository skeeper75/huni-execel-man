# SPEC-NORMALIZE-001: 후니프린팅 xlsx 데이터 정규화

---
id: SPEC-NORMALIZE-001
version: 1.0.0
status: Planned
created: 2026-01-28
updated: 2026-01-28
author: MoAI-ADK
priority: HIGH
lifecycle: spec-anchored
tags: [data-normalization, xlsx, master-data, printing-industry]
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-28 | MoAI-ADK | Initial SPEC creation |

---

## 1. Overview

### 1.1 Background

후니프린팅은 현재 18개 이상의 시트로 구성된 두 개의 엑셀 파일(`!후니프린팅_상품마스터.xlsx`, `!후니프린팅_인쇄상품_가격표.xlsx`)을 통해 상품 및 가격 데이터를 관리하고 있다. 이 데이터는 다음과 같은 문제점을 가지고 있다:

- **비정규화된 구조**: 중복 데이터, 일관성 없는 명명 규칙
- **표준 미준수**: 국제 표준(ISO 216, JDF/XJDF, CGATS) 미적용
- **확장성 부족**: 새로운 상품 추가 시 복잡한 수작업 필요
- **MES 연동 어려움**: 기존 MES 코드와의 매핑 부재

### 1.2 Objective

본 SPEC은 기존 xlsx 데이터를 산업 표준에 부합하는 정규화된 마스터 테이블로 변환하는 것을 목표로 한다.

### 1.3 Scope

**In Scope:**
- 용지 마스터 (Paper Master)
- 후가공 마스터 (Finish Master)
- 제본 마스터 (Binding Master)
- 사이즈 마스터 (Size Master)
- 상품 마스터 (Product Master)
- 코드 정의 (Code Definition)

**Out of Scope:**
- ERP/MES 시스템 직접 연동
- 실시간 가격 동기화
- 웹 기반 관리 인터페이스 개발

### 1.4 Source Files

| File | Description | Sheet Count |
|------|-------------|-------------|
| `!후니프린팅_상품마스터.xlsx` | 상품 기본 정보 | 18+ |
| `!후니프린팅_인쇄상품_가격표.xlsx` | 상품별 가격 정보 | 18+ |

---

## 2. EARS Requirements

### 2.1 Ubiquitous Requirements (UB) - 항상 적용

| ID | Requirement |
|----|-------------|
| UB-01 | 시스템은 **항상** 모든 상품 코드를 `[CAT]_[SUBCAT]_[ATTR]_[SEQ]` 형식으로 생성해야 한다. |
| UB-02 | 시스템은 **항상** 모든 용지 평량을 GSM(g/m²) 단위로 표현해야 한다. |
| UB-03 | 시스템은 **항상** 모든 사이즈를 ISO 216 또는 JIS 표준으로 참조하고 명시적으로 표기해야 한다. |
| UB-04 | 마스터 테이블은 **항상** Row 1을 헤더로, Row 2 이후를 데이터로 구성해야 한다. |
| UB-05 | 시스템은 **항상** 모든 한국어/영어 용어에 대해 이중 언어 매핑을 제공해야 한다. |
| UB-06 | 시스템은 **항상** 코드 생성 시 대문자와 언더스코어만 사용해야 한다. |
| UB-07 | 시스템은 **항상** 날짜/시간을 ISO 8601 형식(YYYY-MM-DDTHH:MM:SS)으로 기록해야 한다. |

### 2.2 Event-Driven Requirements (EV) - WHEN/THEN

| ID | Requirement |
|----|-------------|
| EV-01 | **WHEN** xlsx 파일이 임포트될 때 **THEN** 시스템은 데이터를 검증하고 마스터 형식으로 변환해야 한다. |
| EV-02 | **WHEN** 중복 코드가 감지될 때 **THEN** 시스템은 병합하거나 오류와 함께 거부해야 한다. |
| EV-03 | **WHEN** 알 수 없는 용지 유형이 발견될 때 **THEN** 시스템은 카테고리 매핑을 요청해야 한다. |
| EV-04 | **WHEN** 사이즈가 ISO/JIS 표준과 일치하지 않을 때 **THEN** 시스템은 CUSTOM으로 플래그 처리해야 한다. |
| EV-05 | **WHEN** 가격 데이터가 업데이트될 때 **THEN** 시스템은 변경 이력을 기록해야 한다. |
| EV-06 | **WHEN** 마스터 데이터 변경이 발생할 때 **THEN** 시스템은 updated_at 타임스탬프를 갱신해야 한다. |

### 2.3 State-Driven Requirements (ST) - IF/THEN

| ID | Requirement |
|----|-------------|
| ST-01 | **IF** 소스 필드가 비어있으면 **THEN** 시스템은 기본값을 설정하거나 필수로 표시해야 한다. |
| ST-02 | **IF** 가격이 0이면 **THEN** 시스템은 "가격 미설정"으로 표시해야 한다. |
| ST-03 | **IF** MES 코드가 존재하면 **THEN** 시스템은 매핑 테이블에 보존해야 한다. |
| ST-04 | **IF** 용지 두께 정보가 있으면 **THEN** 시스템은 마이크로미터(μm) 단위로 변환해야 한다. |
| ST-05 | **IF** 상품이 비활성 상태이면 **THEN** 시스템은 status를 'I'로 설정해야 한다. |

### 2.4 Unwanted Requirements (UN) - 금지 사항

| ID | Requirement |
|----|-------------|
| UN-01 | 시스템은 원본 xlsx 데이터를 **삭제하지 않아야 한다**. |
| UN-02 | 시스템은 중복 마스터 레코드를 **생성하지 않아야 한다**. |
| UN-03 | 시스템은 명시적 플래그 없이 ISO와 JIS 사이즈를 **혼합하지 않아야 한다**. |
| UN-04 | 시스템은 코드에 소문자나 특수문자를 **사용하지 않아야 한다**. |
| UN-05 | 시스템은 검증 없이 데이터를 **임포트하지 않아야 한다**. |

### 2.5 Optional Requirements (OP) - 가능하면

| ID | Requirement |
|----|-------------|
| OP-01 | **가능하면** MES 통합이 활성화된 경우 상품 코드를 동기화해야 한다. |
| OP-02 | **가능하면** 버전 이력 기능이 활성화된 경우 모든 변경사항을 추적해야 한다. |
| OP-03 | **가능하면** 다국어 지원 시 일본어/중국어 용어 매핑을 제공해야 한다. |

---

## 3. Data Model

### 3.1 Code System Design

```
Format: [CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]

Categories:
├── PAPER: 용지
│   ├── ART (아트지)
│   ├── SNOW (스노우지)
│   ├── MOJO (모조지)
│   ├── KRAFT (크라프트지)
│   ├── IVORY (아이보리)
│   └── SPECIAL (특수지)
│
├── FINISH: 후가공
│   ├── LAM (코팅/라미네이팅)
│   ├── UV (UV코팅)
│   ├── FOIL (박)
│   ├── EMB (엠보싱)
│   └── DIE (도무송)
│
├── BIND: 제본
│   ├── SADDLE (중철)
│   ├── PERFECT (무선)
│   ├── WIRE (와이어)
│   ├── SPIRAL (스프링)
│   └── PUR (PUR제본)
│
├── SIZE: 사이즈
│   ├── A3, A4, A5, A6 (ISO)
│   ├── B4, B5 (JIS)
│   └── CUSTOM (비표준)
│
├── PROD: 상품
│   ├── DIG (디지털인쇄)
│   ├── STK (스티커)
│   ├── BOOK (책자)
│   ├── PHOTO (포토북)
│   └── GOODS (판촉물)
│
└── PROC: 공정
    ├── HALF (반절)
    ├── SHEET (전지)
    ├── DIE (형압)
    ├── PERF (미싱)
    └── SCORE (오시)
```

### 3.2 PAPER_MASTER

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| paper_code | VARCHAR(50) | Y | PK: PAPER_{TYPE}_{GSM} | PAPER_ART_150 |
| paper_name_ko | VARCHAR(100) | Y | 한국어 명칭 | 아트지 150g |
| paper_name_en | VARCHAR(100) | N | 영어 명칭 | Art Paper 150gsm |
| paper_type | VARCHAR(50) | Y | 용지 종류 | ART |
| gsm | INTEGER | Y | 평량 (g/m²) | 150 |
| thickness_um | INTEGER | N | 두께 (μm) | 120 |
| finish | VARCHAR(50) | N | 표면 처리 | GLOSS |
| color | VARCHAR(50) | N | 색상 | WHITE |
| opacity | DECIMAL(5,2) | N | 불투명도 (%) | 95.5 |
| printability | VARCHAR(20) | N | 인쇄적성 | HIGH |
| status | CHAR(1) | Y | 상태 (A/I) | A |
| mes_code | VARCHAR(50) | N | MES 연동 코드 | MP150A |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |
| updated_at | DATETIME | Y | 수정일시 | 2026-01-28T10:00:00 |

### 3.3 SIZE_MASTER

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| size_code | VARCHAR(50) | Y | PK: SIZE_{NAME}_{VARIANT} | SIZE_A4_STD |
| size_name | VARCHAR(50) | Y | 사이즈 명칭 | A4 |
| width_mm | INTEGER | Y | 너비 (mm) | 210 |
| height_mm | INTEGER | Y | 높이 (mm) | 297 |
| standard | VARCHAR(10) | Y | 표준 구분 | ISO |
| orientation | VARCHAR(10) | N | 방향 | PORTRAIT |
| bleed_mm | INTEGER | N | 도련 (mm) | 3 |
| safe_margin_mm | INTEGER | N | 안전 여백 (mm) | 5 |
| status | CHAR(1) | Y | 상태 (A/I) | A |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |
| updated_at | DATETIME | Y | 수정일시 | 2026-01-28T10:00:00 |

### 3.4 FINISH_MASTER

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| finish_code | VARCHAR(50) | Y | PK: FINISH_{CAT}_{TYPE} | FINISH_LAM_GLOSS |
| finish_name_ko | VARCHAR(100) | Y | 한국어 명칭 | 유광 라미네이팅 |
| finish_name_en | VARCHAR(100) | N | 영어 명칭 | Gloss Lamination |
| category | VARCHAR(50) | Y | 후가공 분류 | LAM |
| sub_type | VARCHAR(50) | N | 세부 유형 | GLOSS |
| unit | VARCHAR(20) | Y | 단위 | 매 |
| base_price | DECIMAL(10,2) | N | 기본 단가 | 100.00 |
| min_quantity | INTEGER | N | 최소 수량 | 100 |
| applicable_papers | TEXT | N | 적용 가능 용지 | ART,SNOW,IVORY |
| status | CHAR(1) | Y | 상태 (A/I) | A |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |
| updated_at | DATETIME | Y | 수정일시 | 2026-01-28T10:00:00 |

### 3.5 BINDING_MASTER

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| binding_code | VARCHAR(50) | Y | PK: BIND_{TYPE}_{VARIANT} | BIND_SADDLE_STD |
| binding_name_ko | VARCHAR(100) | Y | 한국어 명칭 | 중철 제본 |
| binding_name_en | VARCHAR(100) | N | 영어 명칭 | Saddle Stitch |
| binding_type | VARCHAR(50) | Y | 제본 유형 | SADDLE |
| min_pages | INTEGER | Y | 최소 페이지 | 8 |
| max_pages | INTEGER | Y | 최대 페이지 | 64 |
| page_unit | INTEGER | Y | 페이지 단위 | 4 |
| cover_required | BOOLEAN | Y | 별도 표지 필요 | FALSE |
| spine_calculation | VARCHAR(100) | N | 등 두께 계산식 | (pages/2)*gsm*0.001 |
| applicable_sizes | TEXT | N | 적용 가능 사이즈 | A4,A5,B5 |
| status | CHAR(1) | Y | 상태 (A/I) | A |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |
| updated_at | DATETIME | Y | 수정일시 | 2026-01-28T10:00:00 |

### 3.6 PRODUCT_MASTER

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| product_code | VARCHAR(50) | Y | PK: PROD_{CAT}_{SEQ} | PROD_DIG_001 |
| product_name_ko | VARCHAR(200) | Y | 한국어 상품명 | 디지털 명함 |
| product_name_en | VARCHAR(200) | N | 영어 상품명 | Digital Business Card |
| category | VARCHAR(50) | Y | 상품 카테고리 | DIG |
| sub_category | VARCHAR(50) | N | 세부 카테고리 | CARD |
| default_paper_code | VARCHAR(50) | N | 기본 용지 코드 | PAPER_ART_250 |
| default_size_code | VARCHAR(50) | N | 기본 사이즈 코드 | SIZE_CARD_STD |
| available_papers | TEXT | N | 선택 가능 용지 | PAPER_ART_*,PAPER_SNOW_* |
| available_sizes | TEXT | N | 선택 가능 사이즈 | SIZE_CARD_* |
| available_finishes | TEXT | N | 선택 가능 후가공 | FINISH_LAM_*,FINISH_UV_* |
| min_quantity | INTEGER | Y | 최소 수량 | 100 |
| quantity_unit | INTEGER | Y | 수량 단위 | 100 |
| lead_time_days | INTEGER | N | 기본 제작일 | 3 |
| description | TEXT | N | 상품 설명 | 고품질 디지털 명함 |
| status | CHAR(1) | Y | 상태 (A/I) | A |
| mes_code | VARCHAR(50) | N | MES 연동 코드 | P001 |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |
| updated_at | DATETIME | Y | 수정일시 | 2026-01-28T10:00:00 |

### 3.7 CODE_DEFINITION

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| code_prefix | VARCHAR(20) | Y | 코드 접두사 | PAPER |
| code_value | VARCHAR(50) | Y | 코드 값 | ART |
| name_ko | VARCHAR(100) | Y | 한국어 설명 | 아트지 |
| name_en | VARCHAR(100) | N | 영어 설명 | Art Paper |
| category | VARCHAR(50) | Y | 상위 카테고리 | PAPER_TYPE |
| parent_code | VARCHAR(50) | N | 상위 코드 | PAPER |
| sort_order | INTEGER | Y | 정렬 순서 | 1 |
| description | TEXT | N | 상세 설명 | 코팅된 광택 용지 |
| status | CHAR(1) | Y | 상태 (A/I) | A |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |
| updated_at | DATETIME | Y | 수정일시 | 2026-01-28T10:00:00 |

### 3.8 MES_CODE_MAPPING (Optional)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| mapping_id | INTEGER | Y | PK: Auto increment | 1 |
| master_type | VARCHAR(20) | Y | 마스터 유형 | PAPER |
| master_code | VARCHAR(50) | Y | 마스터 코드 | PAPER_ART_150 |
| mes_code | VARCHAR(50) | Y | MES 코드 | MP150A |
| mes_name | VARCHAR(100) | N | MES 명칭 | 아트지150 |
| sync_status | CHAR(1) | Y | 동기화 상태 | S |
| last_sync_at | DATETIME | N | 마지막 동기화 | 2026-01-28T10:00:00 |
| created_at | DATETIME | Y | 생성일시 | 2026-01-28T10:00:00 |

---

## 4. Migration Rules

### 4.1 Paper Type Mapping

| Source Term (Korean) | Normalized Code | English Name |
|---------------------|-----------------|--------------|
| 아트지, 아트 | ART | Art Paper |
| 스노우지, 스노우, 스노화이트 | SNOW | Snow White |
| 모조지, 모조 | MOJO | Uncoated |
| 크라프트, 크라프트지 | KRAFT | Kraft |
| 아이보리, 백상지 | IVORY | Ivory Board |
| 랑데뷰, 마시멜로, 빛나래 | SPECIAL | Specialty |
| 누브지, 스타드림 | SPECIAL | Specialty |

### 4.2 Size Normalization

| Source Term | Standard | Normalized Code | Width (mm) | Height (mm) |
|-------------|----------|-----------------|------------|-------------|
| A3 | ISO 216 | SIZE_A3_ISO | 297 | 420 |
| A4 | ISO 216 | SIZE_A4_ISO | 210 | 297 |
| A5 | ISO 216 | SIZE_A5_ISO | 148 | 210 |
| A6 | ISO 216 | SIZE_A6_ISO | 105 | 148 |
| B4 | JIS | SIZE_B4_JIS | 257 | 364 |
| B5 | JIS | SIZE_B5_JIS | 182 | 257 |
| 국전, 국전지 | KS | SIZE_KUKJEON_KS | 636 | 939 |
| 4x6, 46전 | KS | SIZE_46_KS | 788 | 1091 |
| 명함 | CUSTOM | SIZE_CARD_STD | 90 | 50 |

### 4.3 Finish Mapping

| Source Term (Korean) | Category | Normalized Code |
|---------------------|----------|-----------------|
| 유광 라미네이팅, 유광코팅 | LAM | FINISH_LAM_GLOSS |
| 무광 라미네이팅, 무광코팅 | LAM | FINISH_LAM_MATTE |
| 벨벳 라미네이팅 | LAM | FINISH_LAM_VELVET |
| UV코팅, 부분UV | UV | FINISH_UV_SPOT |
| 전면UV | UV | FINISH_UV_FULL |
| 금박, 금색박 | FOIL | FINISH_FOIL_GOLD |
| 은박, 은색박 | FOIL | FINISH_FOIL_SILVER |
| 홀로그램박 | FOIL | FINISH_FOIL_HOLO |
| 엠보싱, 형압 | EMB | FINISH_EMB_STD |
| 도무송 | DIE | FINISH_DIE_STD |
| 타공 | DIE | FINISH_DIE_PUNCH |
| 귀도리 | DIE | FINISH_DIE_ROUND |

### 4.4 Binding Mapping

| Source Term (Korean) | Type | Normalized Code | Page Range |
|---------------------|------|-----------------|------------|
| 중철, 중철제본 | SADDLE | BIND_SADDLE_STD | 8-64 |
| 무선, 무선제본, 떡제본 | PERFECT | BIND_PERFECT_STD | 48-500 |
| 양장, 양장제본 | CASE | BIND_CASE_STD | 100-1000 |
| 와이어, 와이어제본 | WIRE | BIND_WIRE_STD | 10-200 |
| 스프링, 스프링제본 | SPIRAL | BIND_SPIRAL_STD | 10-300 |
| PUR제본 | PUR | BIND_PUR_STD | 100-800 |

---

## 5. Validation Rules

### 5.1 Code Format Validation

```
Pattern: ^[A-Z]+_[A-Z]+(_[A-Z0-9]+)*$
Examples:
  Valid: PAPER_ART_150, SIZE_A4_ISO, FINISH_LAM_GLOSS
  Invalid: paper_art_150, PAPER-ART-150, Paper_Art
```

### 5.2 GSM Validation

- Range: 50 - 500 g/m²
- Common values: 80, 100, 120, 150, 180, 200, 250, 300, 350, 400
- Tolerance: ±5%

### 5.3 Size Validation

- ISO A series: A0 (841x1189) to A10 (26x37)
- JIS B series: B0 (1030x1456) to B10 (32x45)
- Width must be less than Height (Portrait orientation default)
- Bleed typically 3mm for print-ready

### 5.4 Data Integrity Rules

| Rule ID | Description | Action |
|---------|-------------|--------|
| INT-01 | product_code must be unique | Reject duplicate |
| INT-02 | paper_code in PRODUCT must exist in PAPER_MASTER | Validate FK |
| INT-03 | size_code in PRODUCT must exist in SIZE_MASTER | Validate FK |
| INT-04 | finish_code in PRODUCT must exist in FINISH_MASTER | Validate FK |
| INT-05 | binding_code in PRODUCT must exist in BINDING_MASTER | Validate FK |

---

## 6. Industry Standards Reference

### 6.1 JDF/XJDF (Job Definition Format)

- CIP4 표준 기반 인쇄 작업 정의
- 용지, 색상, 제본 등 공정 데이터 교환
- XJDF는 JDF의 간소화 버전 (XML 기반)

### 6.2 ISO 216 (Paper Sizes)

- A series: A0 = 1m² 면적, √2 비율
- 각 크기는 이전 크기의 절반 (A1 = A0/2)
- 국제 표준으로 대부분의 국가에서 채택

### 6.3 GSM (Grams per Square Meter)

- 용지 무게의 국제 표준 단위
- CGATS 표준에 따른 측정 방법
- 두께(μm)와 밀도로 변환 가능

### 6.4 CGATS (Committee for Graphic Arts Technologies Standards)

- 인쇄 산업 표준 정의
- 색상 관리, 품질 측정 기준
- ICC 프로파일 연동

---

## 7. Traceability

### 7.1 Related Documents

- Analysis: `.moai/reports/analysis-2026-01/`
- Standards Research: Industry standards documentation

### 7.2 TAG References

```
[TAG:SPEC-NORMALIZE-001] - Main SPEC reference
[TAG:PAPER_MASTER] - Paper master table
[TAG:SIZE_MASTER] - Size master table
[TAG:FINISH_MASTER] - Finish master table
[TAG:BINDING_MASTER] - Binding master table
[TAG:PRODUCT_MASTER] - Product master table
[TAG:CODE_DEFINITION] - Code definition table
```

---

## 8. Revision Notes

### 8.1 Future Considerations

- [ ] Price master table addition
- [ ] Multi-currency support
- [ ] Real-time MES synchronization
- [ ] API integration for e-commerce platforms

### 8.2 Known Limitations

- Manual initial data migration required
- Google Sheets row limit (10M cells per sheet)
- Apps Script execution time limit (6 minutes)

---

**Document Status**: Planned
**Next Phase**: /moai:2-run SPEC-NORMALIZE-001
**Quality Gate**: TRUST 5 Validation Required
